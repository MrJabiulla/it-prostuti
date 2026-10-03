<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreviewContentSeeder extends Seeder
{
    private const SOURCE = 'Synthetic local preview fixture. Not a verified historical question or paper.';

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Preview seeds are only allowed locally or in tests.');
        }

        $data = json_decode(file_get_contents(__DIR__.'/data/preview.json'), true, flags: JSON_THROW_ON_ERROR);
        DB::transaction(function () use ($data) {
            $this->call(DatabaseSeeder::class);
            $subject = $this->record('subjects', ['slug' => 'preview-ict'], ['title' => 'Information and Communication Technology', 'english' => 'Information and Communication Technology', 'bengali' => 'তথ্য ও যোগাযোগ প্রযুক্তি', 'short' => 'ICT', 'symbol' => 'ICT', 'color' => '#1f5f4a', 'position' => 4]);
            foreach ($data['chapters'] as $position => $content) {
                $chapter = $this->record('chapters', ['subject_id' => $subject, 'title' => $content['title']], ['english' => $content['title'], 'overview' => 'Sample study notes and practice questions.', 'position' => $position]);
                $topic = $this->record('topics', ['chapter_id' => $chapter, 'title' => $content['topic']], ['english' => $content['topic'], 'position' => 0]);
                $lesson = $this->record('lessons', ['topic_id' => $topic], ['summary' => 'Review the key concepts in '.$content['topic'].'. These are local sample study notes.', 'reading_minutes' => 5, 'published' => true, 'is_demo' => true]);
                foreach ($content['questions'] as $index => $question) {
                    DB::table('lesson_sections')->insertOrIgnore(['lesson_id' => $lesson, 'position' => $index, 'title' => $question['text'], 'body' => $question['explanation'], 'kind' => 'explanation']);
                    $questionId = $this->record('questions', ['topic_id' => $topic, 'source' => self::SOURCE, 'text' => $question['text']], ['explanation' => $question['explanation'], 'published' => true, 'verified' => false, 'is_demo' => true]);
                    // Rotate options so the correct answer is not always in the same position.
                    $correct = $index % 4;
                    foreach ($question['options'] as $option => $text) {
                        DB::table('question_options')->insertOrIgnore(['question_id' => $questionId, 'position' => ($option + $correct) % 4, 'text' => $text, 'is_correct' => $option === 0]);
                    }
                }
            }

            $subjectIds = DB::table('subjects')->orderBy('id')->pluck('id');
            $generalQuestions = DB::table('questions')->where('is_demo', true)->where('published', true)->where('source', '!=', self::SOURCE)->orderBy('id')->pluck('id');
            $technicalQuestions = DB::table('questions')->where('source', self::SOURCE)->orderBy('id')->pluck('id');
            foreach ($data['institutes'] as [$slug, $title, $examTitle, $postTitle]) {
                $institute = $this->record('institutes', ['slug' => $slug], ['title' => $title]);
                $exam = $this->record('exams', ['slug' => 'preview-'.$slug], ['title' => $examTitle.' · Sample']);
                foreach ($subjectIds as $subjectId) {
                    DB::table('exam_subject')->insertOrIgnore(['exam_id' => $exam, 'subject_id' => $subjectId, 'syllabus' => 'Sample practice coverage; not an official syllabus.']);
                }
                for ($set = 0; $set < 4; $set++) {
                    $post = $this->record('posts', ['institute_id' => $institute, 'title' => $postTitle.' · Sample track '.($set + 1)], []);
                    $paper = $this->record('papers', ['post_id' => $post, 'source' => self::SOURCE, 'title' => $title.' · Sample paper '.($set + 1)], ['exam_id' => $exam, 'year' => 2025 - $set, 'stage' => 'Sample MCQ', 'is_demo' => true, 'verified' => false, 'published' => true, 'duration_minutes' => 15 + $set * 5, 'correct_marks' => 1, 'wrong_penalty' => 0.25]);
                    $pool = in_array($slug, ['power', 'wasa', 'petrobangla', 'gas', 'it'], true) ? $technicalQuestions->merge($generalQuestions) : $generalQuestions->merge($technicalQuestions);
                    foreach ($pool->slice($set * 6, 6 + $set)->values() as $position => $questionId) {
                        DB::table('paper_question')->insertOrIgnore(['paper_id' => $paper, 'question_id' => $questionId, 'position' => $position]);
                    }
                }
            }

            $affairTopic = DB::table('topics')->join('chapters', 'chapters.id', '=', 'topics.chapter_id')->join('subjects', 'subjects.id', '=', 'chapters.subject_id')->where('subjects.slug', 'general-knowledge')->value('topics.id');
            foreach ($data['affairs'] as $index => [$category, $title, $body]) {
                $affair = $this->record('current_affairs', ['source' => self::SOURCE, 'title' => $title], ['body' => $body, 'category' => $category, 'publication_date' => now()->startOfMonth()->addDays($index % now()->day)->toDateString(), 'is_demo' => true, 'published' => true]);
                $question = $this->record('questions', ['topic_id' => $affairTopic, 'source' => self::SOURCE, 'text' => 'Which category best matches this sample briefing: '.$title.'?'], ['explanation' => $body, 'published' => true, 'verified' => false, 'is_demo' => true]);
                foreach (array_column($data['affairs'], 0) as $position => $option) {
                    DB::table('question_options')->insertOrIgnore(['question_id' => $question, 'position' => $position, 'text' => $option, 'is_correct' => $option === $category]);
                }
                DB::table('affair_question')->insertOrIgnore(['current_affair_id' => $affair, 'question_id' => $question]);
            }
            foreach ($data['notices'] as $index => [$title, $meta, $body]) {
                $this->record('notices', ['title' => $title], ['meta' => $meta, 'body' => $body, 'published' => true, 'publication_at' => now()->subDays($index)]);
            }
        });
    }

    private function record(string $table, array $identity, array $values): int
    {
        $existing = DB::table($table)->where($identity)->value('id');
        if ($existing !== null) {
            return (int) $existing;
        }

        return DB::table($table)->insertGetId($identity + $values + ['created_at' => now(), 'updated_at' => now()]);
    }
}
