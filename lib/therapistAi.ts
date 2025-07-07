import Constants from "expo-constants";

const OPENAI_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY

async function analyzeMood(transcript: string) {
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a calm, empathetic AI therapist named Sol. When given a journal entry, respond with a JSON object like this: { mood: '', intensity: 1-10, emotions: [], message: '' }",
        },
        {
          role: "user",
          content: `Here is my journal entry: "${transcript}"`,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log("GPT response:", data);

  const raw = data?.choices?.[0]?.message?.content;
  console.log("GPT raw content:",raw);
  try {
    const parsed = JSON.parse(raw);
    console.log("Parsed GPT respons:",parsed);
    return parsed;
  } catch (e) {
    console.warn("Failed to parse GPT response:", raw);
    return null;
  }
}
export { analyzeMood };

