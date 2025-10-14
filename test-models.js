const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('Testing different model names...\n');
    
    const modelNames = [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro-vision',
      'models/gemini-pro',
      'models/gemini-pro-vision'
    ];
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✓ Model "${modelName}" - initialized successfully`);
      } catch (error) {
        console.log(`✗ Model "${modelName}" - failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
