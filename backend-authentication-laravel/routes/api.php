<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MeController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
});

Route::middleware('auth:api')->group(function () {
    Route::get('me', [MeController::class, 'show']);
});
