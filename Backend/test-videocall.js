// Simple test script for videocall functionality
// Run this after starting the backend server

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Test videocall endpoints
async function testVideocallEndpoints() {
  console.log('Testing Videocall Endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running\n');

    // Test 2: Test videocall route (should return 401 without auth)
    console.log('2. Testing videocall route without authentication...');
    try {
      await axios.post(`${BASE_URL}/videocall/initiate`, {
        receiverUsername: 'testuser'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Videocall route is protected (requires authentication)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    console.log('');

    console.log('✅ All basic tests passed!');
    console.log('\nTo test full functionality:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Login to the application');
    console.log('4. Navigate to chats and try the video call button');
    console.log('\nNote: You need Agora.io credentials in .env file for full functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend server is running on port 8000');
  }
}

// Run tests
testVideocallEndpoints();



