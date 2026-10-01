<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ActiveUser
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user()?->is_active && $request->user()?->email_verified_at, 403, 'A verified active account is required.');

        return $next($request);
    }
}
