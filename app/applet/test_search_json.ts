import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Who won the last Super Bowl? Return JSON with 'winner' and 'score'.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING },
          score: { type: Type.STRING }
        }
      }
    }
  });
  console.log(response.text);
}
run().catch(console.error);
