const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use Gemini 2.5 Flash - fast and supports images
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Add CSP headers for Flutter web
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://generativelanguage.googleapis.com https://www.gstatic.com https://fonts.gstatic.com blob:; " +
    "worker-src 'self' blob:; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  next();
});

app.use(express.static(path.join(__dirname, 'build/web')));

// API endpoint for image description
app.post('/api/describe', async (req, res) => {
  console.log('📷 Received image description request');
  
  try {
    const { image } = req.body;
    
    if (!image) {
      console.log('❌ No image data in request');
      return res.status(400).json({ error: '画像データがありません' });
    }

    console.log(`📊 Image data length: ${image.length} characters`);
    
    // Extract mime type and base64 data
    let mimeType = 'image/jpeg';
    let imageData = image;
    
    // Check if image has data URL prefix
    if (image.includes('data:')) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        imageData = matches[2];
        console.log(`✅ Extracted MIME type: ${mimeType}, data length: ${imageData.length}`);
      }
    } else {
      console.log(`⚠️  No data URL prefix, assuming raw base64`);
    }

    const imageParts = [
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
    ];

    console.log('🤖 Calling Gemini API...');
    const prompt = 'この画像について詳しく日本語で説明してください。';
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    console.log(`✅ Success! Response length: ${text.length} characters`);
    res.json({ description: text });
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', error.message);
    console.error('Error status:', error.status);
    
    const errorMsg = error.status === 401 
      ? 'API認証エラー。APIキーを確認してください。' 
      : `AI処理中にエラーが発生しました: ${error.message}`;
    
    res.status(error.status || 500).json({ error: errorMsg });
  }
});

// Serve Flutter web app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/web', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
