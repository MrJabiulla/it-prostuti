<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class FrontendCoverageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->actingAs(User::factory()->create());
    }

    public function test_extended_preferences_round_trip_and_legacy_updates_preserve_them(): void
    {
        $subject = DB::table('subjects')->value('id');
        $base = ['name' => 'Student', 'daily_minutes' => 30, 'daily_questions' => 10, 'theme' => 'light', 'font_size' => 'extra', 'reminder' => true, 'reminder_time' => '20:00', 'timezone' => 'Asia/Dhaka'];
        $extra = ['focus_subject_ids' => [$subject], 'low_data' => true, 'streak_alert' => false, 'theme_chosen' => true, 'reader_size' => 24, 'last_lesson_id' => DB::table('lessons')->value('id'), 'selected_paper_id' => DB::table('papers')->value('id')];
        $this->putJson('/api/v1/me', $base + $extra)->assertOk()->assertJsonPath('preferences.focus_subject_ids', [$subject])->assertJsonPath('preferences.reader_size', 24);
        $this->putJson('/api/v1/me', $base)->assertOk()->assertJsonPath('preferences.focus_subject_ids', [$subject])->assertJsonPath('preferences.font_size', 'extra');
        $this->getJson('/api/v1/dashboard')->assertOk()->assertJsonPath('preferences.focus_subject_ids', [$subject]);
        $this->putJson('/api/v1/me', $base + ['focus_subject_ids' => [999999]])->assertUnprocessable();
        $this->putJson('/api/v1/me', $base + ['focus_subject_ids' => []])->assertOk()->assertJsonPath('preferences.focus_subject_ids', []);
        $this->actingAs(User::factory()->create())->getJson('/api/v1/me')->assertOk()->assertJsonPath('preferences', null);
    }

    public function test_catalogue_metadata_and_study_solutions_are_available(): void
    {
        $subject = DB::table('subjects')->first();
        $this->getJson('/api/v1/subjects')->assertOk()->assertJsonPath('data.0.short', $subject->short);
        $this->getJson('/api/v1/subjects/'.$subject->id)->assertOk()->assertJsonStructure(['chapters' => [['english', 'bengali']]]);
        $this->getJson('/api/v1/questions?solutions=1')->assertOk()->assertJsonStructure(['data' => [['subject_id', 'chapter_id', 'topic', 'papers', 'affair_ids', 'explanation', 'options' => [['is_correct']]]]]);
        $this->getJson('/api/v1/current-affairs?month=2026-10&solutions=1')->assertOk()->assertJsonStructure(['data' => [['category', 'questions' => [['text', 'options' => [['is_correct']]]]]]]);
        $this->getJson('/api/v1/current-affairs?month=2026-10')->assertOk()->assertJsonMissingPath('data.0.questions.0.options.0.is_correct');
    }

    public function test_admin_can_edit_new_metadata_and_notices_respect_publication(): void
    {
        $student = auth()->user();
        $admin = User::factory()->create(['role' => 'admin']);
        $this->postJson('/api/v1/admin/notices', [])->assertForbidden();
        $this->actingAs($admin);
        $id = $this->postJson('/api/v1/admin/catalogue/subjects', ['title' => 'Science', 'slug' => 'science-extra', 'position' => 10, 'english' => 'Science', 'bengali' => 'বিজ্ঞান', 'short' => 'SCI', 'symbol' => 'S', 'color' => '#abcdef'])->assertOk()->json('data.id');
        $this->getJson('/api/v1/subjects/'.$id)->assertOk()->assertJsonPath('data.bengali', 'বিজ্ঞান');
        $notice = ['title' => 'Mock test', 'meta' => 'Friday · 10:00 AM', 'body' => 'Bring your notes', 'published' => false, 'publication_at' => now()->toISOString()];
        $id = $this->postJson('/api/v1/admin/notices', $notice)->assertOk()->json('data.id');
        $this->actingAs($student)->getJson('/api/v1/notices')->assertOk()->assertJsonCount(0, 'data');
        $notice['published'] = true;
        $notice['publication_at'] = now()->addDay()->toISOString();
        $this->actingAs($admin)->putJson('/api/v1/admin/notices/'.$id, $notice)->assertOk();
        $this->actingAs($student)->getJson('/api/v1/notices')->assertOk()->assertJsonCount(0, 'data');
        $this->travel(2)->days();
        $this->getJson('/api/v1/notices')->assertOk()->assertJsonPath('data.0.meta', $notice['meta']);
    }

    public function test_reports_are_validated_and_private(): void
    {
        $question = DB::table('questions')->value('id');
        $this->postJson('/api/v1/questions/'.$question.'/reports', ['type' => 'Wrong answer', 'detail' => 'Please check option B'])->assertCreated()->assertJsonPath('data.question_id', $question);
        $this->getJson('/api/v1/reports')->assertOk()->assertJsonPath('data.0.detail', 'Please check option B');
        $this->postJson('/api/v1/questions/'.$question.'/reports', ['type' => '', 'detail' => ''])->assertUnprocessable();
        $this->actingAs(User::factory()->create())->getJson('/api/v1/reports')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_plan_replacement_preserves_ids_and_other_days_and_rejects_foreign_tasks(): void
    {
        $task = ['client_id' => 'mixed', 'title' => 'Mixed practice', 'kind' => 'mixed', 'questions' => 5, 'minutes' => 10, 'completed' => true];
        $plan = ['date' => '2026-10-03', 'goal' => 5, 'minutes' => 10, 'custom' => true, 'tasks' => [$task]];
        $id = $this->putJson('/api/v1/routine-plan', $plan)->assertOk()->assertJsonPath('tasks.0.questions', 5)->json('tasks.0.id');
        $this->putJson('/api/v1/routine-plan', $plan)->assertOk()->assertJsonPath('tasks.0.id', $id);
        $this->assertDatabaseCount('routine_tasks', 1);
        $otherDay = $plan;
        $otherDay['date'] = '2026-10-04';
        $this->putJson('/api/v1/routine-plan', $otherDay)->assertOk();
        $plan['tasks'] = [];
        $this->putJson('/api/v1/routine-plan', $plan)->assertOk()->assertJsonCount(0, 'tasks');
        $this->assertDatabaseCount('routine_tasks', 1);
        $this->getJson('/api/v1/routine?from=2026-10-03&to=2026-10-04')->assertOk()->assertJsonCount(2, 'plans');
        $foreignId = DB::table('routine_tasks')->value('id');
        $this->actingAs(User::factory()->create());
        $otherDay['tasks'][0]['id'] = $foreignId;
        $this->putJson('/api/v1/routine-plan', $otherDay)->assertNotFound();
        $this->assertDatabaseCount('routine_tasks', 1);
    }

    public function test_guess_revision_resume_routine_and_history_survive_round_trip(): void
    {
        $question = DB::table('questions')->value('id');
        $task = $this->postJson('/api/v1/routine', ['date' => '2026-10-03', 'title' => 'Practice', 'minutes' => 10, 'completed' => false, 'kind' => 'mixed', 'questions' => 1])->assertOk()->json('data.id');
        $attempt = $this->start(['question_ids' => [$question], 'routine_task_id' => $task, 'title' => 'My routine']);
        $id = $attempt['data']['id'];
        $this->putJson('/api/v1/attempts/'.$id.'/progress', ['current_index' => 0, 'current_page' => 0])->assertOk()->assertJsonPath('data.title', 'My routine');
        $this->putJson('/api/v1/attempts/'.$id.'/progress', ['current_index' => 1, 'current_page' => 0])->assertUnprocessable();
        $item = DB::table('attempt_items')->where('attempt_id', $id)->first();
        $this->putJson('/api/v1/attempts/'.$id.'/answers', ['answers' => [['item_id' => $item->id, 'choice' => $item->correct_option, 'guess' => true]]])->assertOk();
        $this->postJson('/api/v1/attempts/'.$id.'/submit')->assertOk();
        $this->postJson('/api/v1/attempts/'.$id.'/submit')->assertOk();
        $this->assertDatabaseHas('question_reviews', ['question_id' => $question, 'level' => 0]);
        $this->assertNotNull(DB::table('routine_tasks')->where('id', $task)->value('completed_at'));
        $this->getJson('/api/v1/revision?type=questions&status=due')->assertOk()->assertJsonPath('data.0.id', $question);
        $this->getJson('/api/v1/activity')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.question_id', $question);
        $next = $this->start(['status' => 'due']);
        $item = DB::table('attempt_items')->where('attempt_id', $next['data']['id'])->first();
        $this->putJson('/api/v1/attempts/'.$next['data']['id'].'/answers', ['answers' => [['item_id' => $item->id, 'choice' => $item->correct_option, 'guess' => false]]])->assertOk();
        $this->postJson('/api/v1/attempts/'.$next['data']['id'].'/submit')->assertOk();
        $this->assertDatabaseHas('question_reviews', ['question_id' => $question, 'level' => 1]);
        $this->getJson('/api/v1/revision?type=questions&status=due')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/revision?type=questions&status=mistakes')->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs(User::factory()->create());
        $this->getJson('/api/v1/activity')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/revision?type=questions&status=mistakes')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/v1/attempts', ['request_id' => (string) Str::uuid(), 'mode' => 'practice', 'routine_task_id' => $task])->assertNotFound();
    }

    public function test_selected_question_order_and_invalid_selection_are_not_silently_changed(): void
    {
        $this->postJson('/api/v1/attempts', ['request_id' => (string) Str::uuid(), 'mode' => 'practice', 'question_ids' => [999999]])->assertUnprocessable();
        $ids = DB::table('questions')->orderByDesc('id')->limit(2)->pluck('id')->all();
        $attempt = $this->start(['question_ids' => $ids]);
        $this->assertSame($ids, array_column($attempt['items'], 'question_id'));
        $this->putJson('/api/v1/attempts/'.$attempt['data']['id'].'/progress', ['current_index' => 1, 'current_page' => 1])->assertOk();
        $this->getJson('/api/v1/attempts/'.$attempt['data']['id'])->assertOk()->assertJsonPath('data.current_index', 1)->assertJsonPath('data.current_page', 1);
        $this->actingAs(User::factory()->create())->putJson('/api/v1/attempts/'.$attempt['data']['id'].'/progress', ['current_index' => 0, 'current_page' => 0])->assertNotFound();
    }

    public function test_plan_nested_input_cannot_override_ownership_or_server_fields(): void
    {
        $owner = auth()->id();
        $other = User::factory()->create();
        $plan = ['date' => '2026-10-03', 'goal' => 1, 'minutes' => 10, 'custom' => true, 'tasks' => [[
            'client_id' => 'safe', 'title' => 'Practice', 'minutes' => 10, 'completed' => false,
            'user_id' => $other->id, 'date' => '2020-01-01', 'completed_at' => now()->toISOString(),
        ]]];
        $this->putJson('/api/v1/routine-plan', $plan)->assertOk()->assertJsonPath('tasks.0.user_id', $owner)
            ->assertJsonPath('tasks.0.date', '2026-10-03')->assertJsonPath('tasks.0.completed_at', null);
    }

    public function test_activity_and_dashboard_use_the_students_timezone(): void
    {
        $this->travelTo(now()->setDate(2026, 10, 3)->setTime(20, 0));
        DB::table('user_preferences')->insert(['user_id' => auth()->id(), 'timezone' => 'Asia/Dhaka']);
        $this->postJson('/api/v1/routine', ['date' => '2026-10-04', 'title' => 'Local today', 'minutes' => 10, 'completed' => false])->assertOk();
        $attempt = $this->start(['count' => 1]);
        $this->postJson('/api/v1/attempts/'.$attempt['data']['id'].'/submit')->assertOk();
        $this->getJson('/api/v1/activity?to=2026-10-04')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/activity?from=2026-10-04&to=2026-10-04')->assertOk()->assertJsonPath('data.0.day', '2026-10-04');
        $this->getJson('/api/v1/activity?from=2026-10-03&to=2026-10-03')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/dashboard')->assertOk()->assertJsonPath('today_tasks.0.title', 'Local today');
    }

    public function test_question_search_is_literal_and_does_not_expand_wildcards(): void
    {
        $question = DB::table('questions')->first();
        DB::table('questions')->where('id', $question->id)->update(['text' => 'A 100% literal_test!']);
        $this->getJson('/api/v1/questions?q='.urlencode('100% literal_test!'))->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $question->id);
        $this->getJson('/api/v1/questions?q='.urlencode('100_ literal%'))->assertOk()->assertJsonCount(0, 'data');
    }

    private function start(array $data = []): array
    {
        return $this->postJson('/api/v1/attempts', $data + ['request_id' => (string) Str::uuid(), 'mode' => 'practice', 'count' => 3])->assertCreated()->json();
    }
}
