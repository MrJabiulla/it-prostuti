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
        $reading = DB::table('reading_progress')->where('user_id', $user)->selectRaw('COUNT(*) as started, COUNT(completed_at) as completed')->first();
        $results = DB::table('attempts')->where('user_id', $user)->where('status', 'submitted')->selectRaw('COUNT(*) as tests, COALESCE(SUM(correct_count),0) as correct, COALESCE(SUM(wrong_count),0) as wrong, COALESCE(SUM(skipped_count),0) as skipped')->first();
        $weak = DB::table('question_progress as qp')->join('questions as q', 'q.id', '=', 'qp.question_id')->join('topics as t', 't.id', '=', 'q.topic_id')->join('chapters as c', 'c.id', '=', 't.chapter_id')->join('subjects as s', 's.id', '=', 'c.subject_id')->where('qp.user_id', $user)->select('s.id', 's.title')->selectRaw("COUNT(*) as attempted, SUM(CASE WHEN qp.last_status = 'correct' THEN 1 ELSE 0 END) as correct")->groupBy('s.id', 's.title')->orderBy('s.id')->get();

        return ['user' => $request->user()->only(['id', 'name', 'email', 'role']), 'preferences' => DB::table('user_preferences')->where('user_id', $user)->first(), 'reading' => $reading, 'results' => $results, 'subjects' => $weak,
            'continue_reading' => DB::table('reading_progress as rp')->join('lessons as l', 'l.id', '=', 'rp.lesson_id')->join('topics as t', 't.id', '=', 'l.topic_id')->where('rp.user_id', $user)->where('l.published', true)->orderByDesc('rp.updated_at')->first(['l.id', 't.title', 'rp.position', 'rp.completed_at']),
            'active_attempt' => DB::table('attempts')->where('user_id', $user)->where('status', 'active')->orderByDesc('started_at')->first(),
            'recent_results' => DB::table('attempts')->where('user_id', $user)->where('status', 'submitted')->orderByDesc('started_at')->limit(5)->get(),
            'today_tasks' => DB::table('routine_tasks')->where('user_id', $user)->where('date', now()->toDateString())->orderBy('id')->get(),
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
        $data = $request->validate(['type' => 'required|in:lessons,questions', 'per_page' => 'sometimes|integer|between:1,50']);
        $user = $request->user()->id;
        if ($data['type'] === 'lessons') {
            return DB::table('lessons as l')->join('topics as t', 't.id', '=', 'l.topic_id')
                ->leftJoin('lesson_notes as n', fn ($join) => $join->on('n.lesson_id', '=', 'l.id')->where('n.user_id', $user))
                ->leftJoin('lesson_bookmarks as b', fn ($join) => $join->on('b.lesson_id', '=', 'l.id')->where('b.user_id', $user))
                ->leftJoin('reading_progress as rp', fn ($join) => $join->on('rp.lesson_id', '=', 'l.id')->where('rp.user_id', $user))
                ->where('l.published', true)->where(fn ($q) => $q->whereNotNull('b.user_id')->orWhereNotNull('n.user_id')->orWhereNotNull('rp.completed_at'))
                ->orderBy('l.id')->paginate($data['per_page'] ?? 20, ['l.id', 't.title', 'n.body as note', 'rp.completed_at', 'b.created_at as bookmarked_at']);
        }

        return DB::table('questions as q')->leftJoin('question_bookmarks as b', fn ($join) => $join->on('b.question_id', '=', 'q.id')->where('b.user_id', $user))
            ->leftJoin('question_progress as qp', fn ($join) => $join->on('qp.question_id', '=', 'q.id')->where('qp.user_id', $user))
            ->where('q.published', true)->where(fn ($q) => $q->whereNotNull('b.user_id')->orWhereIn('qp.last_status', ['wrong', 'skipped']))
            ->orderBy('q.id')->paginate($data['per_page'] ?? 20, ['q.id', 'q.text', 'q.topic_id', 'qp.last_status', 'b.created_at as bookmarked_at']);
    }

    public function routine(Request $request)
    {
        $data = $request->validate(['from' => 'required|date_format:Y-m-d', 'to' => 'required|date_format:Y-m-d|after_or_equal:from']);
        abort_if(Carbon::parse($data['from'])->diffInDays($data['to']) > 31, 422, 'Maximum routine range is 31 days.');

        return ['data' => DB::table('routine_tasks')->where('user_id', $request->user()->id)->whereBetween('date', [$data['from'], $data['to']])->orderBy('date')->orderBy('id')->get()];
    }

    public function saveTask(Request $request, ?int $task = null)
    {
        $data = $request->validate(['date' => 'required|date_format:Y-m-d', 'title' => 'required|string|max:160', 'minutes' => 'required|integer|between:1,480', 'completed' => 'required|boolean']);
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
