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
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
        ]);

        $doctor = Doctor::create($data);

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
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:255',
        ]);

        $doctor->update($data);

        return response()
            ->json($doctor)
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function destroy(Doctor $doctor)
    {
        $doctor->delete();

        return response()
            ->noContent()
            ->header('Access-Control-Allow-Origin', '*');
    }
}
