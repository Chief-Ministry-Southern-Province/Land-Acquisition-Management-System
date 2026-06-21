<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\RoleController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Laravel API works',
    ]);
});

Route::apiResource('departments', DepartmentController::class);
Route::apiResource('roles', RoleController::class);