<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('device_id');
            $table->string('platform', 16);
            $table->string('device_name', 120)->nullable();
            $table->string('os_version', 80)->nullable();
            $table->string('app_version', 40)->nullable();
            $table->timestamp('first_login_at');
            $table->timestamp('last_login_at');
            $table->timestamps();
            $table->unique(['user_id', 'device_id']);
        });
        Schema::create('device_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_device_id')->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('logged_in_at');
            $table->timestamp('last_seen_at');
            $table->timestamp('expires_at')->index();
            $table->timestamp('revoked_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_sessions');
        Schema::dropIfExists('user_devices');
    }
};
