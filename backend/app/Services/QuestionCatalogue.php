<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class QuestionCatalogue
{
    public function query(array $filters, int $userId): Builder
    {
        $query = DB::table('questions as q')->join('topics as t', 't.id', '=', 'q.topic_id')
            ->join('chapters as c', 'c.id', '=', 't.chapter_id')->where('q.published', true);
        foreach (['topic_id' => 'q.topic_id', 'chapter_id' => 't.chapter_id', 'subject_id' => 'c.subject_id'] as $filter => $column) {
            if (isset($filters[$filter])) {
                $query->where($column, $filters[$filter]);
            }
        }
        if (isset($filters['exam_id'])) {
            $query->whereExists(fn ($sub) => $sub->selectRaw('1')->from('paper_question as pq')->join('papers as p', 'p.id', '=', 'pq.paper_id')->whereColumn('pq.question_id', 'q.id')->where('p.published', true)->where('p.exam_id', $filters['exam_id']));
        }
        if (isset($filters['current_affair_id'])) {
            $query->whereExists(fn ($sub) => $sub->selectRaw('1')->from('affair_question as aq')->join('current_affairs as a', 'a.id', '=', 'aq.current_affair_id')->whereColumn('aq.question_id', 'q.id')->where('a.published', true)->where('a.id', $filters['current_affair_id']));
        }
        if (! empty($filters['q'])) {
            $query->whereRaw("q.text LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $filters['q']).'%']);
        }
        if (isset($filters['question_ids'])) {
            $query->whereIn('q.id', $filters['question_ids']);
        }
        if (isset($filters['subject_ids'])) {
            $query->whereIn('c.subject_id', $filters['subject_ids']);
        }
        $status = $filters['status'] ?? 'all';
        if ($status === 'new') {
            $query->whereNotExists(fn ($sub) => $sub->selectRaw('1')->from('question_progress as qp')->whereColumn('qp.question_id', 'q.id')->where('qp.user_id', $userId));
        } elseif (in_array($status, ['wrong', 'skipped'])) {
            $query->whereExists(fn ($sub) => $sub->selectRaw('1')->from('question_progress as qp')->whereColumn('qp.question_id', 'q.id')->where('qp.user_id', $userId)->where('qp.last_status', $status));
        }

        if ($status === 'saved') {
            $query->whereExists(fn ($sub) => $sub->selectRaw('1')->from('question_bookmarks as b')->whereColumn('b.question_id', 'q.id')->where('b.user_id', $userId));
        } elseif (in_array($status, ['due', 'mistakes'])) {
            $query->whereExists(function ($sub) use ($userId, $status) {
                $sub->selectRaw('1')->from('question_reviews as r')->whereColumn('r.question_id', 'q.id')->where('r.user_id', $userId);
                if ($status === 'due') {
                    $sub->where('r.due_at', '<=', now());
                }
            });
        }

        return $query;
    }

    public function metadata($questions)
    {
        $ids = $questions->pluck('id');
        $papers = DB::table('paper_question as pq')->join('papers as p', 'p.id', '=', 'pq.paper_id')
            ->join('exams as e', 'e.id', '=', 'p.exam_id')->join('posts as po', 'po.id', '=', 'p.post_id')
            ->join('institutes as i', 'i.id', '=', 'po.institute_id')
            ->whereIn('pq.question_id', $ids)->where('p.published', true)->orderBy('p.id')
            ->get(['pq.question_id', 'p.id as paper_id', 'p.exam_id', 'e.title as exam', 'po.institute_id', 'i.title as institute', 'p.post_id', 'po.title as post', 'p.year', 'p.stage'])->groupBy('question_id');
        $affairs = DB::table('affair_question as aq')->join('current_affairs as a', 'a.id', '=', 'aq.current_affair_id')
            ->whereIn('aq.question_id', $ids)->where('a.published', true)->get(['aq.question_id', 'a.id'])->groupBy('question_id');
        foreach ($questions as $question) {
            $question->papers = $papers->get($question->id, collect())->values();
            $question->affair_ids = $affairs->get($question->id, collect())->pluck('id');
        }

        return $questions;
    }

    public function options($questions, bool $solutions = false)
    {
        $columns = ['id', 'question_id', 'text', 'position'];
        if ($solutions) {
            $columns[] = 'is_correct';
        }
        $options = DB::table('question_options')->whereIn('question_id', $questions->pluck('id'))->orderBy('position')->get($columns)->groupBy('question_id');

        return $questions->map(function ($question) use ($options) {
            $question->options = $options->get($question->id, collect());

            return $question;
        });
    }
}
