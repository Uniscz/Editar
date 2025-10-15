import { GoogleGenAI, Modality } from "@google/genai";
import { toBase64 } from "../utils/fileUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ImageResult {
  url: string;
  text?: string;
}

export const generateOrEditImage = async (
  prompt: string,
  imageFile?: File,
  aspectRatio?: string
): Promise<ImageResult[]> => {
  if (imageFile) {
    // --- Image Editing Logic ---
    const base64Data = await toBase64(imageFile);
    const imagePart = {
      inlineData: {
        mimeType: imageFile.type,
        data: base64Data,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const results: ImageResult[] = [];
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          results.push({ url });
        } else if (part.text) {
           if (results.length > 0) {
            results[results.length - 1].text = (results[results.length - 1].text || '') + part.text;
          }
        }
      }
    }
    if (results.length === 0) {
      throw new Error("API did not return an image. The prompt may have been blocked or the content policy was triggered.");
    }
    return results;

  } else {
    // --- Image Generation Logic ---
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio || '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed. The prompt may have been blocked or the content policy was triggered.");
    }

    return response.generatedImages.map(img => ({
        url: `data:image/png;base64,${img.image.imageBytes}`,
    }));
  }
};