// api/analyze.js

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '10mb' })); // Büyük boyutlu görüntüleri işlemek için limit ayarlıyoruz

const OPENAI_API_KEY = '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'; // OpenAI API anahtarınızı buraya ekleyin

app.post('/api/analyze', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'What is in this image?' },
                            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
                        ],
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({ result: response.data.choices[0].message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

module.exports = app;