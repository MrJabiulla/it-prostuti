<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['subjects', 'chapters', 'topics'] as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->string('english')->nullable();
                $table->string('bengali')->nullable();
            });
        }
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('short', 80)->nullable();
            $table->string('symbol', 40)->nullable();
            $table->string('color', 30)->nullable();
        });
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->json('focus_subject_ids')->nullable();
            $table->boolean('low_data')->default(false);
            $table->boolean('streak_alert')->default(true);
            $table->boolean('theme_chosen')->default(false);
            $table->unsignedTinyInteger('reader_size')->default(18);
            $table->foreignId('last_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->foreignId('selected_paper_id')->nullable()->constrained('papers')->nullOnDelete();
        });
        Schema::create('routine_plans', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedSmallInteger('goal');
            $table->unsignedSmallInteger('minutes');
            $table->boolean('custom')->default(false);
            $table->timestampsTz();
            $table->primary(['user_id', 'date']);
        });
        Schema::table('routine_tasks', function (Blueprint $table) {
            $table->string('client_id', 80)->nullable();
            $table->string('kind', 20)->default('mixed');
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('questions')->default(0);
            $table->unsignedSmallInteger('position')->default(0);
            $table->unique(['user_id', 'date', 'client_id']);
        });
        Schema::table('attempts', function (Blueprint $table) {
            $table->unsignedSmallInteger('current_index')->default(0);
            $table->unsignedSmallInteger('current_page')->default(0);
            $table->foreignId('routine_task_id')->nullable()->constrained('routine_tasks')->nullOnDelete();
        });
        Schema::table('attempt_items', function (Blueprint $table) {
            $table->boolean('guess')->default(false);
        });
        Schema::create('question_reviews', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('due_at');
            $table->unsignedTinyInteger('level')->default(0);
            $table->primary(['user_id', 'question_id']);
            $table->index(['user_id', 'due_at']);
        });
        // Existing mistakes remain due when upgrading an already populated database.
        DB::table('question_reviews')->insertUsing(['user_id', 'question_id', 'due_at', 'level'],
            DB::table('question_progress')->whereIn('last_status', ['wrong', 'skipped'])
                ->select(['user_id', 'question_id', 'last_attempted_at'])->selectRaw('0'));
        Schema::create('question_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->restrictOnDelete();
            $table->string('type', 100);
            $table->text('detail');
            $table->timestampsTz();
            $table->index(['user_id', 'id']);
        });
        Schema::table('current_affairs', function (Blueprint $table) {
            $table->string('category', 100)->nullable();
        });
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('meta')->nullable();
            $table->text('body')->nullable();
            $table->boolean('published')->default(false);
            $table->timestampTz('publication_at')->nullable();
            $table->timestampsTz();
            $table->index(['published', 'publication_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
        Schema::table('current_affairs', fn (Blueprint $table) => $table->dropColumn('category'));
        Schema::dropIfExists('question_reports');
        Schema::dropIfExists('question_reviews');
        Schema::table('attempt_items', fn (Blueprint $table) => $table->dropColumn('guess'));
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('routine_task_id');
            $table->dropColumn(['current_index', 'current_page']);
        });
        Schema::table('routine_tasks', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'date', 'client_id']);
            $table->dropConstrainedForeignId('subject_id');
            $table->dropColumn(['client_id', 'kind', 'questions', 'position']);
        });
        Schema::dropIfExists('routine_plans');
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropConstrainedForeignId('last_lesson_id');
            $table->dropConstrainedForeignId('selected_paper_id');
            $table->dropColumn(['focus_subject_ids', 'low_data', 'streak_alert', 'theme_chosen', 'reader_size']);
        });
        Schema::table('subjects', fn (Blueprint $table) => $table->dropColumn(['short', 'symbol', 'color']));
        foreach (['subjects', 'chapters', 'topics'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->dropColumn(['english', 'bengali']));
        }
    }
};
