<?php

namespace App\Foundation;

use Dotenv\Dotenv;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables;
use RuntimeException;

class EnvironmentApplication extends Application
{
    private string $selected;

    private string $profileHash;

    public function __construct($basePath = null)
    {
        parent::__construct($basePath);

        // PHPUnit selects testing independently of the developer's selector.
        if (defined('PHPUNIT_COMPOSER_INSTALL')) {
            $this->selected = 'testing';
        } else {
            $selector = $this->readEnvironmentFile($this->basePath('.env'));
            if (array_keys($selector) !== ['APP_ENV'] || ! in_array($selector['APP_ENV'], ['local', 'staging', 'production'], true)) {
                throw new RuntimeException('The .env file must contain only APP_ENV=local, staging or production.');
            }
            $this->selected = $selector['APP_ENV'];
        }

        $file = '.env.'.$this->selected;
        $profile = $this->readEnvironmentFile($this->basePath($file));
        if (($profile['APP_ENV'] ?? null) !== $this->selected) {
            throw new RuntimeException('APP_ENV in '.$file.' must match the selected environment.');
        }
        $this->profileHash = hash_file('sha256', $this->basePath($file));
        $this->loadEnvironmentFrom($file);

        // File selection is already resolved; prevent Laravel's --env fallback.
        $this->singleton(LoadEnvironmentVariables::class, fn () => new class extends LoadEnvironmentVariables
        {
            protected function checkForSpecificEnvironmentFile($app)
            {
                // The main .env selector is authoritative.
            }
        });
    }

    public function selectedEnvironment(): string
    {
        return $this->selected;
    }

    public function getCachedConfigPath()
    {
        // Changing environment or its file cannot reuse another profile's cache.
        return $this->bootstrapPath('cache/config-'.$this->selected.'-'.$this->profileHash.'.php');
    }

    private function readEnvironmentFile(string $path): array
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException('Missing or unreadable '.basename($path).'. Configure it from its example before selecting it.');
        }

        try {
            return Dotenv::parse(file_get_contents($path));
        } catch (\Throwable $exception) {
            // Parser messages can contain secret-bearing lines.
            throw new RuntimeException('Invalid syntax in '.basename($path).'.');
        }
    }
}
