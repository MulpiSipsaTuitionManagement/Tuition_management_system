<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('role:admin');
    
    Route::get('admin/dashboard', function () {
        return response()->json(['message' => 'Welcome to Admin Dashboard']);
    })->middleware('role:admin');
    
    Route::get('tutor/dashboard', function () {
        return response()->json(['message' => 'Welcome to Tutor Dashboard']);
    })->middleware('role:tutor');
    
    Route::get('student/dashboard', function () {
        return response()->json(['message' => 'Welcome to Student Dashboard']);
    })->middleware('role:student');
});