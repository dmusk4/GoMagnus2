import { GoogleGenAI } from "@google/genai";
async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const res = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: "A blue circle",
            config: { imageConfig: { aspectRatio: "4:5" } as any }
        });
        console.log("Success!", res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType);
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}
run();
