<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ApplicationEventController;
use App\Http\Controllers\Api\FollowUpController;

Route::get('/health', function () {
    return response()->json(['ok' => true]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Core resources
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('applications', ApplicationController::class);

    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // --- NEW: Follow-ups ---
    // GET /api/dashboard/followups?range=today|week
    Route::get('/dashboard/followups', [FollowUpController::class, 'list']);

    // POST /api/applications/{application}/followup/done
    Route::post('/applications/{application}/followup/done', [FollowUpController::class, 'markDone']);

    // --- NEW: Application Timeline Events ---
    // GET /api/applications/{application}/events
    Route::get('/applications/{application}/events', [ApplicationEventController::class, 'index']);

    // POST /api/applications/{application}/events
    Route::post('/applications/{application}/events', [ApplicationEventController::class, 'store']);

    // DELETE /api/applications/{application}/events/{event}
    Route::delete('/applications/{application}/events/{event}', [ApplicationEventController::class, 'destroy']);
});
