<?php

use App\Http\Controllers\AuditLogsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompensationController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\LandParcelController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\PropertyOwnerController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API works',
    ]);
});

// ─── Auth Routes (Public) ────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// ─── Auth Routes (Protected) ────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/users', [AuthController::class, 'getAllUsers']);
});

// ─── Resource Routes ────────────────────────────────────────────────
Route::apiResource('departments', DepartmentController::class);
Route::apiResource('roles', RoleController::class);
Route::apiResource('projects', ProjectsController::class);
Route::apiResource('land-parcels', LandParcelController::class);
Route::apiResource('property-owners', PropertyOwnerController::class);
Route::apiResource('compensation', CompensationController::class);
Route::apiResource('documents', DocumentsController::class);
Route::apiResource('audit-logs', AuditLogsController::class);
