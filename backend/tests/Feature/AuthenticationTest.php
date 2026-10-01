<?php

namespace Tests\Feature;

use App\Mail\LoginOtp;
use App\Models\User;
use App\Services\GoogleIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_is_not_registered_until_otp_is_verified(): void
    {
        Mail::fake();
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'Student@Example.com'])->assertAccepted()->assertJsonMissingPath('code');
        $this->assertDatabaseMissing('users', ['email' => 'student@example.com']);
        $mail = Mail::sent(LoginOtp::class)->first();
        $this->assertNotEquals($mail->code, DB::table('email_otps')->value('code_hash'));
        $this->postJson('/api/v1/auth/otp/verify', ['email' => 'student@example.com', 'code' => $mail->code, 'role' => 'admin'])->assertOk()->assertJsonPath('data.role', 'student');
        $this->getJson('/api/v1/me')->assertOk();
        $this->assertDatabaseHas('users', ['email' => 'student@example.com', 'password' => null]);
        $this->postJson('/api/v1/auth/otp/verify', ['email' => 'student@example.com', 'code' => $mail->code])->assertUnprocessable();
    }

    public function test_otp_attempt_limit_and_cooldown_are_enforced(): void
    {
        Mail::fake();
        $email = 'limit@example.com';
        $this->postJson('/api/v1/auth/otp/request', ['email' => $email])->assertAccepted();
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $this->postJson('/api/v1/auth/otp/request', ['email' => $email])->assertStatus(429);
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/otp/verify', ['email' => $email, 'code' => '000000'])->assertUnprocessable();
        }
        $this->assertDatabaseHas('email_otps', ['email' => $email, 'attempts' => 5]);
        $this->postJson('/api/v1/auth/otp/verify', ['email' => $email, 'code' => $code])->assertUnprocessable();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_expired_and_replaced_codes_cannot_authenticate(): void
    {
        Mail::fake();
        $email = 'expire@example.com';
        $this->postJson('/api/v1/auth/otp/request', ['email' => $email])->assertAccepted();
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $this->travel(11)->minutes();
        $this->postJson('/api/v1/auth/otp/verify', ['email' => $email, 'code' => $code])->assertUnprocessable();
        $this->postJson('/api/v1/auth/otp/request', ['email' => $email])->assertAccepted();
        $this->assertDatabaseHas('email_otps', ['email' => $email, 'attempts' => 0]);
    }

    public function test_student_cannot_access_admin_and_disabled_accounts_are_blocked(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->getJson('/api/v1/admin/catalogue/subjects')->assertForbidden();
        $user->forceFill(['is_active' => false])->save();
        $this->getJson('/api/v1/me')->assertForbidden();
    }

    public function test_guest_requests_return_json_401(): void
    {
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();
    }

    public function test_logout_invalidates_authentication(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_google_requires_configuration_and_nonce(): void
    {
        config(['services.google.client_id' => null]);
        $this->getJson('/api/v1/auth/google/nonce')->assertStatus(503);
        config(['services.google.client_id' => 'test-client']);
        $this->postJson('/api/v1/auth/google', ['credential' => 'invalid'])->assertUnprocessable();
    }

    public function test_google_does_not_silently_link_an_existing_email(): void
    {
        config(['services.google.client_id' => 'test-client']);
        User::factory()->create(['email' => 'member@gmail.com']);
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->once()->andReturn(['sub' => 'google-sub', 'email' => 'member@gmail.com', 'name' => 'Member']));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertUnprocessable();
        $this->assertDatabaseCount('social_accounts', 0);
    }

    public function test_google_creates_a_verified_student_for_a_new_identity(): void
    {
        config(['services.google.client_id' => 'test-client']);
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->once()->andReturn(['sub' => 'new-google-sub', 'email' => 'newmember@gmail.com', 'name' => 'Member']));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertOk()->assertJsonPath('data.role', 'student');
        $this->assertDatabaseHas('social_accounts', ['provider_id' => 'new-google-sub']);
        $this->getJson('/api/v1/me')->assertOk();
    }
}
