# Dental Clinic Management System - Laravel Migration

## 🎯 Project Overview

This React application has been migrated from Supabase to a Laravel backend. The migration provides better control, security, and scalability for the dental clinic management system.

## 📚 Documentation Files

- **START_GUIDE.md** - Quick start instructions
- **MIGRATION_STATUS.md** - Detailed migration progress
- **MIGRATION_COMPLETE_SUMMARY.md** - What's been done
- **TESTING_CHECKLIST.md** - Comprehensive testing guide
- **README_MIGRATION.md** - This file

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PHP 8.2+
- MySQL/PostgreSQL
- Composer

### 1. Start Laravel Backend
```bash
cd D:\Dentest-app\Backend\backend
php artisan serve
```

### 2. Start React Frontend
```bash
cd D:\Dentest-app\cavity-care-pro
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1

### 4. Login
- Email: admin@dental.com
- Password: password

## ✅ What's Working

### Fully Migrated
- ✅ Authentication (Login/Register/Logout)
- ✅ Patients Management (Full CRUD)
- ✅ Search & Pagination
- ✅ Excel Export/Import

### Still Using Supabase
- ⏳ Doctors page
- ⏳ Appointments page
- ⏳ Treatments page
- ⏳ Patient Profile page
- ⏳ Waiting List pages
- ⏳ Activity Logs
- ⏳ Admin Dashboard

## 🏗️ Architecture

### Frontend Stack
- React 18
- TypeScript
- TanStack Query (React Query)
- Axios for HTTP requests
- Shadcn/ui components
- Tailwind CSS

### Backend Stack
- Laravel 12
- Laravel Sanctum (Authentication)
- MySQL Database
- RESTful API

### Data Flow
```
React Component
    ↓
TanStack Query
    ↓
Service Layer (patientService)
    ↓
API Client (Axios)
    ↓
Laravel API
    ↓
MySQL Database
```

## 📁 Project Structure

```
cavity-care-pro/
├── src/
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts              # Axios client
│   │       ├── types.ts               # TypeScript types
│   │       └── services/              # API services
│   │           ├── auth.service.ts
│   │           ├── patient.service.ts
│   │           ├── doctor.service.ts
│   │           ├── appointment.service.ts
│   │           └── treatment.service.ts
│   ├── components/
│   │   ├── AuthWrapper.tsx            # Authentication wrapper
│   │   └── ui/                        # UI components
│   ├── pages/
│   │   ├── Patients.tsx               # ✅ Migrated
│   │   ├── Doctors.tsx                # ⏳ To migrate
│   │   ├── Appointments.tsx           # ⏳ To migrate
│   │   └── ...
│   └── integrations/
│       └── supabase/                  # ⚠️ To be removed
├── .env                               # Environment variables
└── Documentation files...
```

## 🔧 Configuration

### Environment Variables (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### API Client Configuration
- Base URL: From environment variable
- Timeout: 30 seconds
- Auto token injection
- Auto 401 handling

## 🔐 Authentication

### How It Works
1. User logs in with email/password
2. Laravel returns JWT token + user data
3. Token stored in localStorage
4. Token automatically added to all API requests
5. On 401 error → Auto logout

### Token Storage
- Key: `auth_token`
- Location: localStorage
- Format: Plain text JWT token

### User Data Storage
- Key: `user`
- Location: localStorage
- Format: JSON string

## 📡 API Services

### Patient Service
```typescript
import { patientService } from '@/lib/api/services';

// Get all patients
const patients = await patientService.getAll({ 
  search: 'john', 
  per_page: 15 
});

// Get single patient
const patient = await patientService.getById(id);

// Create patient
const newPatient = await patientService.create(data);

// Update patient
const updated = await patientService.update(id, data);

// Delete patient
await patientService.delete(id);
```

### Similar patterns for:
- Doctor Service
- Appointment Service
- Treatment Service

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm test

# Backend tests
cd ../Backend/backend
php artisan test
```

