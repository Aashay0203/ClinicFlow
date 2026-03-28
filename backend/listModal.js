import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "AIzaSyBJuHTw3OR99Y8Ya5FHDljyeKHELbdaeng" });
const models = await ai.models.list();
for await (const model of models) {
    console.log(model.name);
}