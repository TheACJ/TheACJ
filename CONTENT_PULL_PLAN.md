# Content Pull Plan

## Overview
Create a plan to pull current content sections from MongoDB via the running Node.js backend and create a JSON fallback file in the frontend directory.

## Current State Analysis

### Backend Infrastructure
- **Node.js Backend**: Located at `nodejs-backend/`
- **MongoDB Database**: Connected via `mongodb+srv://theacj:0953Amanda@theacj.lejvcy0.mongodb.net/portfolio`
- **Content API**: Available at `/content/public` endpoint
- **Content Model**: `ContentSection` with sections: hero, about, services, counter, skills

### Frontend Infrastructure
- **Frontend Directory**: `frontend/`
- **API Client**: `frontend/src/services/api_node.ts` with comprehensive API methods
- **Content Service**: Already has `getPublicContent()` method with timeout and caching

### Existing Content
- **Default Content**: Available in `nodejs-backend/controllers/contentController.js`
- **Sample Data**: Available in `mongodb_import/complete_content_sections.json`

## Implementation Plan

### Step 1: Pull Current Content from MongoDB

Create a script to fetch current content from the running backend:

```javascript
// pull_content.js
const axios = require('axios');

async function pullContent() {
  try {
    const response = await axios.get('https://theacj.onrender.com/api/content/public', {
      timeout: 10000
    });
    
    if (response.data.success) {
      const content = response.data.data;
      
      // Save to frontend directory
      const fs = require('fs');
      const path = require('path');
      
      const frontendPath = path.join(__dirname, 'frontend', 'src', 'data', 'content-fallback.json');
      fs.writeFileSync(frontendPath, JSON.stringify(content, null, 2));
      
      console.log('✅ Content successfully pulled and saved to frontend/src/data/content-fallback.json');
    } else {
      console.error('❌ Failed to fetch content:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Error pulling content:', error.message);
  }
}

pullContent();
```

### Step 2: Create Frontend Fallback System

#### 2.1 Create Content Fallback Service

Create `frontend/src/services/contentFallbackService.ts`:

```typescript
import contentFallback from '../data/content-fallback.json';

export interface ContentSections {
  hero: any;
  about: any;
  services: any[];
  counter: any[];
  skills: any[];
}

export class ContentFallbackService {
  private static instance: ContentFallbackService;
  private content: ContentSections | null = null;

  static getInstance(): ContentFallbackService {
    if (!ContentFallbackService.instance) {
      ContentFallbackService.instance = new ContentFallbackService();
    }
    return ContentFallbackService.instance;
  }

  async getContent(): Promise<ContentSections> {
    if (this.content) {
      return this.content;
    }

    try {
      // Try to load from JSON file
      this.content = contentFallback as ContentSections;
      return this.content;
    } catch (error) {
      console.warn('Failed to load fallback content:', error);
      return this.getDefaultContent();
    }
  }

  private getDefaultContent(): ContentSections {
    return {
      hero: {
        slides: [
          {
            title: "Hi!",
            subtitle: "The ACJ",
            description: "With us Tech Emancipation is achievable",
            bgImage: "/assets/img/theacj.jpg",
            buttonText: "View CV",
            buttonIcon: "icon-download",
            buttonLink: "/assets/JoshuaAgbai.pdf"
          }
        ],
        socialLinks: [
          { platform: "GitHub", url: "https://github.com/TheACJ", icon: "fab fa-github" }
        ]
      },
      about: {
        title: "About Me",
        description: "I'm a passionate Data Analyst and Web Developer...",
        image: "/assets/img/about.jpg",
        achievements: ["3+ Years of Data Analysis Experience"]
      },
      services: [],
      counter: [],
      skills: []
    };
  }
}
```

#### 2.2 Update API Service with Fallback

Modify `frontend/src/services/api_node.ts` to include fallback logic:

```typescript
// Add to ApiClient class
async getPublicContentWithFallback(): Promise<ApiResponse<ContentSections>> {
  try {
    // Try to fetch from backend first
    return await this.getPublicContent();
  } catch (error) {
    console.warn('Backend unavailable, using fallback content:', error);
    
    try {
      const fallbackService = ContentFallbackService.getInstance();
      const fallbackContent = await fallbackService.getContent();
      
      return {
        success: true,
        data: fallbackContent
      };
    } catch (fallbackError) {
      console.error('Fallback content also failed:', fallbackError);
      throw new Error('Unable to load content from backend or fallback');
    }
  }
}
```

### Step 3: Update Frontend Components

#### 3.1 Update Content Hooks

Create or update `frontend/src/hooks/useContent.ts`:

```typescript
import { useState, useEffect } from 'react';
import { contentService } from '../services/api_node';

export function useContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const response = await contentService.getPublicContentWithFallback();
        
        if (response.success) {
          setContent(response.data);
        } else {
          setError(response.error || 'Failed to load content');
        }
      } catch (err) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { content, loading, error };
}
```

#### 3.2 Update Components

Update components that use content to use the new hook:

```typescript
// In Hero component
import { useContent } from '../hooks/useContent';

function Hero() {
  const { content, loading, error } = useContent();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading content: {error}</div>;

  const heroContent = content?.hero;
  // ... rest of component
}
```

### Step 4: Testing Strategy

#### 4.1 Manual Testing
1. **Backend Available**: Test normal operation when backend is running
2. **Backend Unavailable**: Test fallback when backend is down
3. **Network Issues**: Test fallback during network problems
4. **Corrupted Fallback**: Test behavior when fallback file is corrupted

#### 4.2 Automated Testing
Create test script `test-fallback.js`:

```javascript
const axios = require('axios');

async function testFallback() {
  console.log('🧪 Testing content fallback system...');
  
  // Test 1: Backend available
  try {
    const response = await axios.get('https://theacj.onrender.com/api/content/public');
    console.log('✅ Test 1 PASSED: Backend is available');
  } catch (error) {
    console.log('❌ Test 1 FAILED: Backend unavailable');
  }

  // Test 2: Fallback file exists
  const fs = require('fs');
  const path = require('path');
  const fallbackPath = path.join(__dirname, 'frontend', 'src', 'data', 'content-fallback.json');
  
  if (fs.existsSync(fallbackPath)) {
    console.log('✅ Test 2 PASSED: Fallback file exists');
  } else {
    console.log('❌ Test 2 FAILED: Fallback file missing');
  }

  console.log('🧪 Testing complete');
}

testFallback();
```

## Implementation Steps

1. **Execute Content Pull Script**
   - Run the pull script to get current MongoDB content
   - Save to `frontend/src/data/content-fallback.json`

2. **Create Fallback Service**
   - Implement `ContentFallbackService` class
   - Add fallback logic to API service

3. **Update Frontend Components**
   - Create `useContent` hook
   - Update components to use the hook

4. **Test the System**
   - Run manual tests
   - Execute automated test script

5. **Documentation**
   - Document the fallback system
   - Create maintenance procedures

## Benefits

1. **Zero Downtime**: Website remains functional even when backend is down
2. **Fast Loading**: Fallback content loads instantly from local files
3. **Maintainable**: Easy to update fallback content when needed
4. **Robust**: Multiple layers of fallback ensure content availability

## Next Steps

Ready to implement this plan? I can:
1. Create the content pull script
2. Implement the fallback service
3. Update the frontend components
4. Create testing scripts

Which step would you like to start with?