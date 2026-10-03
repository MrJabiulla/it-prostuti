<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PreparationController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user()->id;
        $preferences = DB::table('user_preferences')->where('user_id', $user)->first();
        if ($preferences) {
            $preferences->focus_subject_ids = json_decode($preferences->focus_subject_ids ?? '[]', true);
        }
        $today = now()->timezone($preferences->timezone ?? 'Asia/Dhaka')->toDateString();
        $reading = DB::table('reading_progress')->where('user_id', $user)->selectRaw('COUNT(*) as started, COUNT(completed_at) as completed')->first();
        $results = DB::table('attempts')->where('user_id', $user)->where('status', 'submitted')->selectRaw('COUNT(*) as tests, COALESCE(SUM(correct_count),0) as correct, COALESCE(SUM(wrong_count),0) as wrong, COALESCE(SUM(skipped_count),0) as skipped')->first();
        $weak = DB::table('question_progress as qp')->join('questions as q', 'q.id', '=', 'qp.question_id')->join('topics as t', 't.id', '=', 'q.topic_id')->join('chapters as c', 'c.id', '=', 't.chapter_id')->join('subjects as s', 's.id', '=', 'c.subject_id')->where('qp.user_id', $user)->select('s.id', 's.title')->selectRaw("COUNT(*) as attempted, SUM(CASE WHEN qp.last_status = 'correct' THEN 1 ELSE 0 END) as correct")->groupBy('s.id', 's.title')->orderBy('s.id')->get();

        return ['user' => $request->user()->only(['id', 'name', 'email', 'role']), 'preferences' => $preferences, 'reading' => $reading, 'results' => $results, 'subjects' => $weak,
            'continue_reading' => DB::table('reading_progress as rp')->join('lessons as l', 'l.id', '=', 'rp.lesson_id')->join('topics as t', 't.id', '=', 'l.topic_id')->where('rp.user_id', $user)->where('l.published', true)->orderByDesc('rp.updated_at')->first(['l.id', 't.title', 'rp.position', 'rp.completed_at']),
            'active_attempt' => DB::table('attempts')->where('user_id', $user)->where('status', 'active')->orderByDesc('started_at')->first(),
            'recent_results' => DB::table('attempts')->where('user_id', $user)->where('status', 'submitted')->orderByDesc('started_at')->limit(5)->get(),
            'today_tasks' => DB::table('routine_tasks')->where('user_id', $user)->where('date', $today)->orderBy('position')->orderBy('id')->get(),
            'today_plan' => DB::table('routine_plans')->where('user_id', $user)->where('date', $today)->first(),
            'due_count' => DB::table('question_reviews as r')->join('questions as q', 'q.id', '=', 'r.question_id')->where('r.user_id', $user)->where('q.published', true)->where('r.due_at', '<=', now())->count(),
        ];
    }

    public function progress(Request $request, int $lesson)
    {
        $this->published('lessons', $lesson);
        $data = $request->validate(['position' => 'required|integer|between:0,1000000', 'completed' => 'required|boolean']);
        DB::table('reading_progress')->updateOrInsert(['user_id' => $request->user()->id, 'lesson_id' => $lesson], ['position' => $data['position'], 'completed_at' => $data['completed'] ? now() : null, 'updated_at' => now()]);

        return response()->noContent();
    }

    public function note(Request $request, int $lesson)
    {
        $this->published('lessons', $lesson);
        $data = $request->validate(['body' => 'present|nullable|string|max:4000']);
        DB::table('lesson_notes')->updateOrInsert(['user_id' => $request->user()->id, 'lesson_id' => $lesson], ['body' => $data['body'] ?? '', 'updated_at' => now()]);

        return response()->noContent();
    }

    public function lessonBookmark(Request $request, int $lesson)
    {
        return $this->bookmark($request, 'lesson', $lesson);
    }

    public function questionBookmark(Request $request, int $question)
    {
        return $this->bookmark($request, 'question', $question);
    }

    public function revision(Request $request)
    {
        $data = $request->validate(['type' => 'required|in:lessons,questions', 'per_page' => 'sometimes|integer|between:1,50', 'status' => 'sometimes|in:all,due,saved,mistakes']);
        $user = $request->user()->id;
        if ($data['type'] === 'lessons') {
            return DB::table('lessons as l')->join('topics as t', 't.id', '=', 'l.topic_id')
                ->leftJoin('lesson_notes as n', fn ($join) => $join->on('n.lesson_id', '=', 'l.id')->where('n.user_id', $user))
                ->leftJoin('lesson_bookmarks as b', fn ($join) => $join->on('b.lesson_id', '=', 'l.id')->where('b.user_id', $user))
                ->leftJoin('reading_progress as rp', fn ($join) => $join->on('rp.lesson_id', '=', 'l.id')->where('rp.user_id', $user))
                ->where('l.published', true)->where(fn ($q) => $q->whereNotNull('b.user_id')->orWhereNotNull('n.user_id')->orWhereNotNull('rp.completed_at'))
                ->orderBy('l.id')->paginate($data['per_page'] ?? 20, ['l.id', 't.title', 'n.body as note', 'rp.completed_at', 'b.created_at as bookmarked_at']);
        }

        $query = DB::table('questions as q')
            ->leftJoin('question_bookmarks as b', fn ($join) => $join->on('b.question_id', '=', 'q.id')->where('b.user_id', $user))
            ->leftJoin('question_progress as qp', fn ($join) => $join->on('qp.question_id', '=', 'q.id')->where('qp.user_id', $user))
            ->leftJoin('question_reviews as r', fn ($join) => $join->on('r.question_id', '=', 'q.id')->where('r.user_id', $user))
            ->where('q.published', true);
        switch ($data['status'] ?? 'all') {
            case 'due':
                $query->where('r.due_at', '<=', now());
                break;
            case 'saved':
                $query->whereNotNull('b.user_id');
                break;
            case 'mistakes':
                $query->whereNotNull('r.user_id');
                break;
            default:
                $query->where(fn ($q) => $q->whereNotNull('b.user_id')->orWhereNotNull('r.user_id')->orWhereIn('qp.last_status', ['wrong', 'skipped']));
        }

        return $query->orderBy('q.id')->paginate($data['per_page'] ?? 20, ['q.id', 'q.text', 'q.topic_id', 'qp.last_status', 'b.created_at as bookmarked_at', 'r.due_at', 'r.level']);
    }

    public function routine(Request $request)
    {
        $data = $request->validate(['from' => 'required|date_format:Y-m-d', 'to' => 'required|date_format:Y-m-d|after_or_equal:from']);
        abort_if(Carbon::parse($data['from'])->diffInDays($data['to']) > 31, 422, 'Maximum routine range is 31 days.');

        return ['data' => DB::table('routine_tasks')->where('user_id', $request->user()->id)->whereBetween('date', [$data['from'], $data['to']])->orderBy('date')->orderBy('position')->orderBy('id')->get(), 'plans' => DB::table('routine_plans')->where('user_id', $request->user()->id)->whereBetween('date', [$data['from'], $data['to']])->orderBy('date')->get()];
    }

    public function saveTask(Request $request, ?int $task = null)
    {
        $data = $request->validate(['date' => 'required|date_format:Y-m-d'] + $this->taskRules());
        $existing = $task ? DB::table('routine_tasks')->where('user_id', $request->user()->id)->find($task) : null;
        abort_if($task && ! $existing, 404);
        $this->validateTaskSubject($data, $existing);
        $data['completed_at'] = $data['completed'] ? now() : null;
        unset($data['completed']);
        $data['updated_at'] = now();
        if ($task) {
            abort_unless(DB::table('routine_tasks')->where('user_id', $request->user()->id)->where('id', $task)->exists(), 404);
            DB::table('routine_tasks')->where('id', $task)->update($data);
        } else {
            abort_if(DB::table('routine_tasks')->where('user_id', $request->user()->id)->where('date', $data['date'])->count() >= 20, 422, 'Maximum 20 tasks per day.');
            $task = DB::table('routine_tasks')->insertGetId($data + ['user_id' => $request->user()->id, 'created_at' => now()]);
        }

        return ['data' => DB::table('routine_tasks')->find($task)];
    }

    public function deleteTask(Request $request, int $task)
    {
        abort_unless(DB::table('routine_tasks')->where('user_id', $request->user()->id)->where('id', $task)->delete(), 404);

        return response()->noContent();
    }

    public function savePlan(Request $request)
    {
        $rules = [
            'date' => 'required|date_format:Y-m-d', 'goal' => 'required|integer|between:0,10000',
            'minutes' => 'required|integer|between:0,10000', 'custom' => 'required|boolean',
            'tasks' => 'present|array|max:20', 'tasks.*.id' => 'sometimes|integer|distinct',
            'tasks.*.client_id' => 'required|string|max:80|distinct',
        ];
        foreach ($this->taskRules() as $key => $rule) {
            if ($key !== 'client_id') {
                $rules['tasks.*.'.$key] = $rule;
            }
        }
        $data = $request->validate($rules);
        $user = $request->user()->id;
        DB::transaction(function () use ($data, $user) {
            DB::table('users')->where('id', $user)->lockForUpdate()->first();
            $existing = DB::table('routine_tasks')->where('user_id', $user)->where('date', $data['date'])->get();
            $kept = [];
            foreach ($data['tasks'] as $position => $task) {
                $old = isset($task['id']) ? $existing->firstWhere('id', $task['id']) : $existing->firstWhere('client_id', $task['client_id']);
                abort_if(isset($task['id']) && ! $old, 404);
                $this->validateTaskSubject($task, $old);
                $row = collect($task)->only(array_keys($this->taskRules()))->except('completed')->all();
                $row += ['user_id' => $user, 'date' => $data['date']];
                $row['position'] = $position;
                $row['completed_at'] = $task['completed'] ? ($old?->completed_at ?? now()) : null;
                $row['updated_at'] = now();
                if ($old) {
                    DB::table('routine_tasks')->where('id', $old->id)->update($row);
                    $kept[] = $old->id;
                } else {
                    $kept[] = DB::table('routine_tasks')->insertGetId($row + ['created_at' => now()]);
                }
            }
            DB::table('routine_tasks')->where('user_id', $user)->where('date', $data['date'])->whereNotIn('id', $kept)->delete();
            DB::table('routine_plans')->upsert([[
                'user_id' => $user, 'date' => $data['date'], 'goal' => $data['goal'],
                'minutes' => $data['minutes'], 'custom' => $data['custom'], 'created_at' => now(), 'updated_at' => now(),
            ]], ['user_id', 'date'], ['goal', 'minutes', 'custom', 'updated_at']);
        });

        return ['data' => DB::table('routine_plans')->where('user_id', $user)->where('date', $data['date'])->first(),
            'tasks' => DB::table('routine_tasks')->where('user_id', $user)->where('date', $data['date'])->orderBy('position')->get()];
    }

    public function reports(Request $request)
    {
        $request->validate(['per_page' => 'sometimes|integer|between:1,50']);

        return DB::table('question_reports')->where('user_id', $request->user()->id)->orderByDesc('id')->paginate($request->integer('per_page', 20));
    }

    public function report(Request $request, int $question)
    {
        $this->published('questions', $question);
        $data = $request->validate(['type' => 'required|string|max:100', 'detail' => 'present|nullable|string|max:4000']);
        $data['detail'] ??= '';
        $id = DB::table('question_reports')->insertGetId($data + ['user_id' => $request->user()->id, 'question_id' => $question, 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['data' => DB::table('question_reports')->find($id)], 201);
    }

    public function activity(Request $request)
    {
        $request->validate(['per_page' => 'sometimes|integer|between:1,100', 'from' => 'sometimes|date_format:Y-m-d', 'to' => 'sometimes|date_format:Y-m-d'.($request->filled('from') ? '|after_or_equal:from' : '')]);
        $timezone = DB::table('user_preferences')->where('user_id', $request->user()->id)->value('timezone') ?? 'Asia/Dhaka';
        $query = DB::table('attempt_items as i')->join('attempts as a', 'a.id', '=', 'i.attempt_id')
            ->join('questions as q', 'q.id', '=', 'i.question_id')->join('topics as t', 't.id', '=', 'q.topic_id')
            ->where('a.user_id', $request->user()->id)->where('a.status', 'submitted');
        if ($request->filled('from')) {
            $query->whereRaw('COALESCE(i.answered_at, a.submitted_at) >= ?', [Carbon::parse($request->input('from'), $timezone)->utc()]);
        }
        if ($request->filled('to')) {
            $query->whereRaw('COALESCE(i.answered_at, a.submitted_at) < ?', [Carbon::parse($request->input('to'), $timezone)->addDay()->utc()]);
        }
        $page = $query->orderByDesc('a.started_at')->orderByDesc('i.id')->paginate($request->integer('per_page', 50), ['i.id', 'i.attempt_id', 'i.question_id', 'i.subject_id', 'q.topic_id', 't.chapter_id', 'i.selected_option', 'i.is_correct', 'i.guess', 'i.answered_at', 'a.submitted_at']);
        $page->getCollection()->transform(function ($item) use ($timezone) {
            $item->at = $item->answered_at ?? $item->submitted_at;
            $item->day = Carbon::parse($item->at, 'UTC')->timezone($timezone)->toDateString();

            return $item;
        });

        return $page;
    }

    private function taskRules(): array
    {
        return [
            'title' => 'required|string|max:160', 'minutes' => 'required|integer|between:1,480',
            'completed' => 'required|boolean', 'client_id' => 'sometimes|nullable|string|max:80',
            'kind' => 'sometimes|in:review,mixed,subject', 'questions' => 'sometimes|integer|between:0,500',
            'subject_id' => 'sometimes|nullable|integer|exists:subjects,id', 'position' => 'sometimes|integer|between:0,19',
        ];
    }

    private function validateTaskSubject(array $data, ?object $old): void
    {
        $kind = $data['kind'] ?? $old?->kind ?? 'mixed';
        $subject = array_key_exists('subject_id', $data) ? $data['subject_id'] : $old?->subject_id;
        abort_if($kind === 'subject' && ! $subject, 422, 'Subject tasks require a subject_id.');
    }

    private function bookmark(Request $request, string $type, int $id)
    {
        $this->published($type.'s', $id);
        $data = $request->validate(['saved' => 'required|boolean']);
        $key = ['user_id' => $request->user()->id, $type.'_id' => $id];
        if ($data['saved']) {
            DB::table($type.'_bookmarks')->insertOrIgnore($key + ['created_at' => now()]);
        } else {
            DB::table($type.'_bookmarks')->where($key)->delete();
        }

        return response()->noContent();
    }

    private function published(string $table, int $id): void
    {
        abort_unless(DB::table($table)->where('published', true)->where('id', $id)->exists(), 404);
    }
}
