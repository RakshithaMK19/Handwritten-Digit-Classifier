
import { GoogleGenAI, Type } from "@google/genai";
import { type PredictionResult } from '../types';

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      digit: {
        type: Type.INTEGER,
        description: 'The digit identified (0-9).',
      },
      probability: {
        type: Type.NUMBER,
        description: 'The model\'s confidence score for this digit, between 0 and 1.',
      },
    },
    required: ['digit', 'probability'],
  },
};

export const classifyDigit = async (base64Image: string): Promise<PredictionResult[]> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image,
    },
  };

  const textPart = {
    text: `Analyze this image of a handwritten digit. Provide a confidence score (probability) for each digit from 0 to 9. The sum of all probabilities should be 1.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation of the parsed JSON
    if (!Array.isArray(parsedJson)) {
        throw new Error("API response is not an array.");
    }
    
    // Normalize probabilities to ensure they sum to 1, as model output can be approximate.
    const totalProbability = parsedJson.reduce((sum, item) => sum + (item.probability || 0), 0);
    
    if (totalProbability === 0) {
      // If all probabilities are 0, return them as is to avoid division by zero.
      return parsedJson as PredictionResult[];
    }
    
    const normalizedResults: PredictionResult[] = parsedJson.map(item => ({
        ...item,
        probability: item.probability / totalProbability,
    }));


    return normalizedResults;

  } catch (error) {
    console.error("Error classifying digit with Gemini API:", error);
    throw new Error("Failed to communicate with the AI model. Please try again.");
  }
};
