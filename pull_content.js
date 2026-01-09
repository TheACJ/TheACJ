/**
 * Script to pull current content sections from MongoDB via Node.js backend
 * and save them as a JSON fallback file in the frontend directory
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://theacj.onrender.com/api';

async function pullContent() {
  console.log('🔄 Pulling content from MongoDB via backend...');
  
  try {
    // Fetch content from the backend API
    const response = await axios.get(`${API_URL}/content/public`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    
    if (response.data.success) {
      const content = response.data.data;
      
      // Create frontend data directory if it doesn't exist
      const frontendDataPath = path.join(__dirname, 'frontend', 'src', 'data');
      if (!fs.existsSync(frontendDataPath)) {
        fs.mkdirSync(frontendDataPath, { recursive: true });
        console.log('📁 Created frontend data directory');
      }
      
      // Save content to frontend directory
      const fallbackPath = path.join(frontendDataPath, 'content-fallback.json');
      fs.writeFileSync(fallbackPath, JSON.stringify(content, null, 2));
      
      console.log('✅ Content successfully pulled and saved to frontend/src/data/content-fallback.json');
      console.log('📊 Content sections found:', Object.keys(content));
      
      return content;
    } else {
      console.error('❌ Failed to fetch content:', response.data.error);
      throw new Error(response.data.error || 'Failed to fetch content');
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error('❌ Cannot connect to backend - server may be down');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - backend server may not be running');
    } else if (error.message.includes('timeout')) {
      console.error('❌ Request timeout - backend may be slow or unresponsive');
    } else {
      console.error('❌ Error pulling content:', error.message);
    }
    throw error;
  }
}

// Run the script
if (require.main === module) {
  pullContent()
    .then(content => {
      console.log('🎉 Content pull completed successfully!');
      console.log('📋 Summary:');
      console.log(`   - Hero slides: ${content.hero?.slides?.length || 0}`);
      console.log(`   - Services: ${content.services?.length || 0}`);
      console.log(`   - Skills: ${content.skills?.length || 0}`);
      console.log(`   - Counter items: ${content.counter?.length || 0}`);
    })
    .catch(error => {
      console.log('💥 Content pull failed. You may need to:');
      console.log('   1. Ensure the backend server is running');
      console.log('   2. Check the API URL is correct');
      console.log('   3. Verify network connectivity');
      console.log('   4. Use the existing complete_content_sections.json as fallback');
      process.exit(1);
    });
}

module.exports = { pullContent };