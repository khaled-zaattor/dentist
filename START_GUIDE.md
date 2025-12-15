# Quick Start Guide - Migrated Application

## 🚀 Starting the Application

### Step 1: Start Laravel Backend

Open a terminal and run:
```bash
cd D:\Dentest-app\Backend\backend
php artisan serve
```

The Laravel API will be available at: `http://localhost:8000`

### Step 2: Start React Frontend

Open another terminal and run:
```bash
cd D:\Dentest-app\cavity-care-pro
npm run dev
```

The React app will be available at: `http://localhost:5173`

## 🔐 Test Credentials

### Admin User
- **Email**: admin@dental.com
- **Password**: password

### Doctor User
- **Email**: doctor@dental.com
- **Password**: password

## ✅ What's Working Now

### Authentication
- ✅ Login page
- ✅ Registration
- ✅ Logout
- ✅ Token-based authentication
- ✅ Auto-logout on token expiration

### Patients Management
- ✅ List all patients
- ✅ Search patients by name/phone
- ✅ Add new patient
- ✅ Edit patient details
- ✅ Delete patient
- ✅ Export patients to Excel
- ✅ Import patients from Excel
- ✅ Pagination

## 🧪 Testing the Migration

### 1. Test Authentication
1. Open http://localhost:5173
2. You should see the login page
3. Login with: admin@dental.com / password
4. You should be redirected to the main app
5. Check the bottom-right corner for the security indicator showing your name

### 2. Test Patients Page
1. Click on "المرضى" (Patients) in the sidebar
2. You should see an empty list (or sample data if seeded)
3. Click "إضافة مريض جديد" (Add New Patient)
4. Fill in the form:
   - Name: أحمد محمد
   - Date of Birth: 1990-01-01
   - Phone: +966501234567
   - Address: الرياض
5. Click "إضافة" (Add)
6. Patient should appear in the list

### 3. Test Search
1. Type a patient name in the search box
2. Results should filter in real-time

### 4. Test Edit
1. Click the edit icon (pencil) next to a patient
2. Modify some details
3. Click "تحديث" (Update)
4. Changes should be saved

### 5. Test Delete
1. Click the delete icon (trash) next to a patient
2. Confirm the deletion
3. Patient should be removed from the list

### 6. Test Export
1. Click "تصدير إلى Excel" (Export to Excel)
2. An Excel file should download with all patients

## 🔍 Troubleshooting

### Problem: Can't connect to Laravel API
**Solution:**
1. Make sure Laravel server is running: `php artisan serve`
2. Check the URL in browser: http://localhost:8000/api/v1
3. You should see a 404 page (this is normal - the API is working)

### Problem: Login not working
**Solution:**
1. Check Laravel logs: `Backend/backend/storage/logs/laravel.log`
2. Make sure database is migrated: `php artisan migrate:fresh --seed`
3. Try creating a new user via registration

### Problem: CORS errors in browser console
**Solution:**
1. Laravel should handle CORS automatically
2. If issues persist, check `Backend/backend/config/cors.php`

### Problem: "Network Error" or "Request failed"
**Solution:**
1. Check if Laravel server is running
2. Check the API URL in `.env`: `VITE_API_BASE_URL=http://localhost:8000/api/v1`
3. Restart the React dev server

### Problem: Token expired / Auto-logout
**Solution:**
- This is normal behavior
- Laravel Sanctum tokens expire after inactivity
- Just login again

## 📝 What's Next?

The following pages still need to be migrated:
1. Doctors page
2. Appointments page
3. Treatments page
4. Patient Profile page
5. Waiting List pages
6. Activity Logs
7. Admin Dashboard

## 🔧 Development Tips

### Viewing API Requests
Open browser DevTools (F12) → Network tab to see all API requests and responses

### Checking Authentication
Open browser DevTools (F12) → Application tab → Local Storage
You should see:
- `auth_token`: Your authentication token
- `user`: Your user data (JSON)

### Testing API Directly
Use the Postman collection: `Backend/backend/POSTMAN_COLLECTION.json`

Or use cURL:
```bash
# Login
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dental.com","password":"password"}'

# Get Patients (replace YOUR_TOKEN with the token from login)
curl -X GET http://localhost:8000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Documentation

- **Migration Status**: `MIGRATION_STATUS.md`
- **API Documentation**: `../Backend/backend/API_DOCUMENTATION.md`
- **Laravel Setup**: `../Backend/backend/SETUP_GUIDE.md`
- **Quick Reference**: `../Backend/backend/QUICK_REFERENCE.md`

## 🎉 Success Indicators

You'll know the migration is working when:
1. ✅ You can login successfully
2. ✅ You see the patients list
3. ✅ You can add/edit/delete patients
4. ✅ Search works
5. ✅ Export to Excel works
6. ✅ No Supabase errors in console
7. ✅ All API calls go to `localhost:8000`

## 🆘 Need Help?

1. Check `MIGRATION_STATUS.md` for detailed migration info
2. Review Laravel logs: `Backend/backend/storage/logs/laravel.log`
3. Check browser console for JavaScript errors
4. Test API endpoints with Postman
5. Verify database has data: `php artisan tinker` then `\App\Models\Patient::count()`

Happy testing! 🚀
