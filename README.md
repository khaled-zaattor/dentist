# Dentist Management App

This project contains a minimal Laravel backend and a React + Tailwind
frontend for managing a dental clinic. The backend exposes a simple API
to list patients while the frontend demonstrates fetching that data.

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

The frontend is a very small example that loads React and Tailwind
from CDNs. Open `frontend/index.html` in a browser while the backend is
running to see the list of patients returned by the API.

## Notes

This repo contains only a minimal skeleton to demonstrate the stack.
More models, controllers and views can be added to fully manage doctors,
appointments, treatments and billing.
