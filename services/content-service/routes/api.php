<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ContentController;

/*
|--------------------------------------------------------------------------
| Content Service API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('contents', ContentController::class);
    Route::get('/campaigns/{campaignId}/contents', [ContentController::class, 'byCampaign']);
});
