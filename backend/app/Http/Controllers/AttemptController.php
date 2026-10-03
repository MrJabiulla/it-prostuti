<?php

namespace App\Http\Controllers;

use App\Services\AttemptService;
use App\Services\QuestionCatalogue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AttemptController extends Controller
{
    public function store(Request $request, QuestionCatalogue $catalogue, AttemptService $service)
    {
        $data = $request->validate([
            'request_id' => 'required|uuid', 'mode' => 'required|in:practice,exam',
            'paper_id' => 'sometimes|integer|min:1', 'subject_id' => 'sometimes|integer|min:1',
            'chapter_id' => 'sometimes|integer|min:1', 'topic_id' => 'sometimes|integer|min:1',
            'exam_id' => 'sometimes|integer|min:1', 'current_affair_id' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:all,new,wrong,skipped,due,saved,mistakes', 'count' => 'sometimes|integer|between:1,100',
            'chapter_test' => 'sometimes|boolean', 'title' => 'sometimes|string|max:200',
            'routine_task_id' => 'sometimes|integer|min:1',
            'question_ids' => 'sometimes|array|min:1|max:100', 'question_ids.*' => 'required|integer|distinct|min:1',
            'subject_ids' => 'sometimes|array|min:1|max:100', 'subject_ids.*' => 'required|integer|distinct|exists:subjects,id',
        ]);
        $attempt = DB::transaction(function () use ($request, $data, $catalogue, $service) {
            $user = $request->user()->id;
            DB::table('users')->where('id', $user)->lockForUpdate()->first();
            $existing = DB::table('attempts')->where('user_id', $user)->where('request_id', $data['request_id'])->first();
            if ($existing) {
                return $service->expire($existing);
            }
            $active = DB::table('attempts')->where('user_id', $user)->where('status', 'active')->first();
            if ($active) {
                $active = $service->expire($active);
                abort_if($active->status === 'active', 409, 'Complete your active attempt first.');
            }
            if (isset($data['routine_task_id'])) {
                abort_unless(DB::table('routine_tasks')->where('user_id', $user)->where('id', $data['routine_task_id'])->exists(), 404);
            }
            $paper = null;
            if (isset($data['paper_id'])) {
                $paper = DB::table('papers')->where('published', true)->sharedLock()->find($data['paper_id']);
                abort_unless($paper, 404);
                $ids = DB::table('paper_question')->where('paper_id', $paper->id)->orderBy('position')->pluck('question_id');
                $questions = DB::table('questions as q')->join('topics as t', 't.id', '=', 'q.topic_id')->join('chapters as c', 'c.id', '=', 't.chapter_id')->whereIn('q.id', $ids)->where('q.published', true)->sharedLock()->get(['q.*', 'c.subject_id'])->keyBy('id');
                abort_unless($questions->count() === $ids->count(), 422, 'Paper contains unavailable questions.');
                $questions = $ids->map(fn ($id) => $questions[$id]);
            } else {
                if ($data['chapter_test'] ?? false) {
                    abort_unless(isset($data['chapter_id']) && $data['mode'] === 'exam', 422, 'A chapter test requires an exam and chapter.');
                    $topics = DB::table('topics')->where('chapter_id', $data['chapter_id'])->count();
                    $completed = DB::table('topics as t')->join('lessons as l', 'l.topic_id', '=', 't.id')->join('reading_progress as rp', 'rp.lesson_id', '=', 'l.id')->where('t.chapter_id', $data['chapter_id'])->where('l.published', true)->where('rp.user_id', $user)->whereNotNull('rp.completed_at')->count();
                    abort_unless($topics > 0 && $completed === $topics, 422, 'Complete all chapter lessons first.');
                }
                $questions = $catalogue->query($data, $user)->orderBy('q.id')->limit(isset($data['question_ids']) ? count($data['question_ids']) : ($data['count'] ?? 20))->sharedLock()->get(['q.*', 'c.subject_id']);
                if (isset($data['question_ids'])) {
                    abort_unless($questions->count() === count($data['question_ids']), 422, 'Selected questions are unavailable or do not match the filters.');
                    $byId = $questions->keyBy('id');
                    $questions = collect($data['question_ids'])->map(fn ($id) => $byId[$id]);
                }
            }
            abort_if($questions->isEmpty() || $questions->count() > 500, 422, 'No questions available, or paper exceeds 500 questions.');
            $options = DB::table('question_options')->whereIn('question_id', $questions->pluck('id'))->orderBy('position')->get()->groupBy('question_id');
            $id = (string) Str::uuid();
            $mode = $paper ? 'exam' : $data['mode'];
            DB::table('attempts')->insert(['id' => $id, 'user_id' => $user, 'request_id' => $data['request_id'], 'paper_id' => $paper?->id, 'routine_task_id' => $data['routine_task_id'] ?? null, 'title' => $paper?->title ?? $data['title'] ?? ($data['chapter_test'] ?? false ? 'Chapter test' : ucfirst($mode)), 'mode' => $mode, 'status' => 'active', 'correct_marks' => $paper?->correct_marks ?? 1, 'wrong_penalty' => $paper?->wrong_penalty ?? 0, 'started_at' => now(), 'expires_at' => $mode === 'exam' ? now()->addMinutes($paper?->duration_minutes ?? 20) : null]);
            $rows = [];
            foreach ($questions->values() as $position => $question) {
                $choices = $options->get($question->id, collect())->values();
                abort_unless($choices->count() >= 2 && $choices->where('is_correct', true)->count() === 1, 422, 'Question options are incomplete.');
                $rows[] = ['attempt_id' => $id, 'question_id' => $question->id, 'subject_id' => $question->subject_id, 'position' => $position, 'text' => $question->text, 'options' => $choices->pluck('text')->toJson(), 'correct_option' => $choices->search(fn ($choice) => $choice->is_correct), 'explanation' => $question->explanation, 'source' => $question->source, 'verified' => $question->verified, 'is_demo' => $question->is_demo];
            }
            DB::table('attempt_items')->insert($rows);

            return DB::table('attempts')->find($id);
        });

        return response()->json($service->view($attempt), 201);
    }

    public function show(Request $request, string $attempt, AttemptService $service)
    {
        return $service->view($service->expire($this->owned($request, $attempt)));
    }

    public function answers(Request $request, string $attempt, AttemptService $service)
    {
        $data = $request->validate(['answers' => 'required|array|min:1|max:100', 'answers.*.item_id' => 'required|integer|distinct', 'answers.*.choice' => 'present|nullable|integer|between:0,9', 'answers.*.guess' => 'sometimes|boolean']);
        $record = $service->expire($this->owned($request, $attempt));
        abort_unless($record->status === 'active', 409, 'Attempt is already submitted.');
        $expired = DB::transaction(function () use ($data, $attempt, $service) {
            $record = DB::table('attempts')->where('id', $attempt)->lockForUpdate()->first();
            if ($record->status !== 'active') {
                return true;
            }
            if ($record->expires_at && now()->greaterThanOrEqualTo($record->expires_at)) {
                $service->finish($attempt);

                return true;
            }
            $items = DB::table('attempt_items')->where('attempt_id', $attempt)->whereIn('id', array_column($data['answers'], 'item_id'))->get()->keyBy('id');
            foreach ($data['answers'] as $answer) {
                $item = $items->get($answer['item_id']);
                if (! $item || ($answer['choice'] !== null && $answer['choice'] >= count(json_decode($item->options, true)))) {
                    throw ValidationException::withMessages(['answers' => 'Answer does not belong to this attempt or option is invalid.']);
                }
                if ($record->mode === 'practice' && $item->selected_option !== null && ($item->selected_option !== $answer['choice'] || (isset($answer['guess']) && (bool) $item->guess !== (bool) $answer['guess']))) {
                    throw ValidationException::withMessages(['answers' => 'A revealed practice answer cannot be changed.']);
                }
                DB::table('attempt_items')->where('id', $item->id)->update(['selected_option' => $answer['choice'], 'guess' => $answer['guess'] ?? $item->guess, 'answered_at' => now()]);
            }

            return false;
        });
        abort_if($expired, 409, 'Attempt is already submitted.');

        return $service->view($this->owned($request, $attempt), array_column($data['answers'], 'item_id'));
    }

    public function progress(Request $request, string $attempt, AttemptService $service)
    {
        $data = $request->validate(['current_index' => 'required|integer|min:0', 'current_page' => 'required|integer|between:0,499']);
        $record = $service->expire($this->owned($request, $attempt));
        abort_unless($record->status === 'active', 409, 'Attempt is already submitted.');
        DB::transaction(function () use ($attempt, $data) {
            $record = DB::table('attempts')->where('id', $attempt)->lockForUpdate()->first();
            abort_unless($record->status === 'active' && (! $record->expires_at || now()->lt($record->expires_at)), 409, 'Attempt is already submitted or expired.');
            $count = DB::table('attempt_items')->where('attempt_id', $attempt)->count();
            abort_if($data['current_index'] >= $count || $data['current_page'] >= $count, 422, 'Resume position exceeds this attempt.');
            DB::table('attempts')->where('id', $attempt)->update($data);
        });

        return $service->view($this->owned($request, $attempt));
    }

    public function submit(Request $request, string $attempt, AttemptService $service)
    {
        $record = $this->owned($request, $attempt);

        return $service->view($service->finish($record->id));
    }

    public function index(Request $request)
    {
        $request->validate(['per_page' => 'sometimes|integer|between:1,50']);

        return DB::table('attempts')->where('user_id', $request->user()->id)->orderByDesc('started_at')->orderByDesc('id')->paginate($request->integer('per_page', 20));
    }

    private function owned(Request $request, string $id): object
    {
        abort_unless(Str::isUuid($id), 404);
        $record = DB::table('attempts')->where('user_id', $request->user()->id)->find($id);
        abort_unless($record, 404);

        return $record;
    }
}
