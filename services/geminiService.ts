import { GoogleGenAI, Modality } from "@google/genai";
import { toBase64 } from "../utils/fileUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ImageResult {
  url: string;
  text?: string;
}

const scaleImage = (dataUrl: string, scale: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

export const generateOrEditImage = async (
  prompt: string,
  imageFile?: File,
  aspectRatio?: string,
  scale: number = 1
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
          let url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          // Apply scale if not 1
          if (scale !== 1) {
            url = await scaleImage(url, scale);
          }
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

    const results = await Promise.all(
      response.generatedImages.map(async (img) => {
        let url = `data:image/png;base64,${img.image.imageBytes}`;
        // Apply scale if not 1
        if (scale !== 1) {
          url = await scaleImage(url, scale);
        }
        return { url };
      })
    );

    return results;
  }
};

