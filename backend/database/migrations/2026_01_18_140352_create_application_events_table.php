<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('application_events', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();

            $table->string('type'); // APPLIED, FOLLOW_UP, INTERVIEW, OFFER, REJECTED, NOTE, STATUS_CHANGED
            $table->date('event_date')->nullable();
            $table->text('note')->nullable();
            $table->json('meta')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'application_id']);
            $table->index(['application_id', 'event_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_events');
    }
};
