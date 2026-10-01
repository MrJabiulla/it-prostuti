<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Demo seeds are only allowed locally or in tests.');
        }
        if (DB::table('subjects')->exists()) {
            return;
        }
        $data = json_decode(file_get_contents(__DIR__.'/data/demo.json'), true, flags: JSON_THROW_ON_ERROR);
        DB::transaction(function () use ($data) {
            $subjects = [];
            $topics = [];
            foreach ($data['subjects'] as $s => $subject) {
                $subjects[$s] = $this->insert('subjects', ['title' => $subject['name'], 'slug' => Str::slug($subject['short']), 'position' => $s]);
                foreach ($subject['chapters'] as $c => $chapter) {
                    $chapterId = $this->insert('chapters', ['subject_id' => $subjects[$s], 'title' => $chapter['title'], 'overview' => 'Local demo chapter. Content requires editorial review.', 'position' => $c]);
                    foreach ($chapter['topics'] as $t => $topic) {
                        $id = $this->insert('topics', ['chapter_id' => $chapterId, 'title' => $topic['name'], 'position' => $t]);
                        $topics[$s][$topic['name']] = $id;
                        $note = $data['lessons'][$topic['name']];
                        $lesson = $this->insert('lessons', ['topic_id' => $id, 'summary' => $note['summary'], 'reading_minutes' => max(1, (int) $note['readTime']), 'published' => true, 'is_demo' => true]);
                        foreach ($note['points'] as $position => $section) {
                            DB::table('lesson_sections')->insert(['lesson_id' => $lesson, 'title' => $section['label'], 'body' => $section['desc'], 'kind' => 'explanation', 'position' => $position]);
                        }
                    }
                }
            }
            $questions = [];
            foreach ($data['questions'] as $question) {
                $topic = $topics[$question['subject']][$question['topic']] ?? null;
                if (! $topic) {
                    throw new \RuntimeException('Missing topic for demo question: '.$question['topic']);
                }
                $id = $this->insert('questions', ['topic_id' => $topic, 'text' => $question['text'], 'explanation' => $question['explanation'], 'source' => 'Local demo fixture. Not a verified historical question.', 'published' => true, 'verified' => false, 'is_demo' => true]);
                $questions[$question['text']] = $id;
                foreach ($question['options'] as $position => $text) {
                    DB::table('question_options')->insert(['question_id' => $id, 'text' => $text, 'position' => $position, 'is_correct' => $position === $question['answer']]);
                }
            }
            $exams = [];
            $posts = [];
            foreach ($data['exams'] as $exam) {
                $id = $this->insert('exams', ['title' => $exam['name'], 'slug' => Str::slug($exam['name'])]);
                $exams[$exam['name']] = $id;
                $institute = $this->insert('institutes', ['title' => strtoupper($exam['institute']), 'slug' => $exam['institute']]);
                $posts[$exam['institute']] = $this->insert('posts', ['institute_id' => $institute, 'title' => $exam['post']]);
                foreach ($exam['subjects'] as $subject) {
                    DB::table('exam_subject')->insert(['exam_id' => $id, 'subject_id' => $subjects[$subject], 'syllabus' => 'Demo subject coverage; not an official syllabus.']);
                }
            }
            foreach ($data['papers'] as $paper) {
                $id = $this->insert('papers', ['exam_id' => $exams[$paper['exam']], 'post_id' => $posts[$paper['institute']], 'title' => $paper['title'], 'year' => $paper['year'], 'stage' => $paper['stage'], 'source' => $paper['source'], 'is_demo' => true, 'verified' => false, 'published' => true, 'duration_minutes' => $paper['rules']['minutes'], 'correct_marks' => $paper['rules']['marks'], 'wrong_penalty' => $paper['rules']['penalty']]);
                foreach ($paper['questionTexts'] as $position => $text) {
                    DB::table('paper_question')->insert(['paper_id' => $id, 'question_id' => $questions[$text], 'position' => $position]);
                }
            }
            foreach ($data['affairs'] as $article) {
                $id = $this->insert('current_affairs', ['title' => $article['title'], 'body' => $article['text'], 'source' => $article['source'], 'publication_date' => $article['date'], 'is_demo' => true, 'published' => true]);
                $question = $this->insert('questions', ['topic_id' => array_values($topics[3])[0], 'text' => $article['question'], 'explanation' => $article['text'], 'source' => $article['source'], 'is_demo' => true, 'verified' => false, 'published' => true]);
                foreach ($article['options'] as $position => $text) {
                    DB::table('question_options')->insert(['question_id' => $question, 'text' => $text, 'position' => $position, 'is_correct' => $position === $article['answer']]);
                }
                DB::table('affair_question')->insert(['current_affair_id' => $id, 'question_id' => $question]);
            }
        });
    }

    private function insert(string $table, array $data): int
    {
        return DB::table($table)->insertGetId($data + ['created_at' => now(), 'updated_at' => now()]);
    }
}
