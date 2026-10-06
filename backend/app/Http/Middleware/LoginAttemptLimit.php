<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LoginAttemptLimit
{
    public function handle(Request $request, Closure $next, string $mode = 'attempt')
    {
        $key = 'login-attempts:'.hash('sha256', $request->ip());

        try {
            // Serialize checks and outcomes so parallel requests cannot bypass the limit.
            return Cache::lock($key.':lock', 60)->block(3, function () use ($key, $request, $next, $mode) {
                $state = Cache::get($key, $this->initialState());
                $remaining = $state['blocked_until'] - now()->timestamp;
                if ($remaining > 0) {
                    return $this->blocked($remaining);
                }
                if ($mode === 'prepare') {
                    return $next($request);
                }

                if (! $state['retry_phase']) {
                    if ($state['window_until'] <= now()->timestamp) {
                        $state['attempts'] = 0;
                        $state['window_until'] = now()->timestamp + 60;
                    }
                    if ($state['attempts'] >= 10) {
                        $state['retry_phase'] = true;
                        $state['blocked_until'] = now()->timestamp + 60;
                        Cache::forever($key, $state);

                        return $this->blocked(60);
                    }
                    $state['attempts']++;
                }

                $response = $next($request);
                $status = $response->getStatusCode();
                if ($status >= 200 && $status < 300) {
                    $state = $this->initialState($state['blocks']);
                } elseif ($state['retry_phase'] && in_array($status, [400, 401, 403, 409, 422], true)) {
                    $state['failures']++;
                    if ($state['failures'] >= 3) {
                        $seconds = $state['blocks'] === 0 ? 86400 : 172800;
                        $state = $this->initialState($state['blocks'] + 1);
                        $state['blocked_until'] = now()->timestamp + $seconds;
                        Cache::forever($key, $state);

                        return $this->blocked($seconds);
                    }
                }

                // Retain block history across successful logins and block expiry.
                if ($state['blocks'] > 0 || $state['retry_phase']) {
                    Cache::forever($key, $state);
                } else {
                    Cache::put($key, $state, 60);
                }

                return $response;
            });
        } catch (LockTimeoutException) {
            return $this->blocked(3);
        }
    }

    private function initialState(int $blocks = 0): array
    {
        return ['attempts' => 0, 'window_until' => 0, 'retry_phase' => false,
            'failures' => 0, 'blocked_until' => 0, 'blocks' => $blocks];
    }

    private function blocked(int $seconds)
    {
        $wait = $seconds >= 3600
            ? (int) ceil($seconds / 3600).' hour(s)'
            : $seconds.' second(s)';

        return response()->json([
            'message' => "Too many login attempts. Try again in {$wait}.",
            'retry_after' => $seconds,
        ], 429, ['Retry-After' => (string) $seconds]);
    }
}
