<?php

namespace Tests\Unit;

use Illuminate\Filesystem\Filesystem;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

class EnvironmentSelectionTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir().'/prosthuti-env-'.bin2hex(random_bytes(8));
        mkdir($this->directory.'/bootstrap/cache', 0700, true);
        mkdir($this->directory.'/config');
        file_put_contents($this->directory.'/config/app.php', '<?php return ["env" => app()->selectedEnvironment(), "name" => env("APP_NAME")];');
        foreach (['local', 'staging', 'production'] as $environment) {
            file_put_contents($this->directory.'/.env.'.$environment, "APP_ENV=$environment\nAPP_NAME=$environment\n");
        }
    }

    protected function tearDown(): void
    {
        (new Filesystem)->deleteDirectory($this->directory);
    }

    public function test_selector_alone_changes_loaded_profile_and_cache_path(): void
    {
        $paths = [];
        foreach (['local', 'staging', 'production'] as $environment) {
            file_put_contents($this->directory.'/.env', "APP_ENV=$environment\n");
            $result = $this->boot();
            $this->assertTrue($result->isSuccessful(), $result->getErrorOutput());
            $data = json_decode($result->getOutput(), true);
            $this->assertSame($environment, $data['name']);
            $this->assertSame($environment, $data['environment']);
            $paths[] = $data['cache'];
            file_put_contents($data['cache'], '<?php return '.var_export(['app' => ['name' => $environment, 'env' => $environment]], true).';');
        }
        $this->assertCount(3, array_unique($paths));
    }

    public function test_profile_edit_bypasses_its_previous_config_cache(): void
    {
        file_put_contents($this->directory.'/.env', "APP_ENV=local\n");
        $before = json_decode($this->boot()->getOutput(), true);
        file_put_contents($before['cache'], '<?php return ["app" => ["name" => "old", "env" => "local"]];');
        file_put_contents($this->directory.'/.env.local', "APP_ENV=local\nAPP_NAME=changed\n");
        $after = json_decode($this->boot()->getOutput(), true);
        $this->assertSame('changed', $after['name']);
        $this->assertNotSame($before['cache'], $after['cache']);
    }

    public function test_missing_profile_does_not_fall_back(): void
    {
        file_put_contents($this->directory.'/.env', "APP_ENV=staging\n");
        unlink($this->directory.'/.env.staging');
        $result = $this->boot();
        $this->assertFalse($result->isSuccessful());
        $this->assertStringContainsString('Missing or unreadable .env.staging', $result->getErrorOutput());
    }

    public function test_invalid_selector_and_profile_mismatch_are_rejected(): void
    {
        file_put_contents($this->directory.'/.env', "APP_ENV=../production\n");
        $this->assertFalse($this->boot()->isSuccessful());
        file_put_contents($this->directory.'/.env', "APP_ENV=local\n");
        file_put_contents($this->directory.'/.env.local', "APP_ENV=production\n");
        $this->assertFalse($this->boot()->isSuccessful());
    }

    private function boot(): Process
    {
        $script = 'require $argv[1]; $app = new App\\Foundation\\EnvironmentApplication($argv[2]); $app->bootstrapWith([Illuminate\\Foundation\\Bootstrap\\LoadEnvironmentVariables::class, Illuminate\\Foundation\\Bootstrap\\LoadConfiguration::class]); echo json_encode(["name" => config("app.name"), "environment" => config("app.env"), "cache" => $app->getCachedConfigPath()]);';
        $process = new Process([PHP_BINARY, '-r', $script, dirname(__DIR__, 2).'/vendor/autoload.php', $this->directory], null, ['APP_ENV' => false, 'APP_NAME' => false]);
        $process->run();

        return $process;
    }
}
