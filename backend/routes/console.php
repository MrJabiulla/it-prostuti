<?php

use App\Models\User;
use App\Services\AttemptService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('app:make-admin {email}', function () {
    $user = User::where('email', strtolower($this->argument('email')))->whereNotNull('email_verified_at')->where('is_active', true)->first();
    if (! $user) {
        $this->error('An active, OTP-verified account must already exist.');

        return 1;
    }
    $user->forceFill(['role' => 'admin'])->save();
    $this->info('Administrator role granted.');
})->purpose('Grant admin access to an existing verified user locally');

Artisan::command('attempts:expire', function (AttemptService $service) {
    DB::table('attempts')->where('status', 'active')->where('expires_at', '<=', now())->orderBy('id')->chunkById(100, function ($attempts) use ($service) {
        foreach ($attempts as $attempt) {
            $service->finish($attempt->id);
        }
    });
})->purpose('Finalize expired attempts using saved answers');

Schedule::command('attempts:expire')->everyMinute()->withoutOverlapping();
Schedule::call(fn () => DB::table('email_otps')->where('expires_at', '<', now()->subDay())->delete())->hourly();
