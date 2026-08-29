<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CampaignController;

/*
|--------------------------------------------------------------------------
| Campaign Service API Routes
|--------------------------------------------------------------------------
*/

// Protected campaign routes (require Sanctum token validated against shared DB)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('campaigns', CampaignController::class);
    Route::get('/campaigns/approved', [CampaignController::class, 'getApprovedCampaigns']);
    Route::get('/campaigns/resident-phone-numbers', [CampaignController::class, 'getResidentPhoneNumbers']);
});
