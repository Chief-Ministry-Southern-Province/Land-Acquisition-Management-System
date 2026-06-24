<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\LandParcelController;
use App\Http\Controllers\PropertyOwnerController;
use App\Http\Controllers\CompensationController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\AuditLogsController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API works',
    ]);
});

Route::apiResource('departments', DepartmentController::class);
Route::apiResource('roles', RoleController::class);
Route::apiResource('projects', ProjectsController::class);
Route::apiResource('land-parcels', LandParcelController::class);
Route::apiResource('property-owners', PropertyOwnerController::class);
Route::apiResource('compensation', CompensationController::class);
Route::apiResource('documents', DocumentsController::class);
Route::apiResource('audit-logs', AuditLogsController::class);