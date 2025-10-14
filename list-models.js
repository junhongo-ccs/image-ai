const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAvailableModels() {
  console.log('Listing available models from Gemini API...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`Using API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}\n`);
  
  try {
    // Try to list models using direct API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`Response: ${text}`);
      return;
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log(`✅ Found ${data.models.length} available models:\n`);
      
      data.models.forEach((model) => {
        console.log(`  - ${model.name}`);
        console.log(`    Display Name: ${model.displayName}`);
        console.log(`    Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No models found. Your API key may not have access to any models.');
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listAvailableModels().catch(console.error);
