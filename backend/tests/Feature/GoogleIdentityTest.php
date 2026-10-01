<?php

namespace Tests\Feature;

use App\Services\GoogleIdentity;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class GoogleIdentityTest extends TestCase
{
    private string $privateKey = '';

    private array $payload;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google.client_id' => 'test-client']);
        Cache::flush();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $this->privateKey);
        $rsa = openssl_pkey_get_details($key)['rsa'];
        Http::preventStrayRequests();
        Http::fake(['https://www.googleapis.com/oauth2/v3/certs' => Http::response(['keys' => [['kty' => 'RSA', 'kid' => 'test-key', 'alg' => 'RS256', 'n' => JWT::urlsafeB64Encode($rsa['n']), 'e' => JWT::urlsafeB64Encode($rsa['e'])]]])]);
        $this->payload = ['iss' => 'https://accounts.google.com', 'aud' => 'test-client', 'sub' => '123', 'email' => 'member@gmail.com', 'email_verified' => true, 'nonce' => 'server-nonce', 'iat' => time(), 'exp' => time() + 600];
    }

    public function test_signed_google_identity_is_validated_without_external_network(): void
    {
        $token = JWT::encode($this->payload, $this->privateKey, 'RS256', 'test-key');
        $claims = app(GoogleIdentity::class)->verify($token, 'server-nonce');
        $this->assertSame('123', $claims['sub']);
        app(GoogleIdentity::class)->verify($token, 'server-nonce');
        Http::assertSentCount(1);
    }

    public function test_wrong_audience_issuer_nonce_and_expiry_are_rejected(): void
    {
        foreach ([['aud' => 'attacker-client'], ['iss' => 'https://attacker.test'], ['nonce' => 'wrong'], ['exp' => time() - 60], ['email_verified' => false]] as $change) {
            $token = JWT::encode(array_replace($this->payload, $change), $this->privateKey, 'RS256', 'test-key');
            try {
                app(GoogleIdentity::class)->verify($token, 'server-nonce');
                $this->fail('Invalid token was accepted.');
            } catch (ValidationException $error) {
                $this->assertArrayHasKey('credential', $error->errors());
            }
        }
    }

    public function test_unsigned_or_missing_expiry_tokens_are_rejected(): void
    {
        unset($this->payload['exp']);
        $token = JWT::encode($this->payload, $this->privateKey, 'RS256', 'test-key');
        $this->expectException(ValidationException::class);
        app(GoogleIdentity::class)->verify($token, 'server-nonce');
    }
}
