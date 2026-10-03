<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminContentController extends Controller
{
    public function index(Request $request, string $resource)
    {
        abort_unless(in_array($resource, ['lessons', 'questions', 'papers', 'current_affairs', 'notices']), 404);
        $request->validate(['per_page' => 'sometimes|integer|between:1,100']);

        return DB::table($resource)->orderByDesc('id')->paginate($request->integer('per_page', 20));
    }

    public function show(string $resource, int $id)
    {
        abort_unless(in_array($resource, ['lessons', 'questions', 'papers', 'current_affairs', 'notices']), 404);
        $record = DB::table($resource)->find($id);
        abort_unless($record, 404);
        $related = match ($resource) {
            'lessons' => ['sections' => DB::table('lesson_sections')->where('lesson_id', $id)->orderBy('position')->get()],
            'questions' => ['options' => DB::table('question_options')->where('question_id', $id)->orderBy('position')->get()],
            'papers' => ['question_ids' => DB::table('paper_question')->where('paper_id', $id)->orderBy('position')->pluck('question_id')],
            'notices' => [],
            'current_affairs' => ['question_ids' => DB::table('affair_question')->where('current_affair_id', $id)->pluck('question_id')],
        };

        return ['data' => $record] + $related;
    }

    public function lesson(Request $request, ?int $id = null)
    {
        $data = $request->validate([
            'topic_id' => ['required', 'integer', 'exists:topics,id', Rule::unique('lessons')->ignore($id)],
            'summary' => 'required|string|max:10000', 'reading_minutes' => 'required|integer|between:1,240',
            'published' => 'required|boolean', 'is_demo' => 'required|boolean',
            'sections' => 'required|array|min:1|max:50', 'sections.*.title' => 'required|string|max:200',
            'sections.*.kind' => 'required|in:explanation,example,formula,important,mistake',
            'sections.*.body' => 'required|string|max:20000', 'sections.*.media_file_id' => ['nullable', 'integer', Rule::exists('media_files', 'id')->where('published', true)],
        ]);
        $sections = $data['sections'];
        unset($data['sections']);
        $id = DB::transaction(function () use ($id, $data, $sections) {
            $id = $this->save('lessons', $id, $data);
            DB::table('lesson_sections')->where('lesson_id', $id)->delete();
            DB::table('lesson_sections')->insert(array_map(fn ($section, $position) => ['lesson_id' => $id, 'title' => $section['title'], 'kind' => $section['kind'], 'body' => $section['body'], 'media_file_id' => $section['media_file_id'] ?? null, 'position' => $position], $sections, array_keys($sections)));

            return $id;
        });

        return $this->show('lessons', $id);
    }

    public function question(Request $request, ?int $id = null)
    {
        $data = $request->validate([
            'topic_id' => 'required|integer|exists:topics,id', 'text' => 'required|string|max:10000',
            'explanation' => 'required|string|max:20000', 'source' => 'required|string|max:2000',
            'verified' => 'required|boolean', 'is_demo' => 'required|boolean', 'published' => 'required|boolean',
            'options' => 'required|array|min:2|max:10', 'options.*.text' => 'required|string|max:2000', 'options.*.is_correct' => 'required|boolean',
        ]);
        if (collect($data['options'])->filter(fn ($option) => (bool) $option['is_correct'])->count() !== 1) {
            throw ValidationException::withMessages(['options' => 'Exactly one correct option is required.']);
        }
        $this->publication($data);
        $choices = $data['options'];
        unset($data['options']);
        $id = DB::transaction(function () use ($id, $data, $choices) {
            if ($id) {
                abort_unless(DB::table('questions')->where('id', $id)->lockForUpdate()->first(), 404);
            }
            if ($id && ! $data['published']) {
                abort_if(DB::table('paper_question as pq')->join('papers as p', 'p.id', '=', 'pq.paper_id')->where('pq.question_id', $id)->where('p.published', true)->exists(), 409, 'Unpublish linked papers before this question.');
            }
            $id = $this->save('questions', $id, $data);
            DB::table('question_options')->where('question_id', $id)->delete();
            DB::table('question_options')->insert(array_map(fn ($choice, $position) => ['question_id' => $id, 'text' => $choice['text'], 'is_correct' => (bool) $choice['is_correct'], 'position' => $position], $choices, array_keys($choices)));

            return $id;
        });

        return $this->show('questions', $id);
    }

    public function paper(Request $request, ?int $id = null)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200', 'exam_id' => 'required|integer|exists:exams,id', 'post_id' => 'required|integer|exists:posts,id',
            'year' => 'required|integer|between:1900,2200', 'stage' => 'required|string|max:80', 'source' => 'required|string|max:2000',
            'verified' => 'required|boolean', 'is_demo' => 'required|boolean', 'published' => 'required|boolean',
            'duration_minutes' => 'required|integer|between:1,360', 'correct_marks' => 'required|numeric|min:0.01|max:100|decimal:0,2', 'wrong_penalty' => 'required|numeric|min:0|max:100|decimal:0,2',
            'question_ids' => 'required|array|min:1|max:500', 'question_ids.*' => 'required|integer|distinct|exists:questions,id',
        ]);
        $this->publication($data);
        $questions = $data['question_ids'];
        unset($data['question_ids']);
        $id = DB::transaction(function () use ($id, $data, $questions) {
            if ($id) {
                abort_unless(DB::table('papers')->where('id', $id)->lockForUpdate()->first(), 404);
            }
            $rows = DB::table('questions')->whereIn('id', $questions)->orderBy('id')->lockForUpdate()->get();
            if ($data['published']) {
                abort_unless($rows->every(fn ($q) => $q->published), 422, 'Publish all paper questions first.');
            }
            if (! $data['is_demo']) {
                abort_if($rows->contains(fn ($q) => $q->is_demo), 422, 'A real paper cannot contain demo questions.');
            }
            $id = $this->save('papers', $id, $data);
            DB::table('paper_question')->where('paper_id', $id)->delete();
            DB::table('paper_question')->insert(array_map(fn ($question, $position) => ['paper_id' => $id, 'question_id' => $question, 'position' => $position], $questions, array_keys($questions)));

            return $id;
        });

        return $this->show('papers', $id);
    }

    public function affair(Request $request, ?int $id = null)
    {
        $data = $request->validate(['title' => 'required|string|max:200', 'body' => 'required|string|max:30000', 'source' => 'required|string|max:2000', 'publication_date' => 'required|date_format:Y-m-d', 'category' => 'sometimes|nullable|string|max:100', 'is_demo' => 'required|boolean', 'published' => 'required|boolean', 'question_ids' => 'present|array|max:50', 'question_ids.*' => ['required', 'integer', 'distinct', Rule::exists('questions', 'id')->where('published', true)]]);
        $ids = $data['question_ids'];
        unset($data['question_ids']);
        $id = DB::transaction(function () use ($id, $data, $ids) {
            $id = $this->save('current_affairs', $id, $data);
            DB::table('affair_question')->where('current_affair_id', $id)->delete();
            if ($ids) {
                DB::table('affair_question')->insert(array_map(fn ($question) => ['current_affair_id' => $id, 'question_id' => $question], $ids));
            }

            return $id;
        });

        return $this->show('current_affairs', $id);
    }

    public function notice(Request $request, ?int $id = null)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200', 'meta' => 'nullable|string|max:255',
            'body' => 'nullable|string|max:10000', 'published' => 'required|boolean',
            'publication_at' => 'nullable|date',
        ]);
        if (! empty($data['publication_at'])) {
            $data['publication_at'] = Carbon::parse($data['publication_at'])->utc();
        }
        $id = DB::transaction(fn () => $this->save('notices', $id, $data));

        return $this->show('notices', $id);
    }

    private function publication(array $data): void
    {
        if ($data['is_demo'] && $data['verified']) {
            throw ValidationException::withMessages(['verified' => 'Demo content cannot be marked verified.']);
        }
        if ($data['published'] && ! $data['verified'] && ! $data['is_demo']) {
            throw ValidationException::withMessages(['published' => 'Verify real content before publishing.']);
        }
    }

    private function save(string $table, ?int $id, array $data): int
    {
        if ($id) {
            abort_unless(DB::table($table)->where('id', $id)->lockForUpdate()->first(), 404);
            DB::table($table)->where('id', $id)->update($data + ['updated_at' => now()]);

            return $id;
        }

        return DB::table($table)->insertGetId($data + ['created_at' => now(), 'updated_at' => now()]);
    }
}
