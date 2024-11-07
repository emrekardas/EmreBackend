import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    console.log('API endpoint /api/analyze was hit');

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

        // Log the response for debugging
        console.log('OpenAI Response:', JSON.stringify(response.choices[0].message));

        if (response && response.choices && response.choices.length > 0) {
            // Send the response in the exact format expected by the Swift app
            res.status(200).json({
                result: {
                    content: response.choices[0].message.content,
                    role: response.choices[0].message.role
                }
            });
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