# MongoDB Import Guide

## Collection Structure Decision

Based on your backend models and frontend interaction patterns, you should use **ONE collection** called `contentsections`. Here's why:

### Backend Model Analysis
- **Single Model**: Your `ContentSection.js` model stores all content sections in one collection
- **Section Type Filter**: Backend queries use `sectionType` field to differentiate sections (hero, about, services, skills, counter)
- **API Response**: Frontend API client expects all sections returned together via `/content/public`

### Alternative Approaches (Not Recommended)
- **Multiple Collections**: Would require significant backend code changes
- **Separate JSON Files**: Unnecessary complexity for content management

## MongoDB Import Commands

### Step 1: Import Content Sections
```bash
# Connect to your MongoDB database
mongo "mongodb+srv://your-cluster.mongodb.net/your-database" --username your-username

# Or if using local MongoDB
mongo

# Import content sections
mongoimport --uri="mongodb+srv://your-cluster.mongodb.net/your-database" \
           --username your-username \
           --collection contentsections \
           --file mongodb_import/contentsections.json \
           --jsonArray

# For local MongoDB
mongoimport --db your-database-name \
           --collection contentsections \
           --file mongodb_import/contentsections.json \
           --jsonArray
```

### Step 2: Verify Import
```javascript
// In MongoDB shell
use your-database-name

// Check if data was imported
db.contentsections.find().pretty()

// Should show 5 documents with sectionTypes: hero, about, services, skills, counter
db.contentsections.countDocuments()
// Should return: 5
```

### Step 3: Test Backend Connection
```bash
# Start your Node.js backend
cd nodejs-backend
npm start

# Test the API endpoint
curl http://localhost:5000/api/content/public
```

## Collection Details

### contentsections Collection
- **Purpose**: Stores all homepage content sections
- **Documents**: 5 total (one for each section type)
- **Fields**: sectionType, content data, isActive, updatedAt
- **Frontend Access**: Via `contentService.getPublicContent()`

### Existing Collections (Need Updates)
Your MongoDB already has these collections that need structure updates:

1. **blogposts** - Fix field mismatches
2. **workitems** - Update field names and status values  
3. **categories** - Convert to proper ObjectId references
4. **contacts** - Already exists but may need field updates

## What This Solves

After importing the content sections:

✅ **Frontend will load dynamic content** instead of hardcoded fallbacks  
✅ **Hero, About, Services, Skills, Counter** sections will display MongoDB data  
✅ **Admin interface** can manage content through existing endpoints  
✅ **API responses** will include real content instead of defaults  

## Next Steps After Import

1. **Test Frontend**: Visit your React app - content should load from MongoDB
2. **Verify API**: Check browser network tab - requests to `/api/content/public` should return data
3. **Test Admin**: Login to admin interface and verify content sections are editable
4. **Fix Existing Data**: Update blogposts, workitems, categories collections to match backend schemas

The import will immediately resolve the "missing content sections" issue identified in the comparison document.