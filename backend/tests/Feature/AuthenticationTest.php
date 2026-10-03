<?php

namespace Tests\Feature;

use App\Mail\LoginOtp;
use App\Models\User;
use App\Services\GoogleIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\DatabaseSessionHandler;
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

    public function test_registration_name_is_kept_until_otp_verification(): void
    {
        Mail::fake();
        $email = 'named@example.com';
        $key = 'otp_registration.'.hash('sha256', $email);
        $this->postJson('/api/v1/auth/otp/request', ['email' => $email, 'name' => 'Named Student'])
            ->assertAccepted()->assertSessionHas($key.'.name', 'Named Student');
        $this->assertDatabaseMissing('users', ['email' => $email]);
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $this->postJson('/api/v1/auth/otp/verify', ['email' => $email, 'code' => '000000'])
            ->assertUnprocessable()->assertSessionHas($key.'.name', 'Named Student');
        $this->postJson('/api/v1/auth/otp/verify', ['email' => $email, 'code' => $code])
            ->assertOk()->assertJsonPath('data.name', 'Named Student')->assertSessionMissing($key);
        $this->assertDatabaseHas('users', ['email' => $email, 'name' => 'Named Student', 'password' => null]);
    }

    public function test_registration_validates_name_before_sending_otp(): void
    {
        Mail::fake();
        foreach (['', str_repeat('a', 81), ['invalid']] as $name) {
            $this->postJson('/api/v1/auth/otp/request', ['email' => 'name@example.com', 'name' => $name])
                ->assertUnprocessable()->assertJsonValidationErrors('name');
        }
        Mail::assertNothingSent();
        $this->assertDatabaseCount('email_otps', 0);
    }

    public function test_otp_login_preserves_an_existing_users_name(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email' => 'existing@example.com', 'name' => 'Original Name']);
        $this->postJson('/api/v1/auth/otp/request', ['email' => $user->email, 'name' => 'Different Name'])->assertAccepted();
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $this->postJson('/api/v1/auth/otp/verify', ['email' => $user->email, 'code' => $code])
            ->assertOk()->assertJsonPath('data.name', 'Original Name');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_registration_names_are_scoped_to_each_email(): void
    {
        Mail::fake();
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'first@example.com', 'name' => 'First Student'])->assertAccepted();
        $firstCode = Mail::sent(LoginOtp::class)->first()->code;
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'second@example.com'])->assertAccepted();
        $secondCode = Mail::sent(LoginOtp::class)->last()->code;
        $this->postJson('/api/v1/auth/otp/verify', ['email' => 'second@example.com', 'code' => $secondCode])
            ->assertOk()->assertJsonPath('data.name', 'second');
        $this->postJson('/api/v1/auth/otp/verify', ['email' => 'first@example.com', 'code' => $firstCode])
            ->assertOk()->assertJsonPath('data.name', 'First Student');
    }

    public function test_cookie_and_database_session_last_thirty_days(): void
    {
        $this->assertSame(43200, config('session.lifetime'));
        $this->assertFalse(config('session.expire_on_close'));
        $response = $this->getJson('/api/v1/auth/csrf')->assertOk();
        $cookie = collect($response->headers->getCookies())->first(fn ($cookie) => $cookie->getName() === config('session.cookie'));
        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertEqualsWithDelta(now()->addDays(30)->timestamp, $cookie->getExpiresTime(), 2);
        $id = str_repeat('a', 40);
        DB::table('sessions')->insert(['id' => $id, 'payload' => base64_encode('saved-session'), 'last_activity' => now()->timestamp]);
        $handler = new DatabaseSessionHandler(DB::connection(), 'sessions', config('session.lifetime'));
        $this->travel(29)->days();
        $this->assertSame('saved-session', $handler->read($id));
        $this->travel(2)->days();
        $this->assertSame('', $handler->read($id));
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

    public function test_google_reuses_an_existing_otp_account_without_replacing_its_profile(): void
    {
        config(['services.google.client_id' => 'test-client']);
        $user = User::factory()->create(['email' => 'member@gmail.com', 'name' => 'Original Name']);
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->once()->andReturn(['sub' => 'google-sub', 'email' => 'member@gmail.com', 'name' => 'Member']));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertOk()->assertJsonPath('data.id', $user->id)->assertJsonPath('data.name', 'Original Name');
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('social_accounts', ['user_id' => $user->id, 'provider_id' => 'google-sub']);
    }

    public function test_otp_login_reuses_a_google_registered_account(): void
    {
        Mail::fake();
        config(['services.google.client_id' => 'test-client']);
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->once()->andReturn(['sub' => 'google-first', 'email' => 'googlefirst@gmail.com', 'name' => 'Google Name']));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $id = $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertOk()->json('data.id');
        $this->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'googlefirst@gmail.com'])->assertAccepted();
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $this->postJson('/api/v1/auth/otp/verify', ['email' => 'googlefirst@gmail.com', 'code' => $code])
            ->assertOk()->assertJsonPath('data.id', $id)->assertJsonPath('data.name', 'Google Name');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_google_rejects_disabled_accounts_and_conflicting_identities(): void
    {
        config(['services.google.client_id' => 'test-client']);
        $user = User::factory()->create(['email' => 'blocked@gmail.com', 'is_active' => false]);
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->twice()->andReturn(['sub' => 'incoming-google', 'email' => $user->email, 'name' => 'Name']));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertForbidden();
        $this->assertDatabaseCount('social_accounts', 0);
        $user->forceFill(['is_active' => true])->save();
        DB::table('social_accounts')->insert(['user_id' => $user->id, 'provider' => 'google', 'provider_id' => 'other-google', 'created_at' => now(), 'updated_at' => now()]);
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertStatus(409);
        $this->assertDatabaseCount('social_accounts', 1);
    }

    public function test_non_google_hosted_email_needs_otp_proof_before_automatic_linking(): void
    {
        config(['services.google.client_id' => 'test-client']);
        $user = User::factory()->create(['email' => 'member@example.com']);
        $this->mock(GoogleIdentity::class, fn ($mock) => $mock->shouldReceive('verify')->twice()->andReturn(['sub' => 'external-google', 'email' => $user->email, 'name' => 'Name']));
        $this->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertUnprocessable();
        $this->assertDatabaseCount('social_accounts', 0);
        $this->actingAs($user)->getJson('/api/v1/auth/google/nonce')->assertOk();
        $this->postJson('/api/v1/auth/google', ['credential' => 'test'])->assertOk()->assertJsonPath('data.id', $user->id);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('social_accounts', ['user_id' => $user->id, 'provider_id' => 'external-google']);
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
