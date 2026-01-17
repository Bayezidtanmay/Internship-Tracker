<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('role_title');
            $table->string('status'); // APPLIED, INTERVIEW, OFFER, REJECTED, WISHLIST
            $table->date('applied_date')->nullable();
            $table->date('next_follow_up')->nullable();

            $table->string('job_url')->nullable();
            $table->string('salary_range')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
