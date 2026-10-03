<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class LearningApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->actingAs(User::factory()->create());
    }

    public function test_catalogue_uses_bounded_queries_and_never_leaks_answers(): void
    {
        DB::enableQueryLog();
        $response = $this->getJson('/api/v1/questions?per_page=30')->assertOk()->assertJsonCount(30, 'data');
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();
        $this->assertLessThanOrEqual(6, $count);
        $this->assertArrayNotHasKey('is_correct', $response->json('data.0.options.0'));
        $response->assertJsonMissingPath('data.0.explanation');
        $this->getJson('/api/v1/questions?per_page=1000')->assertUnprocessable();
    }

    public function test_paper_filters_do_not_fall_back_to_general_questions(): void
    {
        $post = DB::table('posts')->first();
        $paper = DB::table('papers')->where('post_id', $post->id)->first();
        $this->getJson('/api/v1/papers?post_id='.$post->id.'&year='.$paper->year)->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/papers?post_id=999999')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/papers/'.$paper->id)->assertOk()->assertJsonMissingPath('questions.data.0.options.0.is_correct');
        $this->getJson('/api/v1/papers/'.$paper->id.'?solutions=1')->assertOk()->assertJsonStructure(['questions' => ['data' => [['explanation', 'options' => [['is_correct']]]]]]);
    }

    public function test_attempts_are_idempotent_and_snapshot_admin_changes(): void
    {
        $paper = DB::table('papers')->first();
        $key = (string) Str::uuid();
        $attempt = $this->postJson('/api/v1/attempts', ['request_id' => $key, 'mode' => 'exam', 'paper_id' => $paper->id])->assertCreated()->json();
        $this->assertArrayNotHasKey('correct_option', $attempt['items'][0]);
        $this->assertArrayNotHasKey('explanation', $attempt['items'][0]);
        $this->postJson('/api/v1/attempts', ['request_id' => $key, 'mode' => 'exam', 'paper_id' => $paper->id])->assertCreated()->assertJsonPath('data.id', $attempt['data']['id']);
        $this->assertDatabaseCount('attempts', 1);
        $item = DB::table('attempt_items')->where('attempt_id', $attempt['data']['id'])->orderBy('position')->first();
        DB::table('questions')->where('id', $item->question_id)->update(['text' => 'Changed after start']);
        DB::table('papers')->where('id', $paper->id)->update(['correct_marks' => 99]);
        $this->getJson('/api/v1/attempts/'.$attempt['data']['id'])->assertOk()->assertJsonPath('items.0.text', $item->text)->assertJsonPath('data.correct_marks', $attempt['data']['correct_marks']);
    }

    public function test_server_scoring_and_duplicate_submit_do_not_duplicate_progress(): void
    {
        $paper = DB::table('papers')->first();
        $attempt = $this->start(['paper_id' => $paper->id, 'mode' => 'exam']);
        $items = DB::table('attempt_items')->where('attempt_id', $attempt)->orderBy('position')->get();
        $this->putJson('/api/v1/attempts/'.$attempt.'/answers', ['answers' => [['item_id' => $items[0]->id, 'choice' => $items[0]->correct_option], ['item_id' => $items[1]->id, 'choice' => ($items[1]->correct_option + 1) % 4]]])->assertOk();
        $result = $this->postJson('/api/v1/attempts/'.$attempt.'/submit', ['score' => 99999])->assertOk();
        $this->assertEquals((float) $paper->correct_marks - (float) $paper->wrong_penalty, (float) $result->json('data.score'));
        $result->assertJsonPath('data.correct_count', 1)->assertJsonPath('data.wrong_count', 1)->assertJsonPath('data.skipped_count', $items->count() - 2);
        $this->postJson('/api/v1/attempts/'.$attempt.'/submit')->assertOk();
        $this->assertEquals(1, DB::table('question_progress')->max('attempt_count'));
    }

    public function test_deadline_rejects_late_answers_and_submits_saved_answers(): void
    {
        $attempt = $this->start(['mode' => 'exam', 'count' => 2]);
        $item = DB::table('attempt_items')->where('attempt_id', $attempt)->first();
        $this->travel(21)->minutes();
        $this->putJson('/api/v1/attempts/'.$attempt.'/answers', ['answers' => [['item_id' => $item->id, 'choice' => $item->correct_option]]])->assertConflict();
        $this->assertDatabaseHas('attempts', ['id' => $attempt, 'status' => 'submitted', 'correct_count' => 0, 'skipped_count' => 2]);
    }

    public function test_other_users_cannot_read_or_change_an_attempt(): void
    {
        $attempt = $this->start();
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/v1/attempts/'.$attempt)->assertNotFound();
        $this->postJson('/api/v1/attempts/'.$attempt.'/submit')->assertNotFound();
    }

    public function test_invalid_answer_batch_rolls_back_and_practice_answers_cannot_change(): void
    {
        $attempt = $this->start(['count' => 2]);
        $item = DB::table('attempt_items')->where('attempt_id', $attempt)->first();
        $this->putJson('/api/v1/attempts/'.$attempt.'/answers', ['answers' => [['item_id' => $item->id, 'choice' => 0], ['item_id' => 9999999, 'choice' => 0]]])->assertUnprocessable();
        $this->assertDatabaseHas('attempt_items', ['id' => $item->id, 'selected_option' => null]);
        $this->putJson('/api/v1/attempts/'.$attempt.'/answers', ['answers' => [['item_id' => $item->id, 'choice' => 0]]])->assertOk()->assertJsonStructure(['items' => [['correct_option', 'explanation']]]);
        $this->putJson('/api/v1/attempts/'.$attempt.'/answers', ['answers' => [['item_id' => $item->id, 'choice' => 1]]])->assertUnprocessable();
    }

    public function test_reading_notes_and_bookmarks_are_user_scoped(): void
    {
        $lesson = DB::table('lessons')->value('id');
        $this->putJson('/api/v1/lessons/'.$lesson.'/progress', ['position' => 150, 'completed' => true])->assertNoContent();
        $this->putJson('/api/v1/lessons/'.$lesson.'/note', ['body' => 'My own note'])->assertNoContent();
        $this->putJson('/api/v1/lessons/'.$lesson.'/bookmark', ['saved' => true])->assertNoContent();
        $this->getJson('/api/v1/lessons/'.$lesson)->assertOk()->assertJsonPath('note', 'My own note')->assertJsonPath('progress.position', 150)->assertJsonPath('bookmarked', true);
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/v1/lessons/'.$lesson)->assertOk()->assertJsonPath('note', null)->assertJsonPath('progress', null)->assertJsonPath('bookmarked', false);
    }

    public function test_chapter_test_requires_completed_lessons(): void
    {
        $chapter = DB::table('chapters')->value('id');
        $data = ['request_id' => (string) Str::uuid(), 'mode' => 'exam', 'chapter_id' => $chapter, 'chapter_test' => true];
        $this->postJson('/api/v1/attempts', $data)->assertUnprocessable();
        $lessons = DB::table('lessons as l')->join('topics as t', 't.id', '=', 'l.topic_id')->where('t.chapter_id', $chapter)->pluck('l.id');
        foreach ($lessons as $lesson) {
            $this->putJson('/api/v1/lessons/'.$lesson.'/progress', ['position' => 0, 'completed' => true])->assertNoContent();
        }
        $this->postJson('/api/v1/attempts', $data)->assertCreated();
    }

    public function test_routine_dates_validate_and_other_users_cannot_edit_tasks(): void
    {
        $data = ['date' => '2026-10-01', 'title' => 'Read chapter', 'minutes' => 20, 'completed' => false];
        $id = $this->postJson('/api/v1/routine', $data)->assertOk()->json('data.id');
        $this->getJson('/api/v1/routine?from=invalid&to=invalid')->assertUnprocessable();
        $this->getJson('/api/v1/routine?from=2026-01-01&to=2026-12-01')->assertUnprocessable();
        $this->actingAs(User::factory()->create());
        $this->putJson('/api/v1/routine/'.$id, $data)->assertNotFound();
        $this->deleteJson('/api/v1/routine/'.$id)->assertNotFound();
    }

    public function test_drafts_and_invalid_content_are_not_published(): void
    {
        $user = auth()->user();
        $user->forceFill(['role' => 'admin'])->save();
        $topic = DB::table('topics')->value('id');
        $data = ['topic_id' => $topic, 'text' => 'New question', 'explanation' => 'Reason', 'source' => 'Demo', 'is_demo' => true, 'verified' => false, 'published' => true, 'options' => [['text' => 'A', 'is_correct' => true], ['text' => 'B', 'is_correct' => true]]];
        $this->postJson('/api/v1/admin/questions', $data)->assertUnprocessable();
        $data['options'][1]['is_correct'] = false;
        $data['published'] = false;
        $id = $this->postJson('/api/v1/admin/questions', $data)->assertOk()->json('data.id');
        $this->assertNotContains($id, $this->getJson('/api/v1/questions?per_page=50')->json('data.*.id'));
        $data['verified'] = true;
        $this->putJson('/api/v1/admin/questions/'.$id, $data)->assertUnprocessable();
    }

    public function test_private_uploads_are_not_available_until_published(): void
    {
        Storage::fake('local');
        $admin = auth()->user();
        $admin->forceFill(['role' => 'admin'])->save();
        $id = $this->postJson('/api/v1/admin/media', ['file' => UploadedFile::fake()->image('lesson.png')])->assertCreated()->json('data.id');
        $student = User::factory()->create();
        $this->actingAs($student)->get('/api/v1/media/'.$id.'/download')->assertNotFound();
        $this->actingAs($admin)->putJson('/api/v1/admin/media/'.$id, ['published' => true])->assertNoContent();
        $this->actingAs($student)->get('/api/v1/media/'.$id.'/download')->assertOk();
    }

    public function test_dashboard_and_current_affairs_return_screen_data(): void
    {
        $this->getJson('/api/v1/dashboard')->assertOk()->assertJsonStructure(['reading', 'results', 'subjects', 'continue_reading', 'active_attempt', 'recent_results', 'today_tasks']);
        $this->getJson('/api/v1/current-affairs?month=2026-10')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/current-affairs?month=invalid')->assertUnprocessable();
    }

    private function start(array $data = []): string
    {
        return $this->postJson('/api/v1/attempts', $data + ['request_id' => (string) Str::uuid(), 'mode' => 'practice', 'count' => 3])->assertCreated()->json('data.id');
    }
}
