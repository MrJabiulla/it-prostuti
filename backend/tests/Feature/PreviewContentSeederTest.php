<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PreviewContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PreviewContentSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_preview_content_is_linked_visible_and_repeatable_without_overwriting_existing_data(): void
    {
        $this->seed(DatabaseSeeder::class);
        DB::table('subjects')->update(['short' => null]);
        $question = DB::table('questions')->first();
        DB::table('questions')->where('id', $question->id)->update(['explanation' => 'Preserve editorial changes']);
        $this->seed(PreviewContentSeeder::class);
        $tables = ['subjects', 'chapters', 'topics', 'lessons', 'lesson_sections', 'questions', 'question_options', 'institutes', 'posts', 'exams', 'exam_subject', 'papers', 'paper_question', 'current_affairs', 'affair_question', 'notices'];
        $counts = collect($tables)->mapWithKeys(fn ($table) => [$table => DB::table($table)->count()])->all();
        $this->seed(PreviewContentSeeder::class);
        foreach ($counts as $table => $count) {
            $this->assertDatabaseCount($table, $count);
        }
        $this->assertDatabaseHas('questions', ['id' => $question->id, 'explanation' => 'Preserve editorial changes']);
        $this->assertDatabaseCount('institutes', 9);
        $this->assertDatabaseCount('notices', 6);
        $this->assertDatabaseCount('current_affairs', 6);
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/v1/papers/filters')->assertOk()->assertJsonCount(9, 'institutes');
        $this->getJson('/api/v1/notices')->assertOk()->assertJsonCount(6, 'data');
        foreach (DB::table('institutes')->get() as $institute) {
            $papers = $this->getJson('/api/v1/papers?institute_id='.$institute->id)->assertOk()->json('data');
            $this->assertGreaterThanOrEqual(4, count($papers));
            $this->assertLessThanOrEqual(10, count($papers));
            foreach ($papers as $paper) {
                $this->assertTrue((bool) $paper['is_demo']);
                $this->assertFalse((bool) $paper['verified']);
                $questions = DB::table('paper_question')->where('paper_id', $paper['id'])->pluck('question_id');
                $this->assertGreaterThanOrEqual(4, $questions->count());
                $this->assertLessThanOrEqual(10, $questions->count());
                foreach ($questions as $questionId) {
                    $this->assertEquals(4, DB::table('question_options')->where('question_id', $questionId)->count());
                    $this->assertEquals(1, DB::table('question_options')->where('question_id', $questionId)->where('is_correct', true)->count());
                }
            }
        }
    }
}
