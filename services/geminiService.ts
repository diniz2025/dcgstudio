import { GoogleGenAI, Chat, GroundingChunk } from '@google/genai';

class GeminiService {
  private getAiInstance() {
    // Create a new instance for each call to ensure the latest API key from the Veo dialog is used.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // --- Text & Chat ---

  startChat(model: string): Chat {
    const ai = this.getAiInstance();
    return ai.chats.create({ model });
  }

  async generateGroundedContent(
    prompt: string, 
    mode: 'web' | 'maps',
    location: { latitude: number; longitude: number } | null
  ): Promise<{ text: string; chunks: GroundingChunk[] }> {
    const ai = this.getAiInstance();
    const tools: any[] = mode === 'web' ? [{ googleSearch: {} }] : [{ googleMaps: {} }];
    const toolConfig = mode === 'maps' && location ? { retrievalConfig: { latLng: location } } : {};

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools, toolConfig },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, chunks: chunks as GroundingChunk[] };
  }
  
  async generateAdvancedText(prompt: string, mode: 'thinking' | 'fast') {
    const ai = this.getAiInstance();
    if (mode === 'thinking') {
      return ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 32768 } },
      });
    } else {
      return ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      });
    }
  }

  // --- Image ---
  
  async generateImage(prompt: string, aspectRatio: string) {
    const ai = this.getAiInstance();
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio as any,
      },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
  
  async editImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
    const ai = this.getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ],
      },
      config: { responseModalities: ['IMAGE'] },
    });
    return response.candidates[0].content.parts[0].inlineData!.data;
  }

  async analyzeImage(base64Image: string, mimeType: string, prompt: string) {
    const ai = this.getAiInstance();
    return ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ],
      },
    });
  }

  async analyzeVideoFrame(base64Image: string, mimeType: string, prompt: string) {
    const ai = this.getAiInstance();
    return ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ],
      },
    });
  }
  
  // --- Video ---

  async generateVideoFromText(prompt: string, aspectRatio: '16:9' | '9:16') {
    const ai = this.getAiInstance();
    return ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { numberOfVideos: 1, aspectRatio, resolution: '720p' },
    });
  }
  
  async generateVideoFromImage(prompt: string, image: { imageBytes: string; mimeType: string }, aspectRatio: '16:9' | '9:16') {
     const ai = this.getAiInstance();
     return ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image,
      config: { numberOfVideos: 1, aspectRatio, resolution: '720p' },
    });
  }

  async getVeoOperation(operation: any) {
    const ai = this.getAiInstance();
    return ai.operations.getVideosOperation({ operation });
  }
  
  async fetchVeoVideo(downloadLink: string): Promise<string> {
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  // --- Audio ---

  async transcribeAudio(base64Audio: string, mimeType: string) {
    const ai = this.getAiInstance();
    return ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: 'Transcreva este áudio.' },
        ],
      },
    });
  }
  
  async generateSpeech(text: string): Promise<string> {
    const ai = this.getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: { responseModalities: ['AUDIO'] },
    });
    return response.candidates[0].content.parts[0].inlineData!.data;
  }
}

export const geminiService = new GeminiService();