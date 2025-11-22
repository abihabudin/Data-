import { GoogleGenAI, Type } from "@google/genai";
import { Category, Status, DataRecord } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Parses unstructured text into structured DataRecord objects.
 */
export const parseUnstructuredText = async (text: string): Promise<Partial<DataRecord>[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract product inventory data from the following text. 
      If a category is not clear, map it to 'Other'. 
      If status is not mentioned, infer it from quantity (0 = Out of Stock, < 10 = Low Stock, else In Stock).
      Return a JSON array.
      
      Text to parse: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              category: { 
                type: Type.STRING, 
                enum: [
                  Category.ELECTRONICS, 
                  Category.FURNITURE, 
                  Category.CLOTHING, 
                  Category.OFFICE, 
                  Category.OTHER
                ] 
              },
              quantity: { type: Type.NUMBER },
              price: { type: Type.NUMBER },
              status: { 
                type: Type.STRING,
                enum: [
                  Status.IN_STOCK,
                  Status.LOW_STOCK,
                  Status.OUT_OF_STOCK,
                  Status.DISCONTINUED
                ]
              },
              notes: { type: Type.STRING },
              dateAdded: { type: Type.STRING, description: "ISO 8601 date string (YYYY-MM-DD)" }
            },
            required: ["productName", "quantity", "price", "category"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) return [];
    
    const parsedData = JSON.parse(rawText);
    return parsedData;

  } catch (error) {
    console.error("Error parsing text with Gemini:", error);
    throw error;
  }
};