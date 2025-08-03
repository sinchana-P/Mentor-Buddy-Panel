// Test script for deployment verification
import fetch from 'node-fetch';

const FRONTEND_URL = 'https://mentor-buddy-panel-123.vercel.app';
const BACKEND_URL = 'https://mentor-buddy-panel-backend.onrender.com';

async function testEndpoint(url, description) {
  try {
    console.log(`🧪 Testing: ${description}`);
    const response = await fetch(url);
    const status = response.status;
    
    if (status >= 200 && status < 400) {
      console.log(`✅ ${description} - Status: ${status}`);
      return true;
    } else {
      console.log(`❌ ${description} - Status: ${status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Deployment Tests...\n');

  const tests = [
    // Backend Health Check
    { url: `${BACKEND_URL}/api/health`, description: 'Backend Health Check' },
    
    // API Endpoints
    { url: `${BACKEND_URL}/api/mentors`, description: 'Mentors API' },
    { url: `${BACKEND_URL}/api/buddies`, description: 'Buddies API' },
    { url: `${BACKEND_URL}/api/tasks`, description: 'Tasks API' },
    
    // Frontend
    { url: FRONTEND_URL, description: 'Frontend Homepage' },
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    if (result) passed++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Deployment is successful.');
  } else {
    console.log('⚠️  Some tests failed. Check the deployment configuration.');
  }
}

runTests().catch(console.error);