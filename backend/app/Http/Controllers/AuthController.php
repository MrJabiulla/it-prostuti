<?php

namespace App\Http\Controllers;

use App\Mail\LoginOtp;
use App\Models\User;
use App\Services\DeviceTracking;
use App\Services\GoogleIdentity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function requestOtp(Request $request)
    {
        $email = $this->email($request);
        $data = $request->validate(['name' => ['sometimes', 'required', 'string', 'max:80']]);

        $response = Cache::lock('otp:'.hash('sha256', $email), 15)->block(3, function () use ($email) {
            $existing = DB::table('email_otps')->where('email', $email)->first();
            abort_if($existing && now()->diffInSeconds($existing->sent_at, true) < 60, 429, 'Please wait before requesting another code.');
            $code = (string) random_int(100000, 999999);
            DB::transaction(function () use ($email, $code) {
                DB::table('email_otps')->updateOrInsert(['email' => $email], [
                    'code_hash' => Hash::make($code), 'attempts' => 0,
                    'sent_at' => now(), 'expires_at' => now()->addMinutes(10),
                ]);
                Mail::to($email)->send(new LoginOtp($code));
            });

            return response()->json(['message' => 'A sign-in code has been requested.', 'expires_in' => 600], 202);
        });

        $registrationKey = 'otp_registration.'.hash('sha256', $email);
        if (isset($data['name'])) {
            $request->session()->put($registrationKey, [
                'name' => $data['name'],
                'expires_at' => now()->addMinutes(10)->timestamp,
            ]);
        } else {
            $request->session()->forget($registrationKey);
        }

        return $response;
    }

    public function verifyOtp(Request $request)
    {
        app(DeviceTracking::class)->validate($request);
        $email = $this->email($request);
        $data = $request->validate(['code' => ['required', 'digits:6'], 'name' => ['nullable', 'string', 'max:80']]);
        $registrationKey = 'otp_registration.'.hash('sha256', $email);
        $registration = $request->session()->get($registrationKey);
        if ($registration && $registration['expires_at'] > now()->timestamp) {
            $data['name'] ??= $registration['name'];
        }
        $user = DB::transaction(function () use ($email, $data) {
            $otp = DB::table('email_otps')->where('email', $email)->lockForUpdate()->first();
            if (! $otp || now()->greaterThanOrEqualTo($otp->expires_at) || $otp->attempts >= 5) {
                return null;
            }
            DB::table('email_otps')->where('email', $email)->increment('attempts');
            if (! Hash::check($data['code'], $otp->code_hash)) {
                return null; // Commit the failed attempt counter.
            }
            DB::table('email_otps')->where('email', $email)->delete();
            $user = User::firstOrCreate(['email' => $email], ['name' => $data['name'] ?? Str::before($email, '@'), 'email_verified_at' => now()]);
            if (! $user->email_verified_at) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            return $user;
        });
        if (! $user) {
            throw ValidationException::withMessages(['code' => 'Invalid or expired code.']);
        }

        $request->session()->forget($registrationKey);

        return $this->login($request, $user);
    }

    public function googleNonce(Request $request)
    {
        abort_unless(config('services.google.client_id'), 503, 'Google login is not configured.');
        $nonce = Str::random(40);
        $request->session()->put('google_nonce', ['value' => $nonce, 'expires_at' => now()->addMinutes(10)->timestamp]);

        return ['nonce' => $nonce, 'client_id' => config('services.google.client_id'), 'csrf_token' => csrf_token()];
    }

    public function google(Request $request, GoogleIdentity $google)
    {
        app(DeviceTracking::class)->validate($request);
        $data = $request->validate(['credential' => ['required', 'string', 'max:10000']]);
        $nonce = $request->session()->pull('google_nonce');
        abort_unless($nonce && $nonce['expires_at'] > now()->timestamp, 422, 'Request a new Google login nonce.');
        $claims = $google->verify($data['credential'], $nonce['value']);
        $email = Str::lower($claims['email']);
        $user = Cache::lock('google:'.hash('sha256', $claims['sub']), 10)->block(3, fn () => DB::transaction(function () use ($claims, $email, $request) {
            $account = DB::table('social_accounts')->where('provider', 'google')->where('provider_id', $claims['sub'])->first();
            if ($account) {
                return User::findOrFail($account->user_id);
            }
            $user = User::where('email', $email)->lockForUpdate()->first();
            $googleOwnsEmail = Str::endsWith($email, '@gmail.com') || ! empty($claims['hd']);
            $emailAlreadyProven = $user && $request->user()?->id === $user->id && $user->email_verified_at;
            if (! $googleOwnsEmail && ! $emailAlreadyProven) {
                throw ValidationException::withMessages(['credential' => 'Verify this email using OTP first.']);
            }
            if ($user) {
                abort_unless($user->is_active, 403, 'Account unavailable.');
                abort_if(DB::table('social_accounts')->where('user_id', $user->id)->where('provider', 'google')->exists(), 409, 'A different Google identity is already linked.');
                if (! $user->email_verified_at) {
                    $user->forceFill(['email_verified_at' => now()])->save();
                }
            } else {
                $user = User::create(['email' => $email, 'name' => Str::limit($claims['name'] ?? Str::before($email, '@'), 80, ''), 'email_verified_at' => now()]);
            }
            DB::table('social_accounts')->insert(['user_id' => $user->id, 'provider' => 'google', 'provider_id' => $claims['sub'], 'created_at' => now(), 'updated_at' => now()]);

            return $user;
        }));

        return $this->login($request, $user);
    }

    public function linkGoogle(Request $request, GoogleIdentity $google)
    {
        $data = $request->validate(['credential' => 'required|string|max:10000']);
        $nonce = $request->session()->pull('google_nonce');
        abort_unless($nonce && $nonce['expires_at'] > now()->timestamp, 422, 'Request a new Google login nonce.');
        $claims = $google->verify($data['credential'], $nonce['value']);
        abort_unless(Str::lower($claims['email']) === $request->user()->email, 422, 'Google email must match your verified account email.');
        DB::transaction(function () use ($request, $claims) {
            DB::table('users')->where('id', $request->user()->id)->lockForUpdate()->first();
            $account = DB::table('social_accounts')->where('provider', 'google')->where('provider_id', $claims['sub'])->first();
            if ($account) {
                abort_unless($account->user_id === $request->user()->id, 409, 'Identity already linked.');

                return;
            }
            abort_if(DB::table('social_accounts')->where('user_id', $request->user()->id)->where('provider', 'google')->exists(), 409, 'A Google identity is already linked.');
            DB::table('social_accounts')->insert(['user_id' => $request->user()->id, 'provider' => 'google', 'provider_id' => $claims['sub'], 'created_at' => now(), 'updated_at' => now()]);
        });

        return response()->noContent();
    }

    public function logout(Request $request)
    {
        app(DeviceTracking::class)->revoke($request);
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    private function login(Request $request, User $user)
    {
        abort_unless($user->is_active, 403, 'Account unavailable.');
        app(DeviceTracking::class)->login($request, $user);
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json(['data' => $user->only(['id', 'name', 'email', 'role', 'email_verified_at'])]);
    }

    private function email(Request $request): string
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);

        return $request->validate(['email' => ['required', 'email:rfc', 'max:254']])['email'];
    }
}
