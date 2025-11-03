
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { UpscaleFactor } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is a data URL: "data:image/jpeg;base64,...."
      // we only want the base64 part
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};


export const upscaleImage = async (file: File, scale: UpscaleFactor): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. Please ensure it's configured correctly.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const base64Data = await fileToBase64(file);
    const prompt = `Upscale this image by a factor of ${scale}. Enhance the details, improve sharpness, and increase the resolution while maintaining the original artistic style. Do not add new elements or change the composition. The output should be a high-quality, larger version of the original image. Remove any compression artifacts or noise.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      const upscaledBase64 = firstPart.inlineData.data;
      const mimeType = firstPart.inlineData.mimeType;
      return `data:${mimeType};base64,${upscaledBase64}`;
    } else {
      throw new Error("Upscaled image data not found in API response.");
    }

  } catch (error) {
    console.error("Error upscaling image:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to upscale image with Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image upscaling.");
  }
};
