# Content Fetch Guide: Ensuring MongoDB Data is Used

## Overview
This guide helps you verify that your React frontend is fetching content from MongoDB instead of falling back to hardcoded defaults.

## Step 1: Verify Backend API is Working

### Run the Test Script
```bash
# Install axios if not already installed
npm install axios

# Run the API test
node test_content_api.js
```

### Expected Output (Success)
```
🔍 Testing Content API...

API Base URL: http://localhost:5000/api

📡 Testing GET /content/public
✅ API Response received!
📊 Response Status: 200
📋 Success: true

🎯 Content Sections Found:
- Hero slides: 4
- About section: ✅
- Services: 4
- Skills: 39
- Counter items: 4

🎭 Hero Slide Sample:
  Title: Hi!
  Subtitle: The ACJ

🛠️  Skills Sample (first 5):
  - Python: 95%
  - JavaScript: 90%
  - React: 88%
  - TypeScript: 88%
  - HTML5: 92%
  ... and 34 more skills

✅ SUCCESS: Your API is serving content from MongoDB!
```

### If Test Fails
1. **Backend not running**: `cd nodejs-backend && npm start`
2. **MongoDB connection**: Check connection in `nodejs-backend/.env`
3. **Content not imported**: Import using MongoDB commands (see Step 2)

## Step 2: Import Content into MongoDB

### Clear Existing Content
```javascript
// Connect to MongoDB
mongosh your-database-name

// Clear existing content sections
db.contentsections.deleteMany({});

// Verify cleared
db.contentsections.countDocuments();
// Should return: 0
```

### Import New Content
```bash
# Import all content sections
mongoimport --db your-database-name \
           --collection contentsections \
           --file mongodb_import/complete_content_sections.json \
           --jsonArray
```

### Verify Import
```javascript
// Check imported content
db.contentsections.find().pretty();

// Should show 5 documents: hero, about, services, skills, counter

// Count by section type
db.contentsections.aggregate([
  { $group: { _id: "$sectionType", count: { $sum: 1 } } }
]);

// Expected result:
// { "_id": "hero", "count": 1 }
// { "_id": "about", "count": 1 }
// { "_id": "services", "count": 1 }
// { "_id": "skills", "count": 1 }
// { "_id": "counter", "count": 1 }
```

## Step 3: Verify Frontend Configuration

### Check Environment Variables
Ensure your frontend `.env` file has the correct API URL:
```bash
# frontend/.env.development
VITE_API_URL=http://localhost:5000/api

# frontend/.env.production
VITE_API_URL=https://your-production-url.com/api
```

### Verify API Client
The frontend uses `contentService.getPublicContent()` which calls:
- **Endpoint**: `GET /api/content/public`
- **Authentication**: None required (public endpoint)
- **Response**: `{ success: true, data: ContentSections }`

## Step 4: Check Frontend Loading

### Browser Developer Tools
1. **Open React app** in browser
2. **Open Developer Tools** (F12)
3. **Go to Network tab**
4. **Refresh page**
5. **Look for API call** to `content/public`
6. **Check response** - should show your MongoDB data

### Console Debugging
Add this to your frontend to see API calls:
```javascript
// In useContent.tsx, add logging
const loadContent = async () => {
  try {
    console.log('🔍 Loading content from API...');
    const response = await contentService.getPublicContent();
    console.log('📡 API Response:', response);
    
    if (response.success && response.data) {
      console.log('✅ Content loaded from MongoDB');
      console.log('Hero slides:', response.data.hero?.slides?.length);
      console.log('Skills count:', response.data.skills?.length);
    }
  } catch (err) {
    console.error('❌ Failed to load from API:', err);
  }
};
```

## Step 5: Verify Content Components

### Check Hero Component
- **Expected**: 4 rotating slides from MongoDB
- **Fallback**: Static slide if API fails

### Check Skills Component
- **Expected**: 39 skills with proper levels
- **Expected**: Skills categorized automatically
- **Fallback**: 8 hardcoded skills if API fails

### Check Other Components
- **Services**: Should show 4 services from MongoDB
- **About**: Should show MongoDB description
- **Counter**: Should show MongoDB statistics

## Step 6: Troubleshooting

### Common Issues

#### 1. API Call Not Happening
- Check if ContentProvider wraps your app
- Verify `useContent()` hook is being used
- Check browser Network tab for API calls

#### 2. API Returns 404
- Backend not running
- Route not properly mounted in server.js
- Wrong API URL in frontend .env

#### 3. API Returns 500 Error
- MongoDB connection issue
- Content sections not in database
- Schema mismatch

#### 4. Frontend Falls Back to Defaults
- API call succeeds but returns wrong format
- Missing sections in MongoDB
- API response structure doesn't match frontend expectations

### Debugging Commands

#### Check Backend Logs
```bash
cd nodejs-backend
npm start
# Watch for errors in console
```

#### Test MongoDB Directly
```javascript
// Connect to MongoDB
mongosh your-database-name

// Check if content exists
db.contentsections.findOne({ sectionType: "skills" });

// Should return skills document with 39 skills
```

#### Test API Manually
```bash
# Using curl
curl -X GET http://localhost:5000/api/content/public

# Should return JSON with success: true and data object
```

## Success Indicators

### ✅ You're Successfully Using MongoDB When:
1. **API Test Passes**: `test_content_api.js` shows "SUCCESS"
2. **Network Tab Shows Call**: Browser shows API call to `content/public`
3. **Dynamic Content**: Hero shows rotating slides from MongoDB
4. **Full Skill Set**: Skills component shows 39 skills with categories
5. **Responsive Updates**: Changes in MongoDB reflect on frontend after refresh

### ❌ You're Using Fallback Defaults When:
1. **API Test Fails**: Cannot connect to backend
2. **No Network Call**: No API call visible in Network tab
3. **Static Content**: Hero shows only one slide
4. **Limited Skills**: Skills component shows 8 skills
5. **Hardcoded Values**: Content doesn't change when MongoDB is updated

## Next Steps

Once you confirm MongoDB content is being fetched:

1. **Test Admin Interface**: Login and update content via admin
2. **Verify Real-time Updates**: Changes reflect on frontend
3. **Monitor Performance**: API response times
4. **Handle Edge Cases**: What happens if API is down

---

**Quick Test Command:**
```bash
# One-liner to test everything
node test_content_api.js && echo "API test complete! Check results above."