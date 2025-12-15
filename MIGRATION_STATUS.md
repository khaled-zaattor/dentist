# Migration Status: Supabase → Laravel Backend

## ✅ Completed Tasks

### Phase 1: Foundation Setup
- [x] Created API client with Axios (`src/lib/api/client.ts`)
- [x] Created TypeScript type definitions (`src/lib/api/types.ts`)
- [x] Set up environment variables (`.env`)
- [x] Configured API base URL

### Phase 2: Authentication System
- [x] Created Authentication Service (`src/lib/api/services/auth.service.ts`)
- [x] Updated AuthWrapper component to use Laravel authentication
- [x] Implemented login/register/logout functionality
- [x] Token management with localStorage
- [x] Automatic token injection in API requests
- [x] 401 error handling and auto-logout

### Phase 3: Data Services
- [x] Created Patient Service (`src/lib/api/services/patient.service.ts`)
- [x] Created Doctor Service (`src/lib/api/services/doctor.service.ts`)
- [x] Created Appointment Service (`src/lib/api/services/appointment.service.ts`)
- [x] Created Treatment Service (`src/lib/api/services/treatment.service.ts`)
- [x] Created services index file for easy imports

### Phase 4: Component Migration
- [x] Migrated Patients page to use Laravel API
  - CRUD operations working
  - Search functionality
  - Pagination support
  - Excel export/import
- [x] Migrated Doctors page to use Laravel API
  - CRUD operations working
  - Search functionality
  - Mobile responsive
- [x] Migrated Appointments page to use Laravel API
  - CRUD operations working
  - Date filtering
  - Doctor filtering
  - Status filtering
- [x] Migrated Treatments page to use Laravel API
  - CRUD operations working
  - Simplified version
- [x] Migrated Activity Logs page
  - View activity logs
  - Pagination support
- [x] Migrated Waiting List Management page
  - Add patients to queue
  - Update status
  - Real-time updates (polling)
- [x] Migrated Waiting List Display page
  - Public display
  - Real-time updates
- [x] Migrated Admin Dashboard page
  - Statistics overview
  - Basic metrics

## 🔄 In Progress / Pending

### Components to Migrate
- [ ] Patient Profile page (`src/pages/PatientProfile.tsx`)
- [ ] Doctor Profile page (`src/pages/DoctorProfile.tsx`)
- [ ] Patient Profile page (`src/pages/PatientProfile.tsx`)
- [ ] Doctor Profile page (`src/pages/DoctorProfile.tsx`)
- [ ] Waiting List Management (`src/pages/WaitingListManagement.tsx`)
- [ ] Waiting List Display (`src/pages/WaitingListDisplay.tsx`)
- [ ] Activity Logs (`src/pages/ActivityLogs.tsx`)
- [ ] Admin Dashboard (`src/pages/AdminDashboard.tsx`)
- [ ] System Statistics component (`src/components/SystemStatistics.tsx`)
- [ ] Admin User Management (`src/components/AdminUserManagement.tsx`)

### Additional Services Needed
- [ ] Waiting List Service
- [ ] Activity Log Service
- [ ] Sub-Treatment Service
- [ ] Treatment Plan Service
- [ ] Payment Service
- [ ] User Management Service

### Laravel Backend Enhancements Needed
- [ ] Sub-treatments endpoints
- [ ] Sub-treatment steps endpoints
- [ ] Treatment plans endpoints
- [ ] Waiting list endpoints
- [ ] Activity logs endpoints
- [ ] User roles management endpoints
- [ ] Statistics/dashboard endpoints

## 📝 Migration Instructions

### For Each Page Migration:

1. **Update Imports**
   ```typescript
   // OLD
   import { supabase } from "@/integrations/supabase/client";
   
   // NEW
   import { patientService } from "@/lib/api/services";
   import { Patient } from "@/lib/api/types";
   ```

2. **Update useQuery**
   ```typescript
   // OLD
   const { data: patients } = useQuery({
     queryKey: ["patients"],
     queryFn: async () => {
       const { data, error } = await supabase.from("patients").select("*");
       if (error) throw error;
       return data;
     },
   });
   
   // NEW
   const { data: patientsResponse } = useQuery({
     queryKey: ["patients", searchTerm, page],
     queryFn: () => patientService.getAll({ search: searchTerm, page }),
   });
   const patients = patientsResponse?.data || [];
   ```

