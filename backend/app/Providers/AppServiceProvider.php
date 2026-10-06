<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(180)->by($r->user()?->id ?? $r->ip()));
        RateLimiter::for('otp-send', fn (Request $r) => [Limit::perHour(10)->by('ip:'.$r->ip()), Limit::perMinutes(15, 3)->by('email:'.hash('sha256', strtolower(trim((string) $r->input('email')))))]);
        RateLimiter::for('login', fn (Request $r) => Limit::perMinute(10)->by($r->ip()));
        RateLimiter::for('attempt-start', fn (Request $r) => Limit::perMinute(10)->by($r->user()->id));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perMinute(10)->by($r->user()->id));
    }
}
