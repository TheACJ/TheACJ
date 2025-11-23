#!/usr/bin/env node

/**
 * Test script to verify content API is working
 * Run this to check if your backend is serving content from MongoDB
 */

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

async function testContentAPI() {
  console.log('🔍 Testing Content API...\n');
  console.log(`API Base URL: ${API_BASE}\n`);

  try {
    // Test public content endpoint
    console.log('📡 Testing GET /content/public');
    const response = await axios.get(`${API_BASE}/content/public`, {
      timeout: 10000
    });

    console.log('✅ API Response received!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Success:', response.data.success);
    
    if (response.data.success && response.data.data) {
      const content = response.data.data;
      
      console.log('\n🎯 Content Sections Found:');
      console.log('- Hero slides:', content.hero?.slides?.length || 0);
      console.log('- About section:', content.about?.title ? '✅' : '❌');
      console.log('- Services:', content.services?.length || 0);
      console.log('- Skills:', content.skills?.length || 0);
      console.log('- Counter items:', content.counter?.length || 0);
      
      // Show sample data
      if (content.hero?.slides?.length > 0) {
        console.log('\n🎭 Hero Slide Sample:');
        console.log('  Title:', content.hero.slides[0].title);
        console.log('  Subtitle:', content.hero.slides[0].subtitle);
      }
      
      if (content.skills?.length > 0) {
        console.log('\n🛠️  Skills Sample (first 5):');
        content.skills.slice(0, 5).forEach(skill => {
          console.log(`  - ${skill.name}: ${skill.level}%`);
        });
        console.log(`  ... and ${content.skills.length - 5} more skills`);
      }
      
      console.log('\n✅ SUCCESS: Your API is serving content from MongoDB!');
      
    } else {
      console.log('\n❌ ERROR: API response missing data');
      console.log('Response:', response.data);
    }

  } catch (error) {
    console.log('\n❌ ERROR: API call failed');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Issue: Cannot connect to backend server');
      console.log('   Make sure your Node.js backend is running on port 5000');
    } else if (error.response) {
      console.log('💡 Issue: API returned error');
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    } else if (error.request) {
      console.log('💡 Issue: No response from server');
      console.log('   Check if backend is running and accessible');
    } else {
      console.log('💡 Issue:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Start backend: cd nodejs-backend && npm start');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify content sections exist in MongoDB');
    console.log('4. Import content using: mongodb_import/complete_content_sections.json');
  }
}

// Run the test
testContentAPI();