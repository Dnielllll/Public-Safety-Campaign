<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\WorkflowController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Campaign routes
    Route::apiResource('campaigns', CampaignController::class);
    Route::get('/campaigns/approved', [CampaignController::class, 'getApprovedCampaigns']);
    Route::get('/campaigns/resident-phone-numbers', [CampaignController::class, 'getResidentPhoneNumbers']);

    // Content routes
    Route::apiResource('contents', ContentController::class);
    Route::get('/campaigns/{campaignId}/contents', [ContentController::class, 'index']);
});

// Public SMS distribution route (for testing - add auth in production)
Route::post('/campaigns/distribute-sms', [CampaignController::class, 'distributeSMS']);

// Workflow metrics route (for Process Monitoring Dashboard)
Route::get('/workflow/metrics', [WorkflowController::class, 'getMetrics']);
Route::post('/workflow/escalation-check', [WorkflowController::class, 'runEscalationCheck']);
