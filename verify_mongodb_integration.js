#!/usr/bin/env node

/**
 * Verification Script - MongoDB Integration Check
 * This script helps verify that your frontend is successfully using MongoDB data
 * instead of hardcoded fallbacks.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MongoDB Integration Verification');
console.log('=====================================\n');

// Check 1: Verify useContent.tsx has no DEFAULT_CONTENT
console.log('📋 Check 1: Content Hook - No Hardcoded Defaults');
const useContentPath = path.join(__dirname, 'frontend/src/hooks/useContent.tsx');
try {
  const useContentContent = fs.readFileSync(useContentPath, 'utf8');
  
  if (useContentContent.includes('DEFAULT_CONTENT')) {
    console.log('❌ FAILED: useContent.tsx still contains DEFAULT_CONTENT');
    process.exit(1);
  }
  
  if (useContentContent.includes('EMPTY_CONTENT')) {
    console.log('✅ PASSED: useContent.tsx uses EMPTY_CONTENT instead of defaults');
  } else {
    console.log('⚠️  WARNING: EMPTY_CONTENT not found in useContent.tsx');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read useContent.tsx:', error.message);
}

// Check 2: Verify Hero component uses MongoDB data
console.log('\n📋 Check 2: Hero Component - MongoDB Integration');
const heroPath = path.join(__dirname, 'frontend/src/components/Hero.tsx');
try {
  const heroContent = fs.readFileSync(heroPath, 'utf8');
  
  if (heroContent.includes('const slides = [')) {
    console.log('❌ FAILED: Hero.tsx still contains hardcoded slides array');
    process.exit(1);
  }
  
  if (heroContent.includes('useContent')) {
    console.log('✅ PASSED: Hero.tsx uses useContent hook for MongoDB data');
  } else {
    console.log('❌ FAILED: Hero.tsx does not use useContent hook');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read Hero.tsx:', error.message);
}

// Check 3: Verify About component uses MongoDB data  
console.log('\n📋 Check 3: About Component - MongoDB Integration');
const aboutPath = path.join(__dirname, 'frontend/src/components/About.tsx');
try {
  const aboutContent = fs.readFileSync(aboutPath, 'utf8');
  
  const hardcodedTexts = [
    'Web Development:',
    'Data Analytics:',
    'Blockchain & Web3:',
    'My core mission?'
  ];
  
  const hasHardcodedText = hardcodedTexts.some(text => aboutContent.includes(text));
  
  if (hasHardcodedText) {
    console.log('❌ FAILED: About.tsx still contains hardcoded text blocks');
    process.exit(1);
  }
  
  if (aboutContent.includes('useContent')) {
    console.log('✅ PASSED: About.tsx uses useContent hook and removed hardcoded text');
  } else {
    console.log('❌ FAILED: About.tsx does not use useContent hook');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read About.tsx:', error.message);
}

// Check 4: Verify Counter component uses MongoDB data
console.log('\n📋 Check 4: Counter Component - MongoDB Integration');
const counterPath = path.join(__dirname, 'frontend/src/components/Counter.tsx');
try {
  const counterContent = fs.readFileSync(counterPath, 'utf8');
  
  if (counterContent.includes('const counters = [')) {
    console.log('❌ FAILED: Counter.tsx still contains hardcoded counters array');
    process.exit(1);
  }
  
  if (counterContent.includes('content.counter')) {
    console.log('✅ PASSED: Counter.tsx uses content.counter from MongoDB');
  } else {
    console.log('❌ FAILED: Counter.tsx does not use content.counter');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read Counter.tsx:', error.message);
}

// Check 5: Verify API test script exists
console.log('\n📋 Check 5: API Test Script');
const testApiPath = path.join(__dirname, 'test_content_api.js');
if (fs.existsSync(testApiPath)) {
  console.log('✅ PASSED: API test script exists');
} else {
  console.log('❌ FAILED: API test script not found');
}

// Check 6: Verify MongoDB import file exists
console.log('\n📋 Check 6: MongoDB Import File');
const importPath = path.join(__dirname, 'mongodb_import/complete_content_sections.json');
if (fs.existsSync(importPath)) {
  console.log('✅ PASSED: MongoDB import file exists');
} else {
  console.log('❌ WARNING: MongoDB import file not found');
}

console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Run: node test_content_api.js');
console.log('2. Start backend: cd nodejs-backend && npm start');
console.log('3. Start frontend: cd frontend && npm run dev');
console.log('4. Check browser console for MongoDB loading logs');
console.log('5. Verify all content displays from MongoDB');

console.log('\n✅ All checks completed!');
console.log('If any check failed, please review the implementation.');