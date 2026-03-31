import { GoogleGenAI, Modality, Type, ThinkingLevel, LiveServerMessage } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export const getAI = (customApiKey?: string) => {
  return new GoogleGenAI({ apiKey: customApiKey || API_KEY });
};

export const hasSelectedKey = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return false;
};

export const openKeySelector = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
    await (window as any).aistudio.openSelectKey();
  }
};

// 1. Generate Music (Lyria)
export async function* generateMusic(prompt: string, model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview' = 'lyria-3-clip-preview') {
  const ai = getAI(process.env.API_KEY);
  const response = await ai.models.generateContentStream({
    model,
    contents: prompt,
    config: {
      responseModalities: [Modality.AUDIO],
    },
  });

  for await (const chunk of response) {
    yield chunk;
  }
}

// 2. Create/Edit Images (Nano Banana)
export const generateImage = async (prompt: string, model: 'gemini-3.1-flash-image-preview' | 'gemini-2.5-flash-image' = 'gemini-2.5-flash-image', config?: any) => {
  const ai = getAI(process.env.API_KEY);
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: config || { aspectRatio: "1:1" },
    },
  });
  
  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  return null;
};

// 3. High-Quality Image Generation (Pro Image)
export const generateHQImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
  const ai = getAI(process.env.API_KEY);
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1"
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  return null;
};

// 4. Analyze Video Content
export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: videoBase64, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

// 5. Transcribe Audio
export const transcribeAudio = async (audioBase64: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType } },
        { text: "Transcribe this audio exactly as spoken." }
      ]
    }
  });
  return response.text;
};

// 6. Text to Speech (TTS)
export const generateTTS = async (text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return base64Audio;
  }
  return null;
};

// 7. Live API (Voice Conversations)
export const connectLive = (callbacks: {
  onopen?: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}, systemInstruction?: string) => {
  const ai = getAI();
  return ai.live.connect({
    model: "gemini-3.1-flash-live-preview",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction,
    },
  });
};
