import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY  // Check this value
});
console.log(process.env.OPENAI_API_KEY);
export default async function handler(req, res) {
    console.log('API endpoint /api/analyze was hit');

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { image } = req.body;

    if (!image) {
        res.status(400).json({ 
            result: {
                content: "Image data is required",
                role: "error"
            }
        });
        return;
    }

    try {
        // Validate API key is present
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured');
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
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

        // Always return in the expected format
        res.status(200).json({
            result: {
                content: response.choices[0].message.content,
                role: response.choices[0].message.role
            }
        });
    } catch (error) {
        console.error('Error:', error);
        // Return error in the same format as success
        res.status(500).json({
            result: {
                content: `Error: ${error.message}`,
                role: "error"
            }
        });
    }
}