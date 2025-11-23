# Backend Update: Multiple Hero Slides Support

## Changes Made

I've successfully updated your backend to support multiple hero slides as an array, matching your frontend Hero component structure.

### 1. Backend Model Updated (`ContentSection.js`)
**Before:**
```javascript
hero: {
  title: String,
  subtitle: String,
  description: String,
  image: String,
  ctaText: String,
  ctaLink: String,
  socialLinks: [...]
}
```

**After:**
```javascript
hero: {
  slides: [{
    title: String,
    subtitle: String,
    description: String,
    bgImage: String,
    buttonText: String,
    buttonIcon: String,
    buttonLink: String
  }],
  socialLinks: [...]
}
```

### 2. Content Controller Updated (`contentController.js`)
- Updated `DEFAULT_CONTENT.hero` to use slides array structure
- Added all 4 slides from your frontend with correct image paths and button links
- Maintained backward compatibility with existing API endpoints

### 3. Frontend TypeScript Updated (`api_node.ts`)
- Added `HeroSlide` interface for individual slide structure
- Updated `HeroSection` to use slides array
- Maintained TypeScript compatibility

### 4. Frontend Hook Updated (`useContent.tsx`)
- Updated `DEFAULT_CONTENT.hero` to use slides array
- Changed from single hero object to slides array structure
- All slide data now matches your Hero component

### 5. MongoDB Data Structure Updated
Created new JSON file: `mongodb_import/contentsections_updated.json`

## Import Instructions

### Step 1: Clear Existing Hero Data
```javascript
// Connect to MongoDB and clear existing hero data
db.contentsections.deleteOne({ sectionType: "hero" });
```

### Step 2: Import New Hero Structure
```bash
# Import the updated content sections with hero slides
mongoimport --db your-database-name \
           --collection contentsections \
           --file mongodb_import/contentsections_updated.json \
           --jsonArray
```

### Step 3: Verify Data Import
```javascript
// Check that hero now has slides array
db.contentsections.findOne({ sectionType: "hero" }).hero.slides.length
// Should return: 4

// Verify all sections imported
db.contentsections.countDocuments()
// Should return: 5
```

## Data Structure Changes

### Hero Section Now Contains:
```json
{
  "sectionType": "hero",
  "hero": {
    "slides": [
      {
        "title": "Hi!",
        "subtitle": "The ACJ", 
        "description": "With us Tech Emancipation is achievable",
        "bgImage": "/assets/img/theacj.jpg",
        "buttonText": "View CV",
        "buttonIcon": "icon-download",
        "buttonLink": "/assets/JoshuaAgbai.pdf"
      },
      {
        "title": "I am a",
        "subtitle": "Data Analyst",
        "description": "Where there is Data, The ACJ will make sense of it", 
        "bgImage": "/assets/img/data_analytics.jpg",
        "buttonText": "View Portfolio",
        "buttonIcon": "icon-briefcase",
        "buttonLink": "#work"
      }
      // ... 2 more slides
    ],
    "socialLinks": [
      { "platform": "GitHub", "url": "https://github.com/TheACJ", "icon": "fab fa-github" },
      { "platform": "LinkedIn", "url": "https://linkedin.com/in/joshuaagbai", "icon": "fab fa-linkedin" },
      { "platform": "Twitter", "url": "https://twitter.com/realACJoshua", "icon": "fab fa-twitter" }
    ]
  }
}
```

## What This Enables

✅ **Frontend Compatibility**: Your Hero component now receives slides array from backend  
✅ **Admin Management**: You can manage individual slides through admin interface  
✅ **Dynamic Updates**: Slide content can be updated without code changes  
✅ **Full Array Support**: All 4 slides with proper image paths and button actions  

## Testing After Import

1. **Start Backend**: `cd nodejs-backend && npm start`
2. **Test API**: `curl http://localhost:5000/api/content/public`
3. **Verify Hero**: Response should include 4 slides in hero.slides array
4. **Test Frontend**: Visit your React app - hero section should show rotating slides

## Files Modified

1. ✅ `nodejs-backend/models/ContentSection.js` - Updated schema
2. ✅ `nodejs-backend/controllers/contentController.js` - Updated default content
3. ✅ `frontend/src/services/api_node.ts` - Updated TypeScript interfaces
4. ✅ `frontend/src/hooks/useContent.tsx` - Updated default content
5. ✅ `mongodb_import/contentsections_updated.json` - New MongoDB import file

The backend now fully supports your multiple hero slides structure as implemented in your frontend!