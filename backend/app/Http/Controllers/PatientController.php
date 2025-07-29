<?php

namespace App\Http\Controllers;

use App\Models\Patient;

class PatientController extends Controller
{
    public function index()
    {
        return response()
            ->json(Patient::all())
            ->header('Access-Control-Allow-Origin', '*');
    }
}
