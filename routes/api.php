<?php

use App\Http\Controllers\AOApprovalController;
use App\Http\Controllers\ASApprovalController;
use App\Http\Controllers\AuditLogsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\CompensationController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\HOBApprovalController;
use App\Http\Controllers\LandParcelController;
use App\Http\Controllers\LandSurveyController;
use App\Http\Controllers\LandValuationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\PropertyOwnerController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SASApprovalController;
use App\Http\Controllers\SECApprovalController;
use App\Http\Controllers\UserController;
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
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// ─── Protected Routes (Authenticated) ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    // Resource Routes
    Route::get('projects/export', [ProjectsController::class, 'export']);
    Route::post('projects/{id}/submit', [ProjectsController::class, 'submit']);
    Route::apiResource('projects', ProjectsController::class);
    Route::get('land-parcels/export', [LandParcelController::class, 'export']);
    Route::post('land-parcels/import', [LandParcelController::class, 'import']);
    Route::apiResource('land-parcels', LandParcelController::class);
    Route::get('property-owners/export', [PropertyOwnerController::class, 'export']);
    Route::apiResource('property-owners', PropertyOwnerController::class);
    Route::apiResource('compensation', CompensationController::class);
    Route::get('documents/{id}/download', [DocumentsController::class, 'download']);
    Route::apiResource('documents', DocumentsController::class);
    Route::get('departments', [DepartmentController::class, 'index']);
    Route::get('departments/{id}', [DepartmentController::class, 'show']);

    // Notifications Routes
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // ─── Land Acquisition Workflow Routes ───────────────────────────────
    // DO & Admin can write data
    Route::middleware('check.role:DO')->group(function () {
        Route::post('land-surveys', [LandSurveyController::class, 'store']);
        Route::put('land-surveys/{id}', [LandSurveyController::class, 'update']);
        Route::delete('land-surveys/{id}', [LandSurveyController::class, 'destroy']);

        Route::post('land-valuations', [LandValuationController::class, 'store']);
        Route::put('land-valuations/{id}', [LandValuationController::class, 'update']);
        Route::delete('land-valuations/{id}', [LandValuationController::class, 'destroy']);

        Route::post('payments', [PaymentController::class, 'store']);
        Route::put('payments/{id}', [PaymentController::class, 'update']);
        Route::delete('payments/{id}', [PaymentController::class, 'destroy']);
    });

    // Read-only endpoints for all authenticated users
    Route::get('land-surveys', [LandSurveyController::class, 'index']);
    Route::get('land-surveys/{id}', [LandSurveyController::class, 'show']);
    Route::get('land-valuations', [LandValuationController::class, 'index']);
    Route::get('land-valuations/{id}', [LandValuationController::class, 'show']);
    Route::get('payments', [PaymentController::class, 'index']);
    Route::get('payments/{id}', [PaymentController::class, 'show']);

    // ─── Head of Branch Routes ───────────────────────────────────────
    Route::middleware('check.role:HOB')->group(function () {
        Route::get('/hob/pending-approvals', [HOBApprovalController::class, 'index']);
        Route::post('/hob/approvals/{type}/{id}/approve', [HOBApprovalController::class, 'approve']);
        Route::post('/hob/approvals/{type}/{id}/query', [HOBApprovalController::class, 'query']);
        Route::post('/hob/approvals/{type}/{id}/reject', [HOBApprovalController::class, 'reject']);
    });

    // ─── Administrative Officer Routes ───────────────────────────────────────
    Route::middleware('check.role:AO')->group(function () {
        Route::get('/ao/pending-approvals', [AOApprovalController::class, 'index']);
        Route::post('/ao/approvals/{type}/{id}/approve', [AOApprovalController::class, 'approve']);
        Route::post('/ao/approvals/{type}/{id}/query', [AOApprovalController::class, 'query']);
        Route::post('/ao/approvals/{type}/{id}/reject', [AOApprovalController::class, 'reject']);
    });

    // ─── Assistant Secretary Routes ───────────────────────────────────────
    Route::middleware('check.role:AS')->group(function () {
        Route::get('/as/pending-approvals', [ASApprovalController::class, 'index']);
        Route::post('/as/approvals/{type}/{id}/approve', [ASApprovalController::class, 'approve']);
        Route::post('/as/approvals/{type}/{id}/reject', [ASApprovalController::class, 'reject']);
    });

    // ─── Senior Assistant Secretary Routes ──────────────────────────────────
    Route::middleware('check.role:SAS')->group(function () {
        Route::get('/sas/pending-approvals', [SASApprovalController::class, 'index']);
        Route::post('/sas/approvals/{type}/{id}/approve', [SASApprovalController::class, 'approve']);
        Route::post('/sas/approvals/{type}/{id}/reject', [SASApprovalController::class, 'reject']);
    });

    // ─── Secretary Routes ──────────────────────────────────────────────────
    Route::middleware('check.role:SEC')->group(function () {
        Route::get('/sec/pending-approvals', [SECApprovalController::class, 'index']);
        Route::post('/sec/approvals/{type}/{id}/approve', [SECApprovalController::class, 'approve']);
        Route::post('/sec/approvals/{type}/{id}/reject', [SECApprovalController::class, 'reject']);
    });

    // ─── Admin Only Routes ───────────────────────────────────────────
    Route::middleware('check.role:Admin')->group(function () {
        Route::get('/users', [UserController::class, 'getAllUsers']);
        Route::put('/users/{id}', [UserController::class, 'updateUser']);
        Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

        Route::post('departments', [DepartmentController::class, 'store']);
        Route::put('departments/{id}', [DepartmentController::class, 'update']);
        Route::delete('departments/{id}', [DepartmentController::class, 'destroy']);
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('audit-logs', AuditLogsController::class);

        Route::get('/backups', [BackupController::class, 'index']);
        Route::post('/backups', [BackupController::class, 'create']);
        Route::post('/backups/files', [BackupController::class, 'createFiles']);
        Route::get('/backups/{filename}', [BackupController::class, 'download']);
        Route::delete('/backups/{filename}', [BackupController::class, 'destroy']);
        Route::post('/backups/{filename}/restore', [BackupController::class, 'restore']);
        Route::post('/clear-cache', [BackupController::class, 'clearCache']);
    });
});
