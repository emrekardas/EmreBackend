import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        });

        if (response && response.choices && response.choices.length > 0) {
            res.status(200).json({ result: response.choices[0].message });
        } else {
            console.error('Unexpected response format:', response);
            res.status(500).json({ error: 'Unexpected response format from OpenAI API' });
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error.response || error);
        res.status(500).json({ 
            error: 'Failed to analyze image', 
            details: error.message,
            status: error.response?.status
        });
    }
}