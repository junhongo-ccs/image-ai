const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini25Flash() {
  console.log('Testing Gemini 2.5 Flash with image...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  // Simple 1x1 red pixel as base64 PNG
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  try {
    const imageParts = [
      {
        inlineData: {
          data: testImage,
          mimeType: 'image/png',
        },
      },
    ];
    
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(['この画像について詳しく日本語で説明してください。', ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Status:', error.status);
    console.error('Full error:', error);
  }
}

testGemini25Flash().catch(console.error);
