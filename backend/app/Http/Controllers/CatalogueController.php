<?php

namespace App\Http\Controllers;

use App\Services\QuestionCatalogue;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogueController extends Controller
{
    public function subjects()
    {
        return ['data' => DB::table('subjects')->orderBy('position')->orderBy('id')->get()];
    }

    public function subject(int $subject)
    {
        $record = DB::table('subjects')->find($subject);
        abort_unless($record, 404);
        $chapters = DB::table('chapters as c')->leftJoin('topics as t', 't.chapter_id', '=', 'c.id')->where('c.subject_id', $subject)
            ->select('c.id', 'c.title', 'c.overview', 'c.position')->selectRaw('COUNT(t.id) as topic_count')->groupBy('c.id', 'c.title', 'c.overview', 'c.position')->orderBy('c.position')->orderBy('c.id')->get();

        return ['data' => $record, 'chapters' => $chapters];
    }

    public function chapter(Request $request, int $chapter)
    {
        $record = DB::table('chapters')->find($chapter);
        abort_unless($record, 404);
        $topics = DB::table('topics as t')->leftJoin('lessons as l', fn ($join) => $join->on('l.topic_id', '=', 't.id')->where('l.published', true))
            ->leftJoin('reading_progress as rp', fn ($join) => $join->on('rp.lesson_id', '=', 'l.id')->where('rp.user_id', $request->user()->id))
            ->where('t.chapter_id', $chapter)->orderBy('t.position')->orderBy('t.id')
            ->get(['t.id', 't.title', 't.position', 'l.id as lesson_id', 'l.reading_minutes', 'l.is_demo', 'rp.completed_at', 'rp.position as reading_position']);

        return ['data' => $record, 'topics' => $topics, 'progress' => ['total' => $topics->count(), 'completed' => $topics->whereNotNull('completed_at')->count(), 'reading_minutes' => $topics->sum('reading_minutes')]];
    }

    public function lesson(Request $request, int $lesson)
    {
        $record = DB::table('lessons as l')->join('topics as t', 't.id', '=', 'l.topic_id')->join('chapters as c', 'c.id', '=', 't.chapter_id')
            ->where('l.id', $lesson)->where('l.published', true)->first(['l.*', 't.title', 't.chapter_id', 'c.subject_id']);
        abort_unless($record, 404);
        $user = $request->user()->id;

        return ['data' => $record,
            'sections' => DB::table('lesson_sections')->where('lesson_id', $lesson)->orderBy('position')->get(),
            'progress' => DB::table('reading_progress')->where('user_id', $user)->where('lesson_id', $lesson)->first(),
            'note' => DB::table('lesson_notes')->where('user_id', $user)->where('lesson_id', $lesson)->value('body'),
            'bookmarked' => DB::table('lesson_bookmarks')->where('user_id', $user)->where('lesson_id', $lesson)->exists(),
            'chapter_topics' => DB::table('topics as t')->join('lessons as l', 'l.topic_id', '=', 't.id')->where('t.chapter_id', $record->chapter_id)->where('l.published', true)->orderBy('t.position')->orderBy('t.id')->get(['t.id', 't.title', 'l.id as lesson_id']),
        ];
    }

    public function questions(Request $request, QuestionCatalogue $catalogue)
    {
        $filters = $request->validate(['subject_id' => 'sometimes|integer|min:1', 'chapter_id' => 'sometimes|integer|min:1', 'topic_id' => 'sometimes|integer|min:1', 'exam_id' => 'sometimes|integer|min:1', 'status' => 'sometimes|in:all,new,wrong,skipped', 'per_page' => 'sometimes|integer|min:1|max:50']);
        $page = $catalogue->query($filters, $request->user()->id)->orderBy('q.id')->paginate($filters['per_page'] ?? 20, ['q.id', 'q.topic_id', 'q.text', 'q.source', 'q.verified', 'q.is_demo']);
        $page->setCollection($catalogue->options($page->getCollection()));

        return $page;
    }

    public function exams()
    {
        return ['data' => DB::table('exams')->orderBy('id')->get()];
    }

    public function exam(int $exam)
    {
        $record = DB::table('exams')->find($exam);
        abort_unless($record, 404);

        return ['data' => $record, 'subjects' => DB::table('exam_subject as es')->join('subjects as s', 's.id', '=', 'es.subject_id')->where('es.exam_id', $exam)->orderBy('s.position')->get(['s.id', 's.title', 'es.syllabus'])];
    }

    public function paperFilters(Request $request)
    {
        $filters = $request->validate(['institute_id' => 'sometimes|integer|min:1', 'post_id' => 'sometimes|integer|min:1']);
        $posts = collect();
        $years = collect();
        if (isset($filters['institute_id'])) {
            $posts = DB::table('posts')->where('institute_id', $filters['institute_id'])->orderBy('title')->get(['id', 'title']);
            $years = DB::table('papers')->where('published', true)->whereIn('post_id', $posts->pluck('id'))
                ->when($filters['post_id'] ?? null, fn ($q, $post) => $q->where('post_id', $post))->distinct()->orderByDesc('year')->pluck('year');
        }

        return ['institutes' => DB::table('institutes')->orderBy('title')->get(['id', 'title']), 'posts' => $posts, 'years' => $years];
    }

    public function papers(Request $request)
    {
        $filters = $request->validate(['institute_id' => 'sometimes|integer|min:1', 'post_id' => 'sometimes|integer|min:1', 'exam_id' => 'sometimes|integer|min:1', 'year' => 'sometimes|integer|between:1900,2200', 'per_page' => 'sometimes|integer|between:1,50']);
        $query = DB::table('papers as p')->join('posts as po', 'po.id', '=', 'p.post_id')->where('p.published', true);
        foreach (['institute_id' => 'po.institute_id', 'post_id' => 'p.post_id', 'exam_id' => 'p.exam_id', 'year' => 'p.year'] as $key => $column) {
            if (isset($filters[$key])) {
                $query->where($column, $filters[$key]);
            }
        }

        return $query->orderByDesc('p.year')->orderBy('p.id')->paginate($filters['per_page'] ?? 20, ['p.*', 'po.institute_id', 'po.title as post_title']);
    }

    public function paper(Request $request, int $paper, QuestionCatalogue $catalogue)
    {
        $record = DB::table('papers')->where('published', true)->find($paper);
        abort_unless($record, 404);
        $request->validate(['solutions' => 'sometimes|boolean', 'per_page' => 'sometimes|integer|between:1,50']);
        $columns = ['q.id', 'q.topic_id', 'q.text', 'q.source', 'q.verified', 'q.is_demo', 'pq.position'];
        if ($request->boolean('solutions')) {
            $columns[] = 'q.explanation';
        }
        $page = DB::table('paper_question as pq')->join('questions as q', 'q.id', '=', 'pq.question_id')->where('pq.paper_id', $paper)->where('q.published', true)->orderBy('pq.position')->paginate($request->integer('per_page', 20), $columns);
        $page->setCollection($catalogue->options($page->getCollection(), $request->boolean('solutions')));

        return ['data' => $record, 'questions' => $page];
    }

    public function affairs(Request $request)
    {
        $data = $request->validate(['month' => ['required', 'date_format:Y-m'], 'per_page' => 'sometimes|integer|between:1,50']);
        $start = Carbon::createFromFormat('Y-m-d', $data['month'].'-01')->startOfDay();

        return DB::table('current_affairs')->where('published', true)->where('publication_date', '>=', $start)->where('publication_date', '<', $start->copy()->addMonth())->orderByDesc('publication_date')->orderBy('id')->paginate($data['per_page'] ?? 20);
    }
}
