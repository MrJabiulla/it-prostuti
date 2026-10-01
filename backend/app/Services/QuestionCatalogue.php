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
        $status = $filters['status'] ?? 'all';
        if ($status === 'new') {
            $query->whereNotExists(fn ($sub) => $sub->selectRaw('1')->from('question_progress as qp')->whereColumn('qp.question_id', 'q.id')->where('qp.user_id', $userId));
        } elseif (in_array($status, ['wrong', 'skipped'])) {
            $query->whereExists(fn ($sub) => $sub->selectRaw('1')->from('question_progress as qp')->whereColumn('qp.question_id', 'q.id')->where('qp.user_id', $userId)->where('qp.last_status', $status));
        }

        return $query;
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
