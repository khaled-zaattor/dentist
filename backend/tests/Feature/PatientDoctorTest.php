<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientDoctorTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_management(): void
    {
        $payload = ['name' => 'John Doe', 'phone' => '123456789'];

        $this->postJson('/api/patients', $payload)
            ->assertStatus(201)
            ->assertJsonFragment($payload);

        $this->getJson('/api/patients')
            ->assertStatus(200)
            ->assertJsonFragment($payload);
    }

    public function test_doctor_management(): void
    {
        $payload = ['name' => 'Dr. Smith', 'phone' => '555-1234'];

        $this->postJson('/api/doctors', $payload)
            ->assertStatus(201)
            ->assertJsonFragment($payload);

        $this->getJson('/api/doctors')
            ->assertStatus(200)
            ->assertJsonFragment($payload);
    }
}
