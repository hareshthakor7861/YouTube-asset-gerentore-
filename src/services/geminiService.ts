import { GoogleGenAI, Modality } from "@google/genai";
import { YOUTUBE_THUMBNAIL_SIZE } from "../constants";

const getAiClient = () => {
    // FIX: Use process.env.API_KEY as per the coding guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set. Please configure it in your deployment settings.");
    }
    return new GoogleGenAI({ apiKey: apiKey });
}

export const generateText = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
};


export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9'): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image with Imagen:", error);
        throw error;
    }
};

export const generateImageWithImageInput = async (
    prompt: string,
    base64ImageData: string,
    mimeType: string
): Promise<string> => {
    const ai = getAiClient();
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image part found in the response.");

    } catch (error) {
        console.error("Error generating image with image input:", error);
        throw error;
    }
};
