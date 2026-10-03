<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FrontendMigrationTest extends TestCase
{
    use DatabaseMigrations;

    public function test_upgrade_backfills_existing_mistakes_and_rollback_preserves_core_records(): void
    {
        $this->seed();
        $this->actingAs(User::factory()->create());
        $migration = require database_path('migrations/2026_10_03_000002_complete_frontend_coverage.php');
        $migration->down();
        $question = DB::table('questions')->value('id');
        DB::table('question_progress')->insert(['user_id' => auth()->id(), 'question_id' => $question, 'last_status' => 'wrong', 'attempt_count' => 1, 'last_attempted_at' => now()]);
        $migration->up();
        $this->assertDatabaseHas('question_reviews', ['user_id' => auth()->id(), 'question_id' => $question, 'level' => 0]);
        $this->assertDatabaseHas('questions', ['id' => $question]);
        $this->assertDatabaseHas('question_progress', ['question_id' => $question, 'attempt_count' => 1]);
    }
}
