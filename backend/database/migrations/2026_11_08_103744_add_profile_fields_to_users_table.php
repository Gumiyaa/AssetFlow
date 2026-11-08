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
        Schema::table('users', function (Blueprint $table) {
            $table->string('public_id')->nullable()->unique()->after('id');
            $table->string('employee_id')->nullable()->after('public_id');
            $table->string('username')->nullable()->unique()->after('email');
            $table->string('role')->default('Staff')->after('username');
            $table->string('position')->nullable()->after('role');
            $table->string('department')->nullable()->after('position');
            $table->string('phone')->nullable()->after('department');
            $table->string('initials', 4)->nullable()->after('phone');
            $table->string('avatar_color', 20)->nullable()->after('initials');
            $table->date('join_date')->nullable()->after('avatar_color');
            $table->string('two_fa')->nullable()->after('join_date');
            $table->string('status')->default('Aktif')->after('two_fa');
            $table->timestamp('last_login')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['public_id']);
            $table->dropUnique(['username']);
            $table->dropColumn([
                'public_id',
                'employee_id',
                'username',
                'role',
                'position',
                'department',
                'phone',
                'initials',
                'avatar_color',
                'join_date',
                'two_fa',
                'status',
                'last_login',
            ]);
        });
    }
};
