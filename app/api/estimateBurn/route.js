import OpenAI from "openai";

const token = process.env.OPENAI_API_KEY;

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
Return ONLY valid JSON, no explanation.

JSON format MUST be exactly like this:
{
  "workout": "workout name",
  "workoutType": "cardio/strength/flexibility etc",
  "calorieBurn": number,
  "duration": number,
  "intensity": "low/medium/high"
}

Rules:
- Always use numeric values for calorieBurn and duration.
- Round calorieBurn to nearest integer.
- Do not add any explanation outside the JSON.
      `,
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: userContent }],
      temperature: 0.2,
      max_tokens: 50,
    });

    const output = response.choices[0].message.content;
    const cleaned = output // ✅ same cleaning as analyzeMeal
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned); // ✅ parse JSON like analyzeMeal
    } catch (jsonErr) {
      console.error("Failed to parse AI output:", cleaned, jsonErr);
      return Response.json(
        { error: "AI returned invalid JSON", raw: cleaned },
        { status: 500 },
      );
    }

    return Response.json({
      // ✅ return structured data
      workout: result.workout,
      workoutType: result.workoutType,
      calorieBurn: Math.round(result.calorieBurn),
      duration: result.duration,
      intensity: result.intensity,
    });
  } catch (err) {
    console.error("estimateBurn error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
