# Testing Checklist - Laravel Migration

## 🧪 Pre-Testing Setup

### Backend Setup
- [ ] Laravel server is running (`php artisan serve`)
- [ ] Database is migrated (`php artisan migrate:fresh --seed`)
- [ ] Test users exist (admin@dental.com, doctor@dental.com)
- [ ] API is accessible at http://localhost:8000/api/v1

### Frontend Setup
- [ ] React dev server is running (`npm run dev`)
- [ ] App is accessible at http://localhost:5173
- [ ] `.env` file has correct API URL
- [ ] No build errors in terminal

## ✅ Authentication Testing

### Login
- [ ] Can access login page
- [ ] Can login with admin@dental.com / password
- [ ] Can login with doctor@dental.com / password
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to main app
- [ ] User name appears in bottom-right security indicator
- [ ] Token is stored in localStorage
- [ ] User data is stored in localStorage

### Registration
- [ ] Can switch to registration form
- [ ] Full name field is visible
- [ ] Can register new user
- [ ] Registration creates account and logs in
- [ ] Success message appears

### Logout
- [ ] Logout button works
- [ ] Token is removed from localStorage
- [ ] User is redirected to login page
- [ ] Success message appears

### Session Persistence
- [ ] Refresh page while logged in - stays logged in
- [ ] Close and reopen browser - stays logged in
- [ ] Token expiration triggers auto-logout

## ✅ Patients Page Testing

### List View
- [ ] Patients page loads without errors
- [ ] Patients list is displayed
- [ ] Pagination works (if more than 15 patients)
- [ ] Table shows: Name, DOB, Phone, Address
- [ ] Action buttons are visible (View, Edit, Delete)

### Search Functionality
- [ ] Search box is visible
- [ ] Typing filters results in real-time
- [ ] Search works for patient names
- [ ] Search works for phone numbers
- [ ] Clear search shows all patients again

### Create Patient
- [ ] "Add New Patient" button opens dialog
- [ ] All form fields are present:
  - [ ] Full Name
  - [ ] Date of Birth
  - [ ] Phone Number
  - [ ] Address
  - [ ] Job
  - [ ] Contact
  - [ ] Medical Notes
- [ ] Can fill in all fields
- [ ] Submit button works
- [ ] Success message appears
- [ ] New patient appears in list
- [ ] Dialog closes after creation

### Edit Patient
- [ ] Edit button (pencil icon) opens dialog
- [ ] Dialog shows current patient data
- [ ] Can modify all fields
- [ ] Update button works
- [ ] Success message appears
- [ ] Changes reflect in list
- [ ] Dialog closes after update

### Delete Patient
- [ ] Delete button (trash icon) shows confirmation
- [ ] Confirmation dialog has warning message
- [ ] Cancel button works (doesn't delete)
- [ ] Confirm button deletes patient
- [ ] Success message appears
- [ ] Patient removed from list

### Export to Excel
- [ ] Export button is visible
- [ ] Clicking export downloads file
- [ ] File name includes date
- [ ] Excel file opens correctly
- [ ] All patient data is present
- [ ] Arabic text displays correctly
- [ ] Columns are properly formatted

### Import from Excel
- [ ] Import button is visible
- [ ] Clicking opens file picker
- [ ] Can select Excel file
- [ ] Valid file imports successfully
- [ ] Success message shows count
- [ ] Imported patients appear in list
- [ ] Invalid file shows error message

## ✅ API Communication Testing

### Network Requests
Open browser DevTools (F12) → Network tab:
- [ ] All requests go to `localhost:8000`
- [ ] No requests to Supabase
- [ ] Authorization header present on all requests
- [ ] Requests return 200 status (success)
- [ ] Response format matches expected structure

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Validation errors show specific field errors
- [ ] 401 errors trigger auto-logout
- [ ] 404 errors show "not found" message
- [ ] 500 errors show "server error" message

### Loading States
- [ ] Loading spinner shows while fetching data
- [ ] Buttons show "loading..." text during operations
- [ ] Buttons are disabled during operations
- [ ] Loading states clear after completion

## ✅ Browser Console Testing

Open browser DevTools (F12) → Console tab:
- [ ] No Supabase errors
- [ ] No "undefined" errors
- [ ] No CORS errors
- [ ] No authentication errors
- [ ] API responses log correctly (if debugging enabled)

## ✅ LocalStorage Testing

Open browser DevTools (F12) → Application → Local Storage:
- [ ] `auth_token` exists after login
- [ ] `user` exists after login
- [ ] User data is valid JSON
- [ ] Token is removed after logout
- [ ] User data is removed after logout

## ✅ Performance Testing

- [ ] Page loads in < 2 seconds
- [ ] Search results appear instantly
- [ ] CRUD operations complete in < 1 second
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No excessive re-renders

## ✅ Mobile Responsiveness

Test on different screen sizes:
- [ ] Desktop (1920x1080) - works correctly
- [ ] Laptop (1366x768) - works correctly
- [ ] Tablet (768x1024) - works correctly
- [ ] Mobile (375x667) - works correctly

## ✅ Cross-Browser Testing

- [ ] Chrome - works correctly
- [ ] Firefox - works correctly
- [ ] Edge - works correctly
- [ ] Safari - works correctly (if available)

## 🐛 Bug Tracking

If you find any issues, document them here:

### Issue 1
- **Description**: 
- **Steps to Reproduce**: 
- **Expected Behavior**: 
- **Actual Behavior**: 
- **Error Message**: 
- **Screenshot**: 

### Issue 2
- **Description**: 
- **Steps to Reproduce**: 
- **Expected Behavior**: 
- **Actual Behavior**: 
- **Error Message**: 
- **Screenshot**: 

## 📊 Test Results Summary

### Overall Status
- Total Tests: 80+
- Passed: ___
- Failed: ___
- Skipped: ___

### Critical Issues
- [ ] None found
- [ ] Issues documented above

### Performance
- [ ] Acceptable
- [ ] Needs optimization

### User Experience
- [ ] Excellent
- [ ] Good
- [ ] Needs improvement

## ✅ Final Checklist

Before considering migration complete:
- [ ] All authentication tests pass
- [ ] All patients page tests pass
- [ ] No console errors
- [ ] No Supabase references in network tab
- [ ] Performance is acceptable
- [ ] Mobile responsive
- [ ] Cross-browser compatible

## 🎉 Sign-Off

**Tested By**: _______________
**Date**: _______________
**Status**: ⬜ Pass / ⬜ Fail
**Notes**: 

---

## 📝 Notes

- Test in a clean browser session (incognito/private mode)
- Clear localStorage before testing authentication
- Test with real data, not just test data
- Document any unexpected behavior
- Take screenshots of any errors

## 🆘 If Tests Fail

1. Check Laravel logs: `Backend/backend/storage/logs/laravel.log`
2. Check browser console for errors
3. Verify API is running: http://localhost:8000/api/v1
4. Check database has data: `php artisan tinker` → `\App\Models\Patient::count()`
5. Restart both servers
6. Clear browser cache and localStorage
7. Review `MIGRATION_STATUS.md` for known issues