### Manual Testing
Follow the comprehensive checklist in `TESTING_CHECKLIST.md`

## 🐛 Troubleshooting

### Can't Login
1. Check Laravel server is running
2. Check database is migrated
3. Verify test user exists
4. Check browser console for errors

### API Errors
1. Check Laravel logs: `Backend/backend/storage/logs/laravel.log`
2. Verify API URL in `.env`
3. Check CORS configuration
4. Test API with Postman

### CORS Issues
Laravel should handle CORS automatically. If issues persist:
1. Check `Backend/backend/config/cors.php`
2. Ensure `allowed_origins` includes your frontend URL

### Token Expired
- Normal behavior after inactivity
- Just login again
- Token lifetime configured in Laravel

## 📊 Migration Progress

### Completed (30%)
- ✅ API infrastructure
- ✅ Authentication system
- ✅ Service layer
- ✅ Patients page

### In Progress (0%)
- ⏳ None currently

### Pending (70%)
- ⏳ 10 more pages to migrate
- ⏳ Additional services needed
- ⏳ Laravel backend enhancements
- ⏳ Real-time features
- ⏳ Final cleanup

## 🔜 Next Steps

1. **Test Current Migration**
   - Use `TESTING_CHECKLIST.md`
   - Verify all functionality

2. **Migrate Doctors Page**
   - Similar to Patients
   - Should be quick

3. **Migrate Appointments Page**
   - More complex
   - Needs date filtering

4. **Continue with Other Pages**
   - Follow established pattern
   - One page at a time

5. **Remove Supabase**
   - After all pages migrated
   - Clean up dependencies

## 📚 Additional Resources

### Laravel Backend Documentation
- API Documentation: `../Backend/backend/API_DOCUMENTATION.md`
- Setup Guide: `../Backend/backend/SETUP_GUIDE.md`
- Quick Reference: `../Backend/backend/QUICK_REFERENCE.md`
- Postman Collection: `../Backend/backend/POSTMAN_COLLECTION.json`

### React Frontend
- Component Library: Shadcn/ui
- State Management: TanStack Query
- HTTP Client: Axios
- Styling: Tailwind CSS

## 🤝 Contributing

### Adding New Features
1. Create service in `src/lib/api/services/`
2. Add types in `src/lib/api/types.ts`
3. Use service in components
4. Follow existing patterns

### Migrating Pages
1. Replace Supabase imports with service imports
2. Update useQuery to use service methods
3. Update mutations to use service methods
4. Add error handling
5. Test thoroughly

## 📝 Code Style

### TypeScript
- Use interfaces for data types
- Use type for unions/intersections
- Prefer explicit types over `any`

### React
- Functional components only
- Use hooks for state management
- TanStack Query for server state
- Proper error boundaries

### API Services
- One service per entity
- CRUD methods: getAll, getById, create, update, delete
- Consistent error handling
- Type-safe responses

## 🔒 Security

### Authentication
- JWT tokens via Laravel Sanctum
- Tokens stored in localStorage
- Auto-expiration handling
- CSRF protection

### API Security
- All endpoints require authentication
- Role-based access control (planned)
- Input validation
- SQL injection prevention (Eloquent ORM)

## 🚀 Deployment

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Configure environment variables

### Backend
1. Configure production `.env`
2. Run migrations: `php artisan migrate`
3. Optimize: `php artisan optimize`
4. Deploy to server

## 📞 Support

### Getting Help
1. Check documentation files
2. Review Laravel logs
3. Check browser console
4. Test with Postman
5. Review migration status

### Common Issues
- See `TROUBLESHOOTING.md` (if exists)
- Check `MIGRATION_STATUS.md`
- Review `TESTING_CHECKLIST.md`

## 📄 License

[Your License Here]

## 👥 Team

[Your Team Information]

---

**Last Updated**: November 4, 2025
**Migration Status**: Phase 1-4 Complete (30%)
**Next Milestone**: Migrate Doctors & Appointments pages
