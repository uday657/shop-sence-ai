import { GoogleGenAI, Type } from "@google/genai";
import { Product, SimulatedUserData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_INVENTORY_CONTEXT = `
You are an AI engine for an e-commerce store called "ShopSense".
We sell high-quality lifestyle items including:
- Electronics (Headphones, Smartwatches, Cameras)
- Outdoor Gear (Hiking boots, Tents, Backpacks)
- Home Goods (Blenders, Coffee Makers, Ergonomic Chairs)
- Fashion (Sneakers, Jackets, Sunglasses)
- Wellness (Yoga Mats, Vitamins, Essential Oils)

Your goal is to analyze the user's private data (messages and contacts) to find implied needs and recommend products from our inventory.
`;

export const getPersonalizedRecommendations = async (
  userData: SimulatedUserData
): Promise<Product[]> => {
  try {
    const prompt = `
      User's Recent Messages/Context:
      ${JSON.stringify(userData.recentMessages)}

      User's Contact Network Implications:
      ${JSON.stringify(userData.contactInterests)}

      Task:
      1. Analyze the user's likely current needs based on the text.
      2. Select exactly 4 distinct products from the store inventory that best match these needs.
      3. Provide a short, friendly "matchReason" for each, explaining why it fits their recent conversations (e.g., "Great for your upcoming trip mentioned in messages").
      4. Estimate a realistic price.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: MOCK_INVENTORY_CONTEXT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING },
              matchReason: { type: Type.STRING },
            },
            required: ["id", "name", "description", "price", "category", "matchReason"],
          },
        },
      },
    });

    const jsonStr = response.text || "[]";
    const products: Product[] = JSON.parse(jsonStr);

    // Hydrate with placeholder images since the model doesn't generate real URLs
    return products.map((p, idx) => ({
      ...p,
      imageUrl: `https://picsum.photos/seed/${p.id + idx}/400/400`,
    }));
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return [];
  }
};
