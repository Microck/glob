const fs = require('fs');
const FormData = require('formdata-node');
const { fileFromPath } = require('formdata-node/file-from-path');

async function testAPI() {
  try {
    // Create a simple test GLB file (this is a minimal valid GLB header)
    const testBuffer = Buffer.alloc(80);
    testBuffer.write('glTF', 0);
    testBuffer.writeUInt32LE(2, 4); // Version
    testBuffer.writeUInt32LE(80, 8); // Length
    testBuffer.writeUInt32LE(12, 12); // JSON chunk length
    testBuffer.writeUInt32LE(0x4E4F534A, 16); // JSON magic
    testBuffer.write('{"asset":{"version":"2.0"}}', 20);
    
    // Write test file
    fs.writeFileSync('/tmp/test.glb', testBuffer);
    
    const form = new FormData();
    form.append('file', await fileFromPath('/tmp/test.glb'));
    form.append('settings', JSON.stringify({
      decimateRatio: 0.5,
      dracoLevel: 7
    }));
    
    const response = await fetch('http://localhost:3001/api/optimize', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    console.log('API Test Result:', result);
    
    if (result.status === 'success') {
      console.log('✅ API is working correctly!');
      console.log('Original size:', result.originalSize);
      console.log('Optimized size:', result.optimizedSize);
      console.log('Download URL:', result.downloadUrl);
      console.log('Stats:', result.stats);
    } else {
      console.log('❌ API returned error:', result.message);
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();