const axios = require('axios');

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
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response && response.data && response.data.choices) {
            res.json({ result: response.data.choices[0].message });
        } else {
            console.error('Unexpected response format:', response.data);
            res.status(500).json({ error: 'Unexpected response format from OpenAI API' });
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: `Failed to analyze image: ${error.message}` });
    }
}