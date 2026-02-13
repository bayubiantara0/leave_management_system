<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::apiResource('roles', \App\Http\Controllers\Api\RoleController::class);
        Route::apiResource('permissions', \App\Http\Controllers\Api\PermissionController::class);
        Route::apiResource('employees', \App\Http\Controllers\Api\EmployeeController::class);
        Route::apiResource('departments', \App\Http\Controllers\Api\DepartmentController::class);
        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
        
        Route::apiResource('leaves', \App\Http\Controllers\Api\LeaveRequestController::class);
        Route::put('leaves/{id}/approval', [\App\Http\Controllers\Api\LeaveRequestController::class, 'approve']);
    });
});
