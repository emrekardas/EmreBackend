import axios from 'axios';

// Function to analyze image using Vision API
async function analyzeImage(base64Image) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini', // Model adını doğru ayarlayın
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'What is in this image?',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.choices[0].message;
    } catch (error) {
        console.error('Error calling OpenAI API:', error.message);
        throw new Error('Failed to analyze image');
    }
}

// Vercel'in desteklediği bir serverless işlev olarak export ediyoruz
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { image } = req.body;

    if (!image) {
        res.status(400).json({ error: 'Image data is required' });
        return;
    }

    try {
        const result = await analyzeImage(image);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}