import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY  // Check this value
});
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);  // Log the API key for debugging

export default async function handler(req, res) {
    console.log('API endpoint /api/analyze was hit');  // Log the endpoint hit

    // Check if request method is POST
    if (req.method !== 'POST') {
        console.warn("Invalid request method:", req.method);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { image } = req.body;

    // Check if image data is provided
    if (!image) {
        console.warn("No image data provided in request body");
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
            console.error("OpenAI API key is missing");
            throw new Error('OpenAI API key is not configured');
        }

        // Log that the API call is starting
        console.log("Starting OpenAI API request...");

        // Call OpenAI API
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

        console.log("OpenAI API responded successfully");

        // Check if response has choices
        if (!response.choices || response.choices.length === 0) {
            console.error("OpenAI API returned an empty response");
            throw new Error("Received an empty response from OpenAI API");
        }

        // Return response in the expected format
        res.status(200).json({
            result: {
                content: response.choices[0].message.content,
                role: response.choices[0].message.role
            }
        });
    } catch (error) {
        console.error('Error during OpenAI API call:', error);

        // Return error in the same format as success
        res.status(500).json({
            result: {
                content: `Error: ${error.message}`,
                role: "error"
            }
        });
    }
}
