<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DeviceTracking
{
    public function validate(Request $request): void
    {
        $request->validate([
            'device' => ['sometimes', 'array:device_id,platform,device_name,os_version,app_version'],
            'device.device_id' => [Rule::requiredIf($request->exists('device')), 'uuid'],
            'device.platform' => [Rule::requiredIf($request->exists('device')), 'in:web,android,ios'],
            'device.device_name' => ['nullable', 'string', 'max:120'],
            'device.os_version' => ['nullable', 'string', 'max:80'],
            'device.app_version' => ['nullable', 'string', 'max:40'],
        ]);
    }

    public function login(Request $request, User $user): void
    {
        $this->revoke($request);
        // Older clients may omit metadata. Their session receives an anonymous installation ID.
        $device = $request->input('device', []);
        $deviceId = strtolower($device['device_id'] ?? $request->session()->get('installation_id', (string) Str::uuid()));
        $request->session()->put('installation_id', $deviceId);
        $trackingId = (string) Str::uuid();
        DB::transaction(function () use ($request, $user, $device, $deviceId, $trackingId) {
            $now = now();
            DB::table('user_devices')->upsert([[
                'user_id' => $user->id,
                'device_id' => $deviceId,
                'platform' => $device['platform'] ?? 'web',
                'device_name' => $device['device_name'] ?? null,
                'os_version' => $device['os_version'] ?? null,
                'app_version' => $device['app_version'] ?? null,
                'first_login_at' => $now,
                'last_login_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]], ['user_id', 'device_id'], ['platform', 'device_name', 'os_version', 'app_version', 'last_login_at', 'updated_at']);
            $id = DB::table('user_devices')->where('user_id', $user->id)->where('device_id', $deviceId)->value('id');
            DB::table('device_sessions')->insert([
                'id' => $trackingId,
                'user_device_id' => $id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'logged_in_at' => $now,
                'last_seen_at' => $now,
                'expires_at' => $now->copy()->addMinutes(config('session.lifetime')),
            ]);
        });
        $request->session()->put('device_tracking_id', $trackingId);
    }

    public function touch(Request $request): void
    {
        if (! $request->user() || ! $request->session()->has('device_tracking_id')) {
            return;
        }
        DB::table('device_sessions')->where('id', $request->session()->get('device_tracking_id'))
            ->whereNull('revoked_at')->update([
                'last_seen_at' => now(),
                'expires_at' => now()->addMinutes(config('session.lifetime')),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
    }

    public function revoke(Request $request): void
    {
        $id = $request->session()->pull('device_tracking_id');
        if ($id) {
            DB::table('device_sessions')->where('id', $id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
        }
    }
}
