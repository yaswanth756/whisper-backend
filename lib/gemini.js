import axios from "axios";

export async function getSummaryAndTags(text) {
  const apiKey = "AIzaSyBbX7_DQTng-zMZ-tsuHKo1XGapXbNzmAw";
  const model = "gemini-1.5-flash";

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(endpoint, {
    contents: [
      {
        parts: [
          {
            text: `Analyze this transcription:\n${text}\n\nGive a short summary and relevant tags.`,
          },
        ],
      },
    ],
  });

  return response.data;
}
