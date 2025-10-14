const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testAPIKey() {
  console.log('Testing Gemini API Key...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return;
  }
  
  console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`API Key length: ${apiKey.length} characters\n`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with a simple text model first
    console.log('Testing with gemini-pro (text only)...');
    const textModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const textResult = await textModel.generateContent('こんにちは');
    const textResponse = await textResult.response;
    console.log('✅ gemini-pro works!');
    console.log('Response:', textResponse.text().substring(0, 100) + '...\n');
    
  } catch (error) {
    console.error('❌ Error with gemini-pro:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
      console.error('\n⚠️  APIキーが無効です。以下を確認してください:');
      console.error('1. Google AI Studioでキーが有効か確認');
      console.error('2. キーが削除または無効化されていないか確認');
      console.error('3. 新しいキーを生成: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('401')) {
      console.error('\n⚠️  APIキーに権限がありません');
    } else if (error.message.includes('404')) {
      console.error('\n⚠️  モデルが見つかりません（APIキーは有効ですが、アクセス権限がない可能性）');
    }
    return;
  }
  
  // Test with vision model
  try {
    console.log('Testing with gemini-pro-vision (multimodal)...');
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    console.log('✅ gemini-pro-vision model initialized successfully\n');
  } catch (error) {
    console.error('❌ Error with gemini-pro-vision:', error.message);
  }
  
  // Try newer models
  const modelsToTry = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest'
  ];
  
  console.log('Testing newer models...');
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('test');
      console.log(`✅ ${modelName} works!`);
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message.split('\n')[0]}`);
    }
  }
}

testAPIKey();
