import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Use Gemini 2.5 Flash Image for generation and editing
export const generateTimeTravelImage = async (
  base64Image: string,
  stylePrompt: string,
  customInstruction?: string
): Promise<string> => {
  const ai = getAiClient();
  
  // Clean base64 string
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  let prompt = `Transform the person in this image. Style target: ${stylePrompt}. 
  Keep the person's facial features and likeness recognizable but change their clothing, hair, lighting and background to match the style description perfectly. 
  High quality, photorealistic, cinematic lighting.`;

  if (customInstruction) {
    prompt = `Edit this image: ${customInstruction}. Maintain the established style and the person's identity.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    // Check for image parts in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

// Use Gemini 3 Pro Preview for deep analysis
export const analyzeHistoricalAccuracy = async (base64Image: string): Promise<string> => {
  const ai = getAiClient();
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          { text: "Analyze this image. What historical era or professional style does it appear to depict? Evaluate the clothing, background, and lighting. Be specific but concise." }
        ]
      }
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};