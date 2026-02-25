import { GoogleGenAI } from "@google/genai";

export const generateAppScreens = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompts = [
    {
      id: 'home',
      prompt: "A high-quality mobile app interface for a modern Islamic application called 'Emerald Islam'. The screen shows a dark mode dashboard with a vibrant emerald green theme. At the top, a prayer time countdown for 'Maghrib' with a large digital clock. Below, a section for 'Next Fasting Opportunity' showing 'Monday (Sunnah)' with a 'Set Intention' button. The design is clean, using bento-grid style cards, glassmorphism effects, and elegant typography."
    },
    {
      id: 'calendar',
      prompt: "A mobile app screen showing a sophisticated Hijri calendar. The theme is dark with emerald green accents. The calendar grid shows dates with small colored dots (green, orange, blue) indicating fasting activities. Below the calendar, a list of 'Upcoming Events' like 'Ramadan' and 'Eid al-Fitr' with beautiful icons. The interface feels premium, professional, and spiritual."
    },
    {
      id: 'stats',
      prompt: "A detailed progress tracking screen for an Islamic app. It features a circular progress ring showing '75% Qada Completed'. There are statistics for 'Days Remaining' and 'Days Fasted'. The background is a dark matte finish with subtle emerald glows. The typography is modern and legible, conveying a sense of achievement and spiritual growth."
    }
  ];

  const results = [];

  for (const p of prompts) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: p.prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        results.push({
          id: p.id,
          url: `data:image/png;base64,${part.inlineData.data}`
        });
      }
    }
  }

  return results;
};
