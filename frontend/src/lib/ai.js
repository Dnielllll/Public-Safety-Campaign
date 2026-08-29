const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generate a response using Gemini 1.5 Flash via direct fetch (avoids CORS issues)
 * @param {string} systemPrompt The system instructions
 * @param {string} userPrompt The user's input
 * @returns {Promise<string>}
 */
export async function generateAIResponse(systemPrompt, userPrompt) {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{
            parts: [{ text: userPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
