import { GoogleGenAI, Modality } from "@google/genai";

export async function generateStoryAudio(text: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Raconte cette histoire avec une voix calme et posée en français : ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Gemini TTS returns raw PCM 16-bit Mono at 24kHz.
    // We need to wrap it in a WAV header to make it playable by the <audio> tag.
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + len, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true); // Subchunk1Size for PCM
    // audio format (1 for PCM)
    view.setUint16(20, 1, true);
    // channel count (1 for Mono)
    view.setUint16(22, 1, true);
    // sample rate (24000)
    view.setUint32(24, 24000, true);
    // byte rate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint32(28, 24000 * 1 * 2, true);
    // block align (NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, len, true);

    const combined = new Uint8Array(44 + len);
    combined.set(new Uint8Array(wavHeader), 0);
    combined.set(bytes, 44);

    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    const base64Wav = window.btoa(binary);
    return `data:audio/wav;base64,${base64Wav}`;
  } catch (error) {
    console.error("Error generating audio with Gemini TTS:", error);
    return null;
  }
}
