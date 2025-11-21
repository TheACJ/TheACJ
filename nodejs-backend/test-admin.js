#!/usr/bin/env node

/**
 * Admin Authentication Test Script
 * This script tests the admin authentication system
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const config = {
  host: 'localhost',
  port: process.env.PORT || 5000,
  protocol: 'http'
};

// Test data
const testAdmin = {
  username: 'admin',
  password: 'admin123'
};

let authToken = null;

// Utility function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: config.host,
      port: config.port,
      ...options
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing Health Check...');
  
  try {
    const response = await makeRequest({
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log('❌ Health check failed:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login...');
  
  try {
    const response = await makeRequest({
      path: '/api/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testAdmin);

    if (response.statusCode === 200 && response.body.success) {
      authToken = response.body.data.token;
      console.log('✅ Admin login successful');
      console.log(`   Username: ${testAdmin.username}`);
      console.log(`   Role: ${response.body.data.admin.role}`);
      console.log(`   Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Admin login failed:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
    return false;
  }
}

async function testGetProfile() {
  console.log('👤 Testing Get Profile...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  try {
    const response = await makeRequest({
      path: '/api/admin/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Get profile successful');
      console.log(`   User: ${response.body.data.admin.fullName}`);
      console.log(`   Email: ${response.body.data.admin.email}`);
      return true;
    } else {
      console.log('❌ Get profile failed:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Get profile error:', error.message);
    return false;
  }
}

async function testDashboardStats() {
  console.log('📊 Testing Dashboard Stats...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  try {
    const response = await makeRequest({
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Dashboard stats successful');
      console.log(`   Total Users: ${response.body.data.total.users}`);
      console.log(`   Blog Posts: ${response.body.data.total.blogPosts}`);
      console.log(`   Work Items: ${response.body.data.total.workItems}`);
      console.log(`   Contacts: ${response.body.data.total.contacts}`);
      return true;
    } else {
      console.log('❌ Dashboard stats failed:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard stats error:', error.message);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('🚫 Testing Invalid Login...');
  
  try {
    const response = await makeRequest({
      path: '/api/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'admin',
      password: 'wrongpassword'
    });

    if (response.statusCode === 401) {
      console.log('✅ Invalid login properly rejected');
      return true;
    } else {
      console.log('❌ Invalid login was not rejected:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid login test error:', error.message);
    return false;
  }
}

async function testTokenVerification() {
  console.log('🎫 Testing Token Verification...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  try {
    const response = await makeRequest({
      path: '/api/admin/auth/verify',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Token verification successful');
      return true;
    } else {
      console.log('❌ Token verification failed:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Token verification error:', error.message);
    return false;
  }
}

async function testAdminLogout() {
  console.log('🚪 Testing Admin Logout...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  try {
    const response = await makeRequest({
      path: '/api/admin/auth/logout',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Admin logout successful');
      authToken = null; // Clear token
      return true;
    } else {
      console.log('❌ Admin logout failed:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin logout error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Admin Authentication Tests');
  console.log(`📡 Testing against ${config.protocol}://${config.host}:${config.port}`);
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Health Check', func: testHealthCheck },
    { name: 'Admin Login', func: testAdminLogin },
    { name: 'Get Profile', func: testGetProfile },
    { name: 'Dashboard Stats', func: testDashboardStats },
    { name: 'Invalid Login', func: testInvalidLogin },
    { name: 'Token Verification', func: testTokenVerification },
    { name: 'Admin Logout', func: testAdminLogout }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.func();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw error:`, error.message);
      failed++;
    }
    console.log(); // Empty line for readability
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('📋 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Admin authentication is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Please check the server and configuration.');
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  console.log('🔍 Checking if server is running...');
  
  try {
    await makeRequest({
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Make sure to start the server first: npm start');
    return false;
  }
}

// Run the tests
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Start the tests
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHealthCheck,
  testAdminLogin,
  testGetProfile,
  testDashboardStats,
  testInvalidLogin,
  testTokenVerification,
  testAdminLogout
};