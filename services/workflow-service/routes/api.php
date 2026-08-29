<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WorkflowController;

/*
|--------------------------------------------------------------------------
| Workflow Service API Routes
|--------------------------------------------------------------------------
*/

// Metrics are used by the Process Monitoring Dashboard
Route::get('/workflow/metrics', [WorkflowController::class, 'getMetrics']);
Route::post('/workflow/escalation-check', [WorkflowController::class, 'runEscalationCheck']);
