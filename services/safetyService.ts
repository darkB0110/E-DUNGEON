
import { GoogleGenAI } from "@google/genai";

// Simulate a connection to a Computer Vision / Safety API
export const safetyService = {
  
  // Scans a File object (upload) for AI markers or Deepfake artifacts
  scanContent: async (file: File): Promise<{ safe: boolean; reason?: string; confidence?: number }> => {
    // Simulate processing delay (1.5s)
    await new Promise(r => setTimeout(r, 1500));

    const fileName = file.name.toLowerCase();
    
    // DEMO LOGIC: Flag files with 'fake', 'ai', 'gen', 'swap' in the name for demonstration
    if (fileName.includes('fake') || fileName.includes('deep') || fileName.includes('gen') || fileName.includes('swap')) {
        return {
            safe: false,
            reason: 'Deepfake signature detected (Face Swap artifacts & GAN residuals)',
            confidence: 0.98
        };
    }

    // DEMO LOGIC: Random strict check for demonstration of "False Positive" or specific AI textures
    if (Math.random() < 0.05) {
        return {
            safe: false,
            reason: 'Suspected AI Generation (Inconsistent pixel density / Artifacts)',
            confidence: 0.85
        };
    }

    return { safe: true };
  },

  // Periodically scans a live stream frame
  scanStreamFrame: async (performerId: string): Promise<{ safe: boolean; reason?: string }> => {
      // In a real app, this would grab a frame from the WebRTC stream and send to an API.
      // Here, we simulate a check.
      
      const checkChance = Math.random();
      
      // 2% chance per scan to trigger a Deepfake alert for demonstration
      if (checkChance < 0.02) {
          return {
              safe: false,
              reason: 'Real-time Deepfake Detection: Facial landmarks desynchronized.'
          };
      }

      return { safe: true };
  },

  // Analyze text/metadata using Gemini (Real AI call if key exists)
  analyzeMetadata: async (description: string): Promise<boolean> => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return true;

      try {
        const client = new GoogleGenAI({ apiKey });
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this content description for intent to distribute deepfakes or non-consensual AI content. 
            Description: "${description}"
            Return ONLY "SAFE" or "UNSAFE".`
        });
        const text = response.text?.trim().toUpperCase() || 'SAFE';
        return text === 'SAFE';
      } catch (e) {
          return true; // Fail open if API error
      }
  }
};
