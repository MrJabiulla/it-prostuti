<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProfileAndAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_preferences_update_cannot_escalate_role_or_replace_verified_email(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->putJson('/api/v1/me', ['name' => 'Student', 'role' => 'admin', 'email' => 'attacker@example.com', 'daily_minutes' => 30, 'daily_questions' => 10, 'theme' => 'light', 'font_size' => 'standard', 'reminder' => false, 'reminder_time' => '20:00', 'timezone' => 'Asia/Dhaka'])->assertOk()->assertJsonPath('data.email', $user->email)->assertJsonPath('data.role', 'student')->assertJsonPath('preferences.daily_minutes', 30);
    }

    public function test_mysql_connection_uses_utc_for_otp_and_exam_deadlines(): void
    {
        $this->assertSame('mysql', DB::connection()->getDriverName());
        $this->assertSame('+00:00', DB::selectOne('SELECT @@session.time_zone AS timezone')->timezone);
    }

    public function test_mysql_foreign_key_conflict_returns_safe_api_response(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $subject = DB::table('subjects')->insertGetId(['title' => 'Subject', 'slug' => 'subject', 'position' => 0]);
        DB::table('chapters')->insert(['subject_id' => $subject, 'title' => 'Chapter', 'position' => 0]);

        $this->actingAs($admin)->deleteJson('/api/v1/admin/catalogue/subjects/'.$subject)
            ->assertStatus(409)
            ->assertExactJson(['message' => 'This change conflicts with an existing or referenced record.']);
        $this->assertDatabaseHas('subjects', ['id' => $subject]);
    }

    public function test_state_changing_routes_reject_missing_csrf_outside_test_bypass(): void
    {
        $this->app['env'] = 'production';
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'student@example.com'])->assertStatus(419);
    }
}
