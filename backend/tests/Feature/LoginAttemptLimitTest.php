<?php

namespace Tests\Feature;

use App\Mail\LoginOtp;
use App\Models\User;
use App\Services\GoogleIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class LoginAttemptLimitTest extends TestCase
{
    use RefreshDatabase;

    private function failedAttempt(string $method = 'otp/verify')
    {
        return $this->postJson('/api/v1/auth/'.$method, []);
    }

    private function enterCooldown(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->failedAttempt($i % 2 === 0 ? 'otp/verify' : 'google')->assertUnprocessable();
        }
        $this->failedAttempt()->assertStatus(429)->assertHeader('Retry-After', '60');
    }

    public function test_shared_limit_cooldown_and_escalating_ip_blocks(): void
    {
        $this->freezeTime();
        $this->enterCooldown();
        $this->travel(59)->seconds();
        $this->failedAttempt()->assertStatus(429)->assertHeader('Retry-After', '1');
        $this->travel(1)->seconds();
        $this->failedAttempt()->assertUnprocessable();
        $this->failedAttempt('google')->assertUnprocessable();
        $this->failedAttempt()->assertStatus(429)->assertHeader('Retry-After', '86400');
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'blocked@example.com'])->assertStatus(429);
        $this->getJson('/api/v1/auth/google/nonce')->assertStatus(429);
        $this->travel(86399)->seconds();
        $this->failedAttempt()->assertStatus(429)->assertHeader('Retry-After', '1');
        $this->travel(1)->seconds();
        $this->enterCooldown();
        $this->travel(60)->seconds();
        $this->failedAttempt()->assertUnprocessable();
        $this->failedAttempt()->assertUnprocessable();
        $this->failedAttempt('google')->assertStatus(429)->assertHeader('Retry-After', '172800');
        $this->travel(172800)->seconds();
        $this->failedAttempt()->assertUnprocessable();
    }

    public function test_window_resets_and_other_ips_are_unaffected(): void
    {
        $this->freezeTime();
        for ($i = 0; $i < 10; $i++) {
            $this->failedAttempt()->assertUnprocessable();
        }
        $this->travel(60)->seconds();
        $this->enterCooldown();
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.2']);
        $this->failedAttempt()->assertUnprocessable();
    }

    public function test_successful_student_registration_and_admin_login_reset_retry_failures(): void
    {
        $this->freezeTime();
        Mail::fake();
        config(['auth.test_otp_enabled' => false]);
        User::factory()->create(['email' => 'admin@example.com', 'role' => 'admin']);
        foreach (['student@example.com' => 'student', 'admin@example.com' => 'admin'] as $email => $role) {
            $this->postJson('/api/v1/auth/otp/request', ['email' => $email, 'name' => 'Test User'])->assertAccepted();
            $code = Mail::sent(LoginOtp::class)->last()->code;
            $this->enterCooldown();
            $this->travel(60)->seconds();
            $this->failedAttempt()->assertUnprocessable();
            $this->failedAttempt()->assertUnprocessable();
            $this->postJson('/api/v1/auth/otp/verify', ['email' => $email, 'code' => $code])
                ->assertOk()->assertJsonPath('data.role', $role);
            $this->postJson('/api/v1/auth/logout')->assertNoContent();
        }
        $this->failedAttempt()->assertUnprocessable();
    }

    public function test_server_errors_do_not_consume_retry_chances_and_waiting_does_not_reset_them(): void
    {
        $this->freezeTime();
        config(['services.google.client_id' => 'test-client']);
        $this->enterCooldown();
        $this->travel(60)->seconds();
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->once()->andThrow(new HttpException(503)));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertStatus(503);
        $this->failedAttempt()->assertUnprocessable();
        $this->travel(2)->minutes();
        $this->failedAttempt()->assertUnprocessable();
        $this->failedAttempt()->assertStatus(429)->assertHeader('Retry-After', '86400');
    }
}
