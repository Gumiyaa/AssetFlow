<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('department')->nullable()->index();
            $table->string('position')->nullable();
            $table->string('status')->default('Aktif')->index();
            $table->date('join_date')->nullable();
            $table->string('manager')->nullable();
            $table->string('location')->nullable();
            $table->string('initials', 4)->nullable();
            $table->string('avatar_color', 20)->nullable();
            $table->unsignedInteger('assets_count')->default(0);
            $table->string('grade')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
