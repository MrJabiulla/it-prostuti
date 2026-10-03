<?php

namespace Tests\Feature;

use App\Mail\LoginOtp;
use App\Services\GoogleIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DeviceTrackingTest extends TestCase
{
    use RefreshDatabase;

    private function device(): array
    {
        return ['device_id' => '06ccf486-b054-47f2-930c-a699ac08b393', 'platform' => 'android', 'device_name' => 'Pixel', 'os_version' => '16', 'app_version' => '1.0'];
    }

    private function loginWithOtp(array $device): void
    {
        Mail::fake();
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'device@example.com'])->assertAccepted();
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $this->postJson('/api/v1/auth/otp/verify', ['email' => 'device@example.com', 'code' => $code, 'device' => $device])->assertOk();
    }

    public function test_login_activity_logout_and_repeat_login_update_the_same_device(): void
    {
        $this->loginWithOtp($this->device());
        $first = DB::table('user_devices')->first();
        $session = DB::table('device_sessions')->first();
        $this->assertEquals(now()->addDays(30)->format('Y-m-d H:i:s'), $session->expires_at);
        $this->travel(2)->minutes();
        $this->getJson('/api/v1/me')->assertOk();
        $this->assertDatabaseHas('device_sessions', ['id' => $session->id, 'last_seen_at' => now()->format('Y-m-d H:i:s')]);
        $this->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->assertNotNull(DB::table('device_sessions')->value('revoked_at'));
        $this->loginWithOtp(array_replace($this->device(), ['app_version' => '2.0']));
        $this->assertDatabaseCount('user_devices', 1);
        $this->assertDatabaseCount('device_sessions', 2);
        $this->assertDatabaseHas('user_devices', ['id' => $first->id, 'first_login_at' => $first->first_login_at, 'app_version' => '2.0']);
        $this->assertEquals(1, DB::table('device_sessions')->whereNull('revoked_at')->count());
    }

    public function test_invalid_device_does_not_consume_otp_or_google_nonce(): void
    {
        Mail::fake();
        $this->postJson('/api/v1/auth/otp/request', ['email' => 'device@example.com'])->assertAccepted();
        $code = Mail::sent(LoginOtp::class)->first()->code;
        $payload = ['email' => 'device@example.com', 'code' => $code, 'device' => ['device_id' => 'bad', 'platform' => 'invalid']];
        $this->postJson('/api/v1/auth/otp/verify', $payload)->assertUnprocessable()->assertJsonValidationErrors('device.device_id');
        $this->assertDatabaseCount('user_devices', 0);
        $this->postJson('/api/v1/auth/otp/verify', array_replace($payload, ['device' => $this->device()]))->assertOk();
        $this->withSession(['google_nonce' => ['value' => 'retained', 'expires_at' => now()->addMinutes(10)->timestamp]])
            ->postJson('/api/v1/auth/google', ['credential' => 'test', 'device' => ['platform' => 'ios']])
            ->assertUnprocessable()->assertSessionHas('google_nonce.value', 'retained');
    }

    public function test_another_session_on_same_device_is_not_revoked_by_logout(): void
    {
        $this->loginWithOtp($this->device());
        $firstId = DB::table('device_sessions')->value('id');
        $this->app['session.store']->forget('device_tracking_id');
        $this->travel(2)->minutes();
        $this->loginWithOtp($this->device());
        $this->assertDatabaseCount('user_devices', 1);
        $this->assertEquals(2, DB::table('device_sessions')->whereNull('revoked_at')->count());
        $this->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->assertDatabaseHas('device_sessions', ['id' => $firstId, 'revoked_at' => null]);
        $this->assertEquals(1, DB::table('device_sessions')->whereNull('revoked_at')->count());
    }

    public function test_google_login_records_device_metadata(): void
    {
        $this->mock(GoogleIdentity::class)->shouldReceive('verify')->once()->andReturn(['sub' => 'device-google', 'email' => 'device@gmail.com', 'name' => 'Student']);
        $this->withSession(['google_nonce' => ['value' => 'nonce', 'expires_at' => now()->addMinutes(10)->timestamp]])
            ->postJson('/api/v1/auth/google', ['credential' => 'test', 'device' => $this->device()])->assertOk();
        $this->assertDatabaseHas('user_devices', ['device_id' => $this->device()['device_id'], 'platform' => 'android']);
        $this->assertDatabaseCount('device_sessions', 1);
    }
}
