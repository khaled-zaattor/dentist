<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PatientController;

Route::get('/patients', [PatientController::class, 'index']);

