<?php

namespace App\Http\Middleware;

use App\Services\DeviceTracking;
use Closure;
use Illuminate\Http\Request;

class TrackDeviceActivity
{
    public function handle(Request $request, Closure $next)
    {
        app(DeviceTracking::class)->touch($request);

        return $next($request);
    }
}
