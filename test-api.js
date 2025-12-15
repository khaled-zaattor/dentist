#!/usr/bin/env node

/**
 * Comprehensive API Test Script
 * Tests all Laravel backend endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';
let authToken = null;
let testResults = { passed: 0, failed: 0, total: 0 };

// Test data storage
let createdPatientId = null;
let createdDoctorId = null;
let createdAppointmentId = null;
let createdTreatmentId = null;
let createdWaitingListId = null;

function log(message, type = 'info') {
  const colors = { success: '\x1b[32m', error: '\x1b[31m', info: '\x1b[36m', reset: '\x1b[0m' };
  const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  console.log(`${colors[type]}${prefix} ${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`${testName} - ${details}`, 'error');
  }
}

function logSection(title) {
  console.log(`\n\x1b[1m\x1b[34m=== ${title} ===\x1b[0m`);
}

async function makeRequest(method, endpoint, data = null, expectError = false) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    };

    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    if (data) config.data = data;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (expectError) return { success: false, error: error.response?.data, status: error.response?.status };
    return { success: false, error: error.response?.data || error.message, status: error.response?.status };
  }
}

async function testAuthentication() {
  logSection('Authentication Tests');

  const loginResult = await makeRequest('POST', '/login', {
    email: 'admin@dental.com',
    password: 'password'
  });

  if (loginResult.success && loginResult.data.success) {
    authToken = loginResult.data.data.token;
    logTest('Login with valid credentials', true);
  } else {
    logTest('Login with valid credentials', false, loginResult.error?.message || 'No token received');
    return false;
  }

  const invalidLoginResult = await makeRequest('POST', '/login', {
    email: 'invalid@email.com',
    password: 'wrongpassword'
  }, true);
  logTest('Login with invalid credentials (should fail)', !invalidLoginResult.success);

  const registerResult = await makeRequest('POST', '/register', {
    email: `test${Date.now()}@dental.com`,
    password: 'password123',
    password_confirmation: 'password123',
    full_name: 'Test User'
  });
  logTest('Register new user', registerResult.success && registerResult.data.success);

  return true;
}

async function testPatients() {
  logSection('Patients Tests');

  const createResult = await makeRequest('POST', '/patients', {
    full_name: 'Test Patient',
    phone_number: '+1234567890',
    date_of_birth: '1990-01-01',
    address: '123 Test Street',
    job: 'Engineer',
    medical_notes: 'No allergies'
  });

  if (createResult.success && createResult.data.success) {
    createdPatientId = createResult.data.data.id;
    logTest('Create patient', true);
  } else {
    logTest('Create patient', false, createResult.error?.message);
  }

  const getAllResult = await makeRequest('GET', '/patients');
  logTest('Get all patients', getAllResult.success && getAllResult.data.success);

  if (createdPatientId) {
    const getByIdResult = await makeRequest('GET', `/patients/${createdPatientId}`);
    logTest('Get patient by ID', getByIdResult.success && getByIdResult.data.success);

    const updateResult = await makeRequest('PUT', `/patients/${createdPatientId}`, {
      full_name: 'Updated Test Patient',
      phone_number: '+1234567890',
      date_of_birth: '1990-01-01',
      address: '456 Updated Street'
    });
    logTest('Update patient', updateResult.success && updateResult.data.success);
  }

  const searchResult = await makeRequest('GET', '/patients?search=Test');
  logTest('Search patients', searchResult.success && searchResult.data.success);
}

async function testDoctors() {
  logSection('Doctors Tests');

  const createResult = await makeRequest('POST', '/doctors', {
    full_name: 'Dr. Test Doctor',
    email: `testdoctor${Date.now()}@dental.com`,
    phone_number: '+1987654321',
    specialty: 'General Dentistry'
  });

  if (createResult.success && createResult.data.success) {
    createdDoctorId = createResult.data.data.id;
    logTest('Create doctor', true);
  } else {
    logTest('Create doctor', false, createResult.error?.message);
  }

  const getAllResult = await makeRequest('GET', '/doctors');
  logTest('Get all doctors', getAllResult.success && getAllResult.data.success);

  if (createdDoctorId) {
    const getByIdResult = await makeRequest('GET', `/doctors/${createdDoctorId}`);
    logTest('Get doctor by ID', getByIdResult.success && getByIdResult.data.success);

    const updateResult = await makeRequest('PUT', `/doctors/${createdDoctorId}`, {
      full_name: 'Dr. Updated Test Doctor',
      email: `testdoctor${Date.now()}@dental.com`,
      phone_number: '+1987654321',
      specialty: 'Orthodontics'
    });
    logTest('Update doctor', updateResult.success && updateResult.data.success);
  }
}

async function testAppointments() {
  logSection('Appointments Tests');

  if (!createdPatientId || !createdDoctorId) {
    logTest('Create appointment', false, 'Missing patient or doctor ID');
    return;
  }

  const createResult = await makeRequest('POST', '/appointments', {
    patient_id: createdPatientId,
    doctor_id: createdDoctorId,
    scheduled_at: '2025-12-01 10:00:00',
    notes: 'Test appointment'
  });

  if (createResult.success && createResult.data.success) {
    createdAppointmentId = createResult.data.data.id;
    logTest('Create appointment', true);
  } else {
    logTest('Create appointment', false, createResult.error?.message);
  }

  const getAllResult = await makeRequest('GET', '/appointments');
  logTest('Get all appointments', getAllResult.success && getAllResult.data.success);

  if (createdAppointmentId) {
    const getByIdResult = await makeRequest('GET', `/appointments/${createdAppointmentId}`);
    logTest('Get appointment by ID', getByIdResult.success && getByIdResult.data.success);

    const updateResult = await makeRequest('PUT', `/appointments/${createdAppointmentId}`, {
      patient_id: createdPatientId,
      doctor_id: createdDoctorId,
      scheduled_at: '2025-12-01 11:00:00',
      status: 'Scheduled',
      notes: 'Updated test appointment'
    });
    logTest('Update appointment', updateResult.success && updateResult.data.success);
  }

  const filterResult = await makeRequest('GET', `/appointments?doctor_id=${createdDoctorId}`);
  logTest('Filter appointments by doctor', filterResult.success && filterResult.data.success);
}

async function testTreatments() {
  logSection('Treatments Tests');

  const createResult = await makeRequest('POST', '/treatments', {
    name: 'Test Treatment',
    description: 'This is a test treatment'
  });

  if (createResult.success && createResult.data.success) {
    createdTreatmentId = createResult.data.data.id;
    logTest('Create treatment', true);
  } else {
    logTest('Create treatment', false, createResult.error?.message);
  }

  const getAllResult = await makeRequest('GET', '/treatments');
  logTest('Get all treatments', getAllResult.success && getAllResult.data.success);

  if (createdTreatmentId) {
    const getByIdResult = await makeRequest('GET', `/treatments/${createdTreatmentId}`);
    logTest('Get treatment by ID', getByIdResult.success && getByIdResult.data.success);

    const updateResult = await makeRequest('PUT', `/treatments/${createdTreatmentId}`, {
      name: 'Updated Test Treatment',
      description: 'This is an updated test treatment'
    });
    logTest('Update treatment', updateResult.success && updateResult.data.success);
  }
}

async function testWaitingList() {
  logSection('Waiting List Tests');

  if (!createdPatientId) {
    logTest('Add to waiting list', false, 'Missing patient ID');
    return;
  }

  const createResult = await makeRequest('POST', '/waiting-list', {
    patient_id: createdPatientId,
    appointment_id: createdAppointmentId
  });

  if (createResult.success && createResult.data.success) {
    createdWaitingListId = createResult.data.data.id;
    logTest('Add to waiting list', true);
  } else {
    logTest('Add to waiting list', false, createResult.error?.message);
  }

  const getAllResult = await makeRequest('GET', '/waiting-list');
  logTest('Get waiting list', getAllResult.success && getAllResult.data.success);

  const tempToken = authToken;
  authToken = null;
  const publicResult = await makeRequest('GET', '/waiting-list/display');
  authToken = tempToken;
  logTest('Get public waiting list display', publicResult.success && publicResult.data.success);

  if (createdWaitingListId) {
    const updateResult = await makeRequest('PUT', `/waiting-list/${createdWaitingListId}`, {
      status: 'in_examination'
    });
    logTest('Update waiting list status', updateResult.success && updateResult.data.success);
  }
}

async function testActivityLogs() {
  logSection('Activity Logs Tests');
  const getAllResult = await makeRequest('GET', '/activity-logs');
  logTest('Get activity logs', getAllResult.success && getAllResult.data.success);
}

async function testStatistics() {
  logSection('Statistics Tests');

  const overviewResult = await makeRequest('GET', '/statistics/overview');
  logTest('Get overview statistics', overviewResult.success && overviewResult.data.success);

  const statusResult = await makeRequest('GET', '/statistics/appointments-by-status');
  logTest('Get appointments by status', statusResult.success && statusResult.data.success);

  const monthResult = await makeRequest('GET', '/statistics/patients-by-month');
  logTest('Get patients by month', monthResult.success && monthResult.data.success);
}

async function testSecurity() {
  logSection('Security Tests');
  const tempToken = authToken;
  authToken = null;

  const unauthorizedResult = await makeRequest('GET', '/patients', null, true);
  logTest('Unauthorized access (should fail)', !unauthorizedResult.success && unauthorizedResult.status === 401);

  authToken = tempToken;
}

async function cleanup() {
  logSection('Cleanup');

  if (createdWaitingListId) {
    const result = await makeRequest('DELETE', `/waiting-list/${createdWaitingListId}`);
    logTest('Delete waiting list entry', result.success);
  }

  if (createdAppointmentId) {
    const result = await makeRequest('DELETE', `/appointments/${createdAppointmentId}`);
    logTest('Delete appointment', result.success);
  }

  if (createdTreatmentId) {
    const result = await makeRequest('DELETE', `/treatments/${createdTreatmentId}`);
    logTest('Delete treatment', result.success);
  }

  if (createdDoctorId) {
    const result = await makeRequest('DELETE', `/doctors/${createdDoctorId}`);
    logTest('Delete doctor', result.success);
  }

  if (createdPatientId) {
    const result = await makeRequest('DELETE', `/patients/${createdPatientId}`);
    logTest('Delete patient', result.success);
  }
}

async function runAllTests() {
  console.log('\x1b[1m\x1b[35m🚀 Starting API Tests...\x1b[0m\n');
  console.log(`Testing API at: ${API_BASE_URL}\n`);

  try {
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      log('Authentication failed. Cannot continue tests.', 'error');
      return;
    }

    await testPatients();
    await testDoctors();
    await testAppointments();
    await testTreatments();
    await testWaitingList();
    await testActivityLogs();
    await testStatistics();
    await testSecurity();
    await cleanup();

    console.log('\n\x1b[1m\x1b[35m📊 Test Results:\x1b[0m');
    console.log(`\x1b[32m✅ Passed: ${testResults.passed}\x1b[0m`);
    console.log(`\x1b[31m❌ Failed: ${testResults.failed}\x1b[0m`);
    console.log(`\x1b[36mℹ️  Total: ${testResults.total}\x1b[0m`);
    console.log(`\x1b[33m📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%\x1b[0m\n`);

    if (testResults.failed === 0) {
      log('All tests passed! 🎉', 'success');
    } else {
      log(`${testResults.failed} test(s) failed. Please check the logs above.`, 'error');
    }
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
  }
}

runAllTests();
