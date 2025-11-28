import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const generateCharacterResponse = async (
  characterName: string,
  characterDescription: string,
  userMessage: string,
  chatHistory: string[]
): Promise<string> => {
  const client = getAiClient();
  if (!client) return "..."; 

  try {
    const systemPrompt = `
      You are roleplaying as a cam model named ${characterName} on a website called "THE DUNGEON".
      Your persona description is: "${characterDescription}".
      The setting is dark, seductive, and playful.
      Keep your responses short (under 50 words), flirtatious, and engaging.
      Do not be explicitly NSFW in a banned way, but be suggestive and fit the "dungeon" theme.
      Interact directly with the user.
    `;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        System: ${systemPrompt}
        Recent Chat History: ${chatHistory.join('\n')}
        User: ${userMessage}
        ${characterName}:
      `,
    });

    return response.text || "I'm feeling a bit shy right now...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble hearing you darling...";
  }
};

export const getModelAssistantAdvice = async (
  chatHistory: string[],
  viewerCount: number
): Promise<{ action: 'BAN' | 'UPSELL' | 'NONE', suggestion: string }> => {
  const client = getAiClient();
  if (!client) return { action: 'NONE', suggestion: 'System offline.' };

  try {
    const prompt = `
      You are an AI assistant for a cam model on "THE DUNGEON".
      Analyze the recent chat history and viewer count (${viewerCount}).
      
      Chat History:
      ${chatHistory.slice(-5).join('\n')}

      1. If a user is being rude/harassing, suggest a BAN for 24hrs.
      2. If the chat is slow or users are praising, suggest an UPSELL (e.g., "Tip 50 for a dice roll" or "Join private").
      3. Otherwise, return NONE.

      Return valid JSON only: { "action": "BAN" | "UPSELL" | "NONE", "suggestion": "The text to show the model" }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const json = JSON.parse(response.text || '{}');
    return json;
  } catch (e) {
    console.error(e);
    return { action: 'NONE', suggestion: 'Keep being fabulous.' };
  }
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  const client = getAiClient();
  if (!client) return text;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following chat message to ${targetLang}. Preserve the tone and slang if possible. Returns ONLY the translated text.\n\nMessage: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (e) {
    return text;
  }
};

export const generateContentTags = async (description: string): Promise<string[]> => {
  const client = getAiClient();
  if (!client) return ["Featured", "New"];

  try {
    const prompt = `
      Generate 5-8 one-word tags for a piece of adult/glamour content described as: "${description}".
      Tags should be relevant to categories like: Fetish, Body Type, Vibe, Clothing.
      Return strictly a JSON array of strings. Example: ["Redhead", "Latex", "Domme"]
    `;
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return ["Model", "Exclusive"];
  }
};

export const generateWatermarkID = async (modelName: string): Promise<string> => {
    const client = getAiClient();
    if (!client) return `DGN-${modelName.toUpperCase().replace(/\s/g, '')}-PROTECTED`;

    try {
        const prompt = `
            Generate a short, unique, alphanumeric copyright protection ID string for a creator named "${modelName}" on the platform "THE DUNGEON".
            It should look sophisticated and technical.
            Example: "DGN-VAYDA-X92-SECURE"
            Return ONLY the string.
        `;
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || `DGN-${Date.now()}`;
    } catch (e) {
        return `DGN-${Date.now()}`;
    }
};