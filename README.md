# Dentist Management App

This project contains a minimal Laravel backend and a React + Tailwind
frontend for managing a dental clinic. The backend exposes APIs to
manage patients and doctors, while the frontend provides simple pages
for CRUD operations.

## Backend (Laravel)

1. Install dependencies:
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
2. Configure a database in `.env` and run migrations:
   ```bash
   php artisan migrate
   ```
3. Start the server:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://localhost:8000/api`.

## Frontend (React + Tailwind)

The frontend loads React and Tailwind from CDNs. After starting the
backend server, open the following files in a browser:

- `frontend/patients.html` — manage patients
- `frontend/doctors.html` — manage doctors

## Notes

This repo contains only a minimal skeleton to demonstrate the stack.
More models, controllers and views can be added to fully manage
appointments, treatments and billing.
