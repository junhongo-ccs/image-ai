const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'build/web')));

// API endpoint for image description
app.post('/api/describe', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: '画像データがありません' });
    }

    const imageParts = [
      {
        inlineData: {
          data: image,
          mimeType: 'image/jpeg',
        },
      },
    ];

    const prompt = 'この画像について詳しく日本語で説明してください。';
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    res.json({ description: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'AI処理中にエラーが発生しました' });
  }
});

// Serve Flutter web app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/web', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
