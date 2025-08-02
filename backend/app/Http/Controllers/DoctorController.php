<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        return response()
            ->json(Doctor::all())
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function store(Request $request)
    {
        $doctor = Doctor::create($request->only(['name', 'specialty']));
        return response()
            ->json($doctor, 201)
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function show(Doctor $doctor)
    {
        return response()
            ->json($doctor)
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function update(Request $request, Doctor $doctor)
    {
        $doctor->update($request->only(['name', 'specialty']));
        return response()
            ->json($doctor)
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function destroy(Doctor $doctor)
    {
        $doctor->delete();
        return response()
            ->json(null, 204)
            ->header('Access-Control-Allow-Origin', '*');
    }
}
