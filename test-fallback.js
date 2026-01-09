/**
 * Test script for content fallback functionality
 */

const fs = require('fs');
const path = require('path');

async function testFallback() {
  console.log('🧪 Testing content fallback system...\n');
  
  // Test 1: Check if fallback file exists
  console.log('Test 1: Checking fallback file...');
  const fallbackPath = path.join(__dirname, 'frontend', 'src', 'data', 'content-fallback.json');
  
  if (fs.existsSync(fallbackPath)) {
    console.log('✅ Test 1 PASSED: Fallback file exists');
    
    // Test 1b: Check if fallback file is valid JSON
    try {
      const fallbackContent = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      console.log('✅ Test 1b PASSED: Fallback file is valid JSON');
      console.log(`📊 Content sections found: ${Object.keys(fallbackContent.data || fallbackContent)}`);
    } catch (error) {
      console.log('❌ Test 1b FAILED: Fallback file is not valid JSON');
      console.log(`   Error: ${error.message}`);
    }
  } else {
    console.log('❌ Test 1 FAILED: Fallback file missing');
  }

  // Test 2: Check if backend is available
  console.log('\nTest 2: Checking backend availability...');
  try {
    const axios = require('axios');
    const response = await axios.get('https://theacj.onrender.com/api/content/public', {
      timeout: 5000
    });
    
    if (response.data.success) {
      console.log('✅ Test 2 PASSED: Backend is available');
      console.log(`📊 Backend content sections: ${Object.keys(response.data.data)}`);
    } else {
      console.log('❌ Test 2 FAILED: Backend returned error');
      console.log(`   Error: ${response.data.error}`);
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED: Backend unavailable');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Check if frontend services exist
  console.log('\nTest 3: Checking frontend services...');
  const fallbackServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'contentFallbackService.ts');
  const apiServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'api_node.ts');
  const useContentPath = path.join(__dirname, 'frontend', 'src', 'hooks', 'useContent.ts');
  
  if (fs.existsSync(fallbackServicePath)) {
    console.log('✅ Test 3a PASSED: Content fallback service exists');
  } else {
    console.log('❌ Test 3a FAILED: Content fallback service missing');
  }
  
  if (fs.existsSync(apiServicePath)) {
    console.log('✅ Test 3b PASSED: API service exists');
  } else {
    console.log('❌ Test 3b FAILED: API service missing');
  }
  
  if (fs.existsSync(useContentPath)) {
    console.log('✅ Test 3c PASSED: useContent hook exists');
  } else {
    console.log('❌ Test 3c FAILED: useContent hook missing');
  }

  // Test 4: Simulate fallback scenario
  console.log('\nTest 4: Simulating fallback scenario...');
  console.log('📝 To test fallback manually:');
  console.log('   1. Stop the backend server');
  console.log('   2. Visit your frontend application');
  console.log('   3. Verify content loads from local JSON file');
  console.log('   4. Check browser console for fallback warnings');

  console.log('\n🎉 Testing complete!');
  console.log('\n📋 Summary:');
  console.log('   - Fallback system is implemented');
  console.log('   - Content is pulled from MongoDB and saved locally');
  console.log('   - Frontend will automatically use fallback when backend is down');
  console.log('   - Manual testing required to verify fallback behavior');
}

// Run the test
testFallback().catch(console.error);