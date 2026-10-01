<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class GoogleIdentity
{
    public function verify(string $token, string $nonce): array
    {
        $clientId = config('services.google.client_id');
        abort_unless($clientId, 503, 'Google login is not configured.');
        try {
            $loadKeys = fn () => Http::timeout(5)->get('https://www.googleapis.com/oauth2/v3/certs')->throw()->json();
            $keys = Cache::remember('google-jwks', 3600, $loadKeys);
            $header = JWT::jsonDecode(JWT::urlsafeB64Decode(explode('.', $token)[0]));
            $knownIds = array_column($keys['keys'], 'kid');
            if (! in_array($header->kid ?? null, $knownIds, true) && Cache::add('google-jwks-refresh', true, 60)) {
                $keys = $loadKeys();
                Cache::put('google-jwks', $keys, 3600);
            }
            $claims = (array) JWT::decode($token, JWK::parseKeySet($keys, 'RS256'));
            $audience = (array) ($claims['aud'] ?? []);
            $valid = in_array($claims['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)
                && in_array($clientId, $audience, true)
                && (! isset($claims['azp']) || $claims['azp'] === $clientId)
                && (count($audience) === 1 || ($claims['azp'] ?? null) === $clientId)
                && isset($claims['exp'], $claims['iat'])
                && is_numeric($claims['exp']) && $claims['exp'] > time()
                && is_numeric($claims['iat']) && $claims['iat'] <= time()
                && ($claims['email_verified'] ?? false) === true
                && is_string($claims['sub'] ?? null)
                && is_string($claims['email'] ?? null)
                && filter_var($claims['email'], FILTER_VALIDATE_EMAIL)
                && is_string($claims['nonce'] ?? null)
                && hash_equals($nonce, $claims['nonce']);
            if ($valid) {
                return $claims;
            }
        } catch (\Throwable $exception) {
            // Neither credentials nor provider error details belong in an API response.
        }
        throw ValidationException::withMessages(['credential' => 'Invalid or expired Google credential.']);
    }
}
