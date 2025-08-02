<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;

Route::apiResource('patients', PatientController::class);
Route::apiResource('doctors', DoctorController::class);
