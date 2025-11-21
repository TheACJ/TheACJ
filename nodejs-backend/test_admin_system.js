#!/usr/bin/env node

/**
 * Admin System Test Script
 * ========================

This script tests the complete admin system functionality.
Run this after successful MongoDB import to verify everything works.

Usage:
node test_admin_system.js
*/

const axios = require('axios');
const colors = require('colors');

class AdminSystemTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
      info: 'blue',
      success: 'green',
      error: 'red',
      warning: 'yellow'
    };
    
    console.log(`[${timestamp}] ${message[colorMap[type] || 'white']}`);
  }

  async testHealth() {
    this.log('\n🏥 Testing Health Endpoint...', 'info');
    this.testResults.total++;
    
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      
      if (response.data.success) {
        this.log('✅ Health check passed', 'success');
        this.log(`   Environment: ${response.data.environment}`, 'info');
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      this.log('❌ Health check failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async testAdminAuthHealth() {
    this.log('\n🔐 Testing Admin Auth Health...', 'info');
    this.testResults.total++;
    
    try {
      const response = await axios.get(`${this.baseURL}/api/admin/auth/health`);
      
      if (response.data.success) {
        this.log('✅ Admin auth system is running', 'success');
        this.log(`   Version: ${response.data.version}`, 'info');
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Admin auth health check failed');
      }
    } catch (error) {
      this.log('❌ Admin auth health check failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async testDashboardHealth() {
    this.log('\n📊 Testing Dashboard Health...', 'info');
    this.testResults.total++;
    
    try {
      const response = await axios.get(`${this.baseURL}/api/admin/dashboard/health`);
      
      if (response.data.success) {
        this.log('✅ Dashboard system is running', 'success');
        this.log(`   Admin: ${response.data.admin?.username}`, 'info');
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Dashboard health check failed');
      }
    } catch (error) {
      this.log('❌ Dashboard health check failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async testContentHealth() {
    this.log('\n📝 Testing Content Management Health...', 'info');
    this.testResults.total++;
    
    try {
      const response = await axios.get(`${this.baseURL}/api/admin/content/health`);
      
      if (response.data.success) {
        this.log('✅ Content management system is running', 'success');
        this.log(`   Admin: ${response.data.admin?.username}`, 'info');
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Content management health check failed');
      }
    } catch (error) {
      this.log('❌ Content management health check failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async testBlogPostsAPI() {
    this.log('\n📚 Testing Blog Posts API...', 'info');
    this.testResults.total++;
    
    try {
      const response = await axios.get(`${this.baseURL}/api/blog-posts`);
      
      if (response.data.success) {
        const count = response.data.data?.length || 0;
        this.log(`✅ Blog posts API working - Found ${count} posts`, 'success');
        
        // Show sample posts
        if (count > 0) {
          this.log('   Sample posts:', 'info');
          response.data.data.slice(0, 3).forEach((post, index) => {
            this.log(`   ${index + 1}. ${post.title}`, 'info');
          });
        }
        
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Blog posts API returned unsuccessful response');
      }
    } catch (error) {
      this.log('❌ Blog posts API test failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async testWorkItemsAPI() {
    this.log('\n💼 Testing Work Items API...', 'info');
    this.testResults.total++;
    
    try {
      const response = await axios.get(`${this.baseURL}/api/works`);
      
      if (response.data.success) {
        const count = response.data.data?.length || 0;
        this.log(`✅ Work items API working - Found ${count} items`, 'success');
        
        // Show sample items
        if (count > 0) {
          this.log('   Sample work items:', 'info');
          response.data.data.slice(0, 3).forEach((item, index) => {
            this.log(`   ${index + 1}. ${item.title}`, 'info');
          });
        }
        
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Work items API returned unsuccessful response');
      }
    } catch (error) {
      this.log('❌ Work items API test failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async testAdminLogin() {
    this.log('\n🔑 Testing Admin Login (Demo)...', 'info');
    this.testResults.total++;
    
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123'
      };
      
      const response = await axios.post(`${this.baseURL}/api/admin/auth/login`, loginData);
      
      if (response.data.success) {
        this.log('✅ Admin login working!', 'success');
        this.log(`   Admin: ${response.data.data?.admin?.fullName || response.data.data?.admin?.username}`, 'info');
        this.log(`   Token: ${response.data.data?.token ? 'Generated' : 'Missing'}`, 'info');
        this.testResults.passed++;
        return true;
      } else {
        throw new Error('Admin login returned unsuccessful response');
      }
    } catch (error) {
      this.log('❌ Admin login test failed', 'error');
      this.log(`   Error: ${error.message}`, 'error');
      this.testResults.failed++;
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Admin System Tests...', 'success');
    this.log('==========================================', 'info');
    
    await this.testHealth();
    await this.testAdminAuthHealth();
    await this.testDashboardHealth();
    await this.testContentHealth();
    await this.testBlogPostsAPI();
    await this.testWorkItemsAPI();
    await this.testAdminLogin();
    
    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 Test Summary', 'info');
    this.log('=================', 'info');
    this.log(`✅ Passed: ${this.testResults.passed}`, 'success');
    this.log(`❌ Failed: ${this.testResults.failed}`, 'error');
    this.log(`📊 Total: ${this.testResults.total}`, 'info');
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    this.log(`🎯 Success Rate: ${successRate}%`, 'info');
    
    if (this.testResults.failed === 0) {
      this.log('\n🎉 All tests passed! Your admin system is working perfectly!', 'success');
      this.log('\n🌐 Access your admin interface:', 'info');
      this.log('   URL: http://localhost:5000/admin/login', 'info');
      this.log('   Username: admin@theacj.com', 'info');
      this.log('   Password: admin123', 'info');
    } else {
      this.log('\n⚠️  Some tests failed. Check the errors above.', 'warning');
    }
  }
}

// Main execution
if (require.main === module) {
  const tester = new AdminSystemTester();
  tester.runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = AdminSystemTester;