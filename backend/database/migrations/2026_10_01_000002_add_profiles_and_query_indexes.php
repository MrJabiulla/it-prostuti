<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('daily_minutes')->default(30);
            $table->unsignedSmallInteger('daily_questions')->default(10);
            $table->date('target_date')->nullable();
            $table->string('theme', 20)->default('light');
            $table->string('font_size', 20)->default('standard');
            $table->boolean('reminder')->default(false);
            $table->time('reminder_time')->default('20:00');
            $table->string('timezone', 80)->default('Asia/Dhaka');
            $table->timestampsTz();
        });
        Schema::table('questions', fn (Blueprint $table) => $table->index(['published', 'id']));
        Schema::table('papers', fn (Blueprint $table) => $table->index(['published', 'year', 'id']));
        // MySQL automatically indexes foreign-key columns.

    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
        Schema::table('questions', fn (Blueprint $table) => $table->dropIndex(['published', 'id']));
        Schema::table('papers', fn (Blueprint $table) => $table->dropIndex(['published', 'year', 'id']));

    }
};
