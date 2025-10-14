const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModelsWithAPI() {
  console.log('Testing Gemini API with actual API calls...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Test text-only models first
  const textModels = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  
  console.log('=== Testing TEXT models ===\n');
  
  for (const modelName of textModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('こんにちは。簡単に返事してください。');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} - Working!`);
      console.log(`   Response: ${text.substring(0, 80)}...\n`);
      
    } catch (error) {
      console.log(`❌ ${modelName} - Error: ${error.message}\n`);
    }
  }
  
  // Test vision models with a simple test
  console.log('\n=== Testing VISION models ===\n');
  
  const visionModels = ['gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  
  // Simple 1x1 red pixel as base64 PNG
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  for (const modelName of visionModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const imageParts = [
        {
          inlineData: {
            data: testImage,
            mimeType: 'image/png',
          },
        },
      ];
      
      const result = await model.generateContent(['この画像を説明してください。', ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} (vision) - Working!`);
      console.log(`   Response: ${text.substring(0, 80)}...\n`);
      
    } catch (error) {
      console.log(`❌ ${modelName} (vision) - Error: ${error.message}\n`);
    }
  }
}

testModelsWithAPI().catch(console.error);