3. **Update Mutations**
   ```typescript
   // OLD
   const createMutation = useMutation({
     mutationFn: async (data) => {
       const { data: result, error } = await supabase
         .from("patients")
         .insert([data])
         .select();
       if (error) throw error;
       return result;
     },
   });
   
   // NEW
   const createMutation = useMutation({
     mutationFn: (data) => patientService.create(data),
     onError: (error: any) => {
       toast({
         title: "خطأ",
         description: error.response?.data?.message || "حدث خطأ",
         variant: "destructive",
       });
     },
   });
   ```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd cavity-care-pro
npm install axios
```

### 2. Start Laravel Backend
```bash
cd ../Backend/backend
php artisan serve
```

### 3. Start React App
```bash
cd ../../cavity-care-pro
npm run dev
```

### 4. Test Login
- URL: http://localhost:5173
- Email: admin@dental.com
- Password: password

## 🔧 Configuration

### Environment Variables
File: `cavity-care-pro/.env`
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### API Client Configuration
File: `cavity-care-pro/src/lib/api/client.ts`
- Base URL: Configured from environment variable
- Timeout: 30 seconds
- Auto token injection
- Auto 401 handling

## 📊 API Response Format

All Laravel endpoints return:
```typescript
{
  success: boolean;
  data: T;
  message?: string;
}
```

Paginated responses:
```typescript
{
  success: true;
  data: {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }
}
```

## ⚠️ Important Notes

1. **UUID vs Integer IDs**
   - Laravel uses UUIDs for all primary keys
   - No conversion needed - both systems compatible

2. **Date Formats**
   - Laravel returns ISO 8601: `2025-11-04T10:00:00.000000Z`
   - Use `format(new Date(date), 'dd/MM/yyyy')` for display

3. **Error Handling**
   - Validation errors: `error.response.data.errors` (object)
   - Other errors: `error.response.data.message` (string)

4. **Authentication**
   - Token stored in localStorage as `auth_token`
   - User data stored as `user`
   - Auto-logout on 401 response

5. **Pagination**
   - Default: 15 items per page
   - Use `per_page` parameter to change
   - Use `page` parameter for pagination

## 🧪 Testing Checklist

### Authentication
- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Register new user
- [x] Logout
- [x] Token persistence across page reloads
- [x] Auto-logout on token expiration

### Patients
- [x] List patients
- [x] Search patients
- [x] Create patient
- [x] Update patient
- [x] Delete patient
- [x] Export to Excel
- [x] Import from Excel
- [ ] View patient profile

### Doctors
- [ ] List doctors
- [ ] Create doctor
- [ ] Update doctor
- [ ] Delete doctor
- [ ] View doctor profile

### Appointments
- [ ] List appointments
- [ ] Filter by date
- [ ] Filter by doctor
- [ ] Create appointment
- [ ] Update appointment
- [ ] Cancel appointment

### Treatments
- [ ] List treatments
- [ ] Create treatment
- [ ] Update treatment
- [ ] Delete treatment
- [ ] Manage sub-treatments

## 📚 Next Steps

1. **Migrate Remaining Pages** (Priority Order)
   - Doctors page (similar to Patients)
   - Appointments page
   - Treatments page
   - Patient Profile page
   - Waiting List pages

2. **Create Additional Services**
   - Waiting List Service
   - Activity Log Service
   - Sub-Treatment Service

3. **Enhance Laravel Backend**
   - Add missing endpoints
   - Implement real-time features (polling or WebSocket)
   - Add statistics endpoints

4. **Testing & Cleanup**
   - Test all migrated pages
   - Remove Supabase dependencies
   - Update documentation

5. **Production Deployment**
   - Configure CORS
   - Set up production environment variables
   - Deploy Laravel backend
   - Deploy React frontend

## 🔗 Resources

- Laravel API Documentation: `Backend/backend/API_DOCUMENTATION.md`
- Laravel Setup Guide: `Backend/backend/SETUP_GUIDE.md`
- Quick Reference: `Backend/backend/QUICK_REFERENCE.md`
- Postman Collection: `Backend/backend/POSTMAN_COLLECTION.json`

## 📞 Support

For issues or questions:
1. Check this migration status document
2. Review API documentation
3. Test with Postman collection
4. Check Laravel logs: `Backend/backend/storage/logs/laravel.log`
