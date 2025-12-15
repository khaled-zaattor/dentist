# 🚀 Quick Start Guide

## Start the Application

### Terminal 1 - Laravel Backend
```bash
cd D:\Dentest-app\Backend\backend
php artisan serve
```
✅ Backend running at: http://localhost:8000

### Terminal 2 - React Frontend
```bash
cd D:\Dentest-app\cavity-care-pro
npm run dev
```
✅ Frontend running at: http://localhost:5173

## Login

- **URL:** http://localhost:5173
- **Email:** admin@dental.com
- **Password:** password

## Test All Features

### 1. Patients ✅
- Click "المرضى" (Patients)
- Add, edit, delete patients
- Search by name/phone
- Export to Excel
- Import from Excel
- Click on patient to view profile

### 2. Doctors ✅
- Click "الأطباء" (Doctors)
- Add, edit, delete doctors
- Search by name/specialty
- Click on doctor to view profile

### 3. Appointments ✅
- Click "المواعيد" (Appointments)
- Add, edit, delete appointments
- Filter by doctor, date, status
- View appointment details

### 4. Treatments ✅
- Click "العلاجات" (Treatments)
- Add, edit, delete treatments
- View treatment details

### 5. Waiting List ✅
- Click "قائمة الانتظار" (Waiting List)
- Add patients to queue
- Update status (waiting → in_examination → completed)
- Watch real-time updates (every 5 seconds)

### 6. Waiting List Display ✅
- Click "عرض قائمة الانتظار" (Waiting List Display)
- View public display
- Watch real-time updates (every 3 seconds)

### 7. Activity Logs ✅
- Click "سجل النشاطات" (Activity Logs)
- View system activity
- See user actions

### 8. Admin Dashboard ✅
- Click "لوحة التحكم" (Dashboard)
- View statistics
- See total counts

## API Endpoints

All endpoints are at: `http://localhost:8000/api/v1`

### Authentication
- POST `/login` - Login
- POST `/register` - Register
- POST `/logout` - Logout

### Patients
- GET `/patients` - List
- POST `/patients` - Create
- GET `/patients/{id}` - Get
- PUT `/patients/{id}` - Update
- DELETE `/patients/{id}` - Delete

### Doctors
- GET `/doctors` - List
- POST `/doctors` - Create
- GET `/doctors/{id}` - Get
- PUT `/doctors/{id}` - Update
- DELETE `/doctors/{id}` - Delete

### Appointments
- GET `/appointments` - List
- POST `/appointments` - Create
- GET `/appointments/{id}` - Get
- PUT `/appointments/{id}` - Update
- DELETE `/appointments/{id}` - Delete

### Treatments
- GET `/treatments` - List
- POST `/treatments` - Create
- GET `/treatments/{id}` - Get
- PUT `/treatments/{id}` - Update
- DELETE `/treatments/{id}` - Delete

### Waiting List
- GET `/waiting-list` - List
- POST `/waiting-list` - Add
- PUT `/waiting-list/{id}` - Update
- DELETE `/waiting-list/{id}` - Remove
- GET `/waiting-list/display` - Public (no auth)

### Activity Logs
- GET `/activity-logs` - List

### Statistics
- GET `/statistics/overview` - Overview
- GET `/statistics/appointments-by-status` - By status
- GET `/statistics/patients-by-month` - By month

## Troubleshooting

### Can't Login?
1. Check Laravel server is running
2. Check database is migrated: `php artisan migrate:fresh --seed`
3. Check browser console for errors

### API Errors?
1. Check Laravel logs: `Backend/backend/storage/logs/laravel.log`
2. Check API URL in `.env`: `VITE_API_BASE_URL=http://localhost:8000/api/v1`
3. Restart both servers

### CORS Issues?
- Laravel handles CORS automatically
- If issues persist, check `Backend/backend/config/cors.php`

### Real-time Not Working?
- Waiting list updates every 5 seconds (management)
- Waiting list updates every 3 seconds (display)
- Check browser console for errors

## Quick Commands

### Laravel
```bash
# Run migrations
php artisan migrate

# Reset database
php artisan migrate:fresh --seed

# Clear cache
php artisan cache:clear

# View routes
php artisan route:list
```

### React
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Status Check

✅ **Everything Working?**
- [ ] Can login
- [ ] Can add/edit/delete patients
- [ ] Can add/edit/delete doctors
- [ ] Can add/edit/delete appointments
- [ ] Can add/edit/delete treatments
- [ ] Waiting list works
- [ ] Activity logs show
- [ ] Dashboard shows statistics

## Need Help?

Check these files:
- `MIGRATION_100_PERCENT_COMPLETE.md` - Complete guide
- `FINAL_SUMMARY.md` - Summary
- `API_DOCUMENTATION.md` - API reference
- `TESTING_CHECKLIST.md` - Testing guide

---

**Status:** 100% Complete ✅
**Ready to Use:** YES ✅

🎉 **Enjoy your new dental clinic management system!** 🎉
