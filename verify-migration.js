const http = require('http');

const TEST_ENDPOINTS = [
  { path: '/api/test-core', method: 'GET' },
  { path: '/api/test-video-download', method: 'POST', data: { url: 'https://www.tiktok.com/@test/video/123' } },
  { path: '/api/transcribe/voice', method: 'POST', data: { audioData: 'test', format: 'wav', testMode: true } },
  { path: '/api/chrome-extension/youtube-transcript', method: 'POST', data: { url: 'https://youtube.com/watch?v=test', testMode: true } }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (endpoint.data) {
      req.write(JSON.stringify(endpoint.data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Migration Verification Tests...\n');
  
  for (const endpoint of TEST_ENDPOINTS) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      const result = await testEndpoint(endpoint);
      console.log(`✅ Status: ${result.status}`);
      console.log(`📝 Response:`, JSON.stringify(result.data, null, 2));
      console.log('---');
    } catch (error) {
      console.log(`❌ Error:`, error.message);
      console.log('---');
    }
  }
  
  console.log('🎉 Migration verification completed!');
}

runTests();