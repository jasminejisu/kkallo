import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { workout, duration, intensity } = await req.json();

  if (!workout || !duration || !intensity) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
    });
  }

  const client = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: token,
  });

  const userContent = [
    {
      type: "text",
      text: `
You are a fitness expert with more than 10 years of experience in the industry.
Calculate the estimated calories burned for a user doing this workout:
Workout: ${workout}
Duration: ${duration} minutes
Intensity: ${intensity} (low, medium, high)
Return ONLY a number (calories), rounded to nearest integer.

JSON format MUST be exactly like this:
{
    "workout": text,
      "workoutType": text,
      "calorieBurn": number,
      "duration": number,
      "intensity": text,
      `,
    },
  ];
}

try {
  const response = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 50,
  });

  let calories = parseInt(
    response.choices[0].message.content.replace(/\D/g, ""),
    10,
  );

  if (isNaN(calories)) calories = Math.round(duration * 5); // fallback

  return new Response(JSON.stringify({ estimatedCalories: calories }));
} catch (err) {
  console.error(err);
  return new Response(JSON.stringify({ error: err.message }), {
    status: 500,
  });
}
