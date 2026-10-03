<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AttemptService
{
    public function finish(string $id): object
    {
        return DB::transaction(function () use ($id) {
            $attempt = DB::table('attempts')->where('id', $id)->lockForUpdate()->first();
            abort_unless($attempt, 404);
            if ($attempt->status === 'submitted') {
                return $attempt;
            }
            $items = DB::table('attempt_items')->where('attempt_id', $id)->orderBy('position')->get();
            $correct = 0;
            $wrong = 0;
            $progress = DB::table('question_progress')->where('user_id', $attempt->user_id)->whereIn('question_id', $items->pluck('question_id'))->get()->keyBy('question_id');
            $reviews = DB::table('question_reviews')->where('user_id', $attempt->user_id)->whereIn('question_id', $items->pluck('question_id'))->get()->keyBy('question_id');
            $reviewUpdates = [];
            $updates = [];
            foreach ($items as $item) {
                $isCorrect = $item->selected_option !== null && $item->selected_option === $item->correct_option;
                $status = $item->selected_option === null ? 'skipped' : ($isCorrect ? 'correct' : 'wrong');
                $correct += (int) $isCorrect;
                $wrong += (int) ($status === 'wrong');
                $review = $reviews->get($item->question_id);
                if (! $isCorrect || $item->guess) {
                    $reviewUpdates[] = ['user_id' => $attempt->user_id, 'question_id' => $item->question_id, 'due_at' => now(), 'level' => 0];
                } elseif ($review) {
                    $level = min($review->level + 1, 4);
                    $reviewUpdates[] = ['user_id' => $attempt->user_id, 'question_id' => $item->question_id, 'due_at' => now()->addDays([1, 3, 7, 21][$level - 1]), 'level' => $level];
                }
                $updates[] = ['user_id' => $attempt->user_id, 'question_id' => $item->question_id, 'last_status' => $status, 'attempt_count' => ($progress->get($item->question_id)?->attempt_count ?? 0) + 1, 'last_attempted_at' => now()];
            }
            if ($reviewUpdates) {
                DB::table('question_reviews')->upsert($reviewUpdates, ['user_id', 'question_id'], ['due_at', 'level']);
            }
            if ($attempt->routine_task_id) {
                DB::table('routine_tasks')->where('user_id', $attempt->user_id)->where('id', $attempt->routine_task_id)->update(['completed_at' => now(), 'updated_at' => now()]);
            }
            DB::table('question_progress')->upsert($updates, ['user_id', 'question_id'], ['last_status', 'attempt_count', 'last_attempted_at']);
            DB::table('attempt_items')->where('attempt_id', $id)->update(['is_correct' => DB::raw('COALESCE(selected_option = correct_option, false)')]);
            // Integer hundredths avoid floating point accumulation in financial-style marks.
            $score = ($correct * (int) round((float) $attempt->correct_marks * 100) - $wrong * (int) round((float) $attempt->wrong_penalty * 100)) / 100;
            $finished = $attempt->expires_at && now()->greaterThan($attempt->expires_at) ? $attempt->expires_at : now();
            DB::table('attempts')->where('id', $id)->update(['status' => 'submitted', 'score' => $score, 'correct_count' => $correct, 'wrong_count' => $wrong, 'skipped_count' => $items->count() - $correct - $wrong, 'submitted_at' => $finished]);

            return DB::table('attempts')->find($id);
        });
    }

    public function expire(object $attempt): object
    {
        if ($attempt->status === 'active' && $attempt->expires_at && now()->greaterThanOrEqualTo($attempt->expires_at)) {
            return $this->finish($attempt->id);
        }

        return $attempt;
    }

    public function view(object $attempt, ?array $itemIds = null): array
    {
        $items = DB::table('attempt_items')->where('attempt_id', $attempt->id)->when($itemIds !== null, fn ($query) => $query->whereIn('id', $itemIds))->orderBy('position')->get();
        $items->transform(function ($item) use ($attempt) {
            $item->options = json_decode($item->options, true, flags: JSON_THROW_ON_ERROR);
            $reveal = $attempt->status === 'submitted' || ($attempt->mode === 'practice' && $item->selected_option !== null);
            if (! $reveal) {
                unset($item->correct_option, $item->explanation, $item->is_correct);
            } else {
                $item->is_correct = $item->selected_option !== null && $item->selected_option === $item->correct_option;
            }

            return $item;
        });
        $subjects = $attempt->status === 'submitted' ? $items->groupBy('subject_id')->map(fn ($rows, $subject) => ['subject_id' => $subject, 'total' => $rows->count(), 'correct' => $rows->where('is_correct', true)->count()])->values() : [];

        return ['data' => $attempt, 'items' => $items, 'subjects' => $subjects, 'server_time' => now()->toIso8601String()];
    }
}
