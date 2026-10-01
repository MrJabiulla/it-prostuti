<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('role', 20)->default('student');
            $table->boolean('is_active')->default(true);
        });
        Schema::create('email_otps', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('code_hash');
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->timestampTz('expires_at')->index();
            $table->timestampTz('sent_at');
        });
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 20);
            $table->string('provider_id');
            $table->unique(['provider', 'provider_id']);
            $table->unique(['user_id', 'provider']);
            $table->timestampsTz();
        });
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->unsignedInteger('position')->default(0);
            $table->timestampsTz();
        });
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->index()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('overview')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestampsTz();
        });
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->index()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->unsignedInteger('position')->default(0);
            $table->timestampsTz();
        });
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('disk', 30);
            $table->string('path')->unique();
            $table->string('name');
            $table->string('mime', 100);
            $table->unsignedBigInteger('size');
            $table->boolean('published')->default(false);
            $table->timestampsTz();
        });
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->unique()->constrained()->restrictOnDelete();
            $table->text('summary');
            $table->unsignedSmallInteger('reading_minutes')->default(3);
            $table->boolean('published')->default(false)->index();
            $table->boolean('is_demo')->default(false);
            $table->timestampsTz();
        });
        Schema::create('lesson_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('kind', 30)->default('explanation');
            $table->text('body');
            $table->foreignId('media_file_id')->nullable()->constrained()->restrictOnDelete();
            $table->unsignedInteger('position');
            $table->unique(['lesson_id', 'position']);
        });
        foreach (['exams', 'institutes'] as $name) {
            Schema::create($name, function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->timestampsTz();
            });
        }
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->index()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->timestampsTz();
        });
        Schema::create('exam_subject', function (Blueprint $table) {
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->restrictOnDelete();
            $table->text('syllabus')->nullable();
            $table->primary(['exam_id', 'subject_id']);
            $table->index('subject_id');
        });
        Schema::create('papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('post_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('year');
            $table->string('stage', 80);
            $table->text('source');
            $table->boolean('verified')->default(false);
            $table->boolean('is_demo')->default(false);
            $table->boolean('published')->default(false);
            $table->unsignedSmallInteger('duration_minutes');
            $table->decimal('correct_marks', 6, 2)->default(1);
            $table->decimal('wrong_penalty', 6, 2)->default(0);
            $table->index(['published', 'post_id', 'year']);
            $table->timestampsTz();
        });
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained()->restrictOnDelete();
            $table->text('text');
            $table->text('explanation');
            $table->text('source');
            $table->boolean('verified')->default(false);
            $table->boolean('is_demo')->default(false);
            $table->boolean('published')->default(false);
            $table->index(['topic_id', 'published', 'id']);
            $table->timestampsTz();
        });
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->text('text');
            $table->unsignedSmallInteger('position');
            $table->boolean('is_correct')->default(false);
            $table->unique(['question_id', 'position']);
        });
        Schema::create('paper_question', function (Blueprint $table) {
            $table->foreignId('paper_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('position');
            $table->primary(['paper_id', 'question_id']);
            $table->unique(['paper_id', 'position']);
            $table->index('question_id');
        });
        Schema::create('reading_progress', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('updated_at');
            $table->primary(['user_id', 'lesson_id']);
            $table->index(['user_id', 'updated_at']);
        });
        Schema::create('lesson_notes', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestampTz('updated_at');
            $table->primary(['user_id', 'lesson_id']);
        });
        foreach (['lesson', 'question'] as $type) {
            Schema::create($type.'_bookmarks', function (Blueprint $table) use ($type) {
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId($type.'_id')->constrained()->cascadeOnDelete();
                $table->timestampTz('created_at');
                $table->primary(['user_id', $type.'_id']);
            });
        }
        Schema::create('attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('request_id');
            $table->foreignId('paper_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('mode', 20);
            $table->string('status', 20)->default('active');
            $table->decimal('correct_marks', 6, 2);
            $table->decimal('wrong_penalty', 6, 2);
            $table->decimal('score', 9, 2)->nullable();
            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('wrong_count')->default(0);
            $table->unsignedInteger('skipped_count')->default(0);
            $table->timestampTz('started_at');
            $table->timestampTz('expires_at')->nullable();
            $table->timestampTz('submitted_at')->nullable();
            $table->unique(['user_id', 'request_id']);
            $table->index(['user_id', 'status', 'started_at']);
            $table->index(['status', 'expires_at']);
        });
        Schema::create('attempt_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('attempt_id');
            $table->foreign('attempt_id')->references('id')->on('attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->restrictOnDelete();
            $table->foreignId('subject_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('position');
            $table->text('text');
            $table->json('options'); // Immutable exam snapshot, not the content catalogue.
            $table->unsignedSmallInteger('correct_option');
            $table->text('explanation');
            $table->text('source');
            $table->boolean('verified');
            $table->boolean('is_demo');
            $table->unsignedSmallInteger('selected_option')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->timestampTz('answered_at')->nullable();
            $table->unique(['attempt_id', 'position']);
            $table->unique(['attempt_id', 'question_id']);
        });
        Schema::create('question_progress', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->string('last_status', 20);
            $table->unsignedInteger('attempt_count')->default(1);
            $table->timestampTz('last_attempted_at');
            $table->primary(['user_id', 'question_id']);
            $table->index(['user_id', 'last_status']);
        });
        Schema::create('routine_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('title');
            $table->unsignedSmallInteger('minutes');
            $table->timestampTz('completed_at')->nullable();
            $table->timestampsTz();
            $table->index(['user_id', 'date']);
        });
        Schema::create('current_affairs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->text('source');
            $table->date('publication_date');
            $table->boolean('is_demo')->default(false);
            $table->boolean('published')->default(false);
            $table->timestampsTz();
            $table->index(['published', 'publication_date']);
        });
        Schema::create('affair_question', function (Blueprint $table) {
            $table->foreignId('current_affair_id')->constrained('current_affairs')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->restrictOnDelete();
            $table->primary(['current_affair_id', 'question_id']);
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        foreach (['affair_question', 'current_affairs', 'routine_tasks', 'question_progress', 'attempt_items', 'attempts', 'question_bookmarks', 'lesson_bookmarks', 'lesson_notes', 'reading_progress', 'paper_question', 'question_options', 'questions', 'papers', 'exam_subject', 'posts', 'institutes', 'exams', 'lesson_sections', 'lessons', 'media_files', 'topics', 'chapters', 'subjects', 'social_accounts', 'email_otps'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['role', 'is_active']));
    }
};
