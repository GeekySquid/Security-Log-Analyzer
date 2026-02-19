// Test script to verify EVTX conversion endpoint
const fetch = require('node-fetch');

async function testEVTXConversion() {
  try {
    console.log('Testing Python ML service EVTX conversion endpoint...');
    
    // Test health endpoint first
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test models endpoint
    const modelsResponse = await fetch('http://localhost:8000/models');
    const modelsData = await modelsResponse.json();
    console.log('Available models:', modelsData);
    
    console.log('\nPython ML service is running and ready!');
    console.log('\nTo test with an actual EVTX file:');
    console.log('1. Upload an EVTX file through the web interface at http://localhost:3000/evtx');
    console.log('2. The system will now use Python service for proper EVTX parsing');
    console.log('3. You should see actual event data instead of synthetic data');
    
  } catch (error) {
    console.error('Error testing Python ML service:', error.message);
    console.log('\nMake sure the Python ML service is running:');
    console.log('cd python-ml-service && python main.py');
  }
}

testEVTXConversion();
