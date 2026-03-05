import OpenAI from "openai";

const token = process.env.OPENAI_API_KEY;

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const description = formData.get("description") || "";
  const date = formData.get("date");
  const userId = formData.get("userId");

  if (!userId || !date) {
    return Response.json({ error: "Missing userId or date" }, { status: 400 });
  }

  let base64Image;
  if (file) {
    const bytes = await file.arrayBuffer();
    base64Image = Buffer.from(bytes).toString("base64");
  }

  const client = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: token,
  });

  const userContent = [
    {
      type: "text",
      text: `
You are a nutrition expert with over 10 years of experience. Analyze the meal provided via image, description, or both, and calculate nutrition.

Instructions:
1. Identify the meal as a **single item summary** (e.g., "Chicken Rice", "Beef Burger with Fries").
2. Estimate portion size if an image is provided.
3. Calculate estimated calories (kcal), protein (grams), carbohydrates (grams), and fat (grams) for the entire meal.
4. Return **ONLY valid JSON**, do not list individual ingredients or provide any explanation.

JSON format MUST be exactly like this:
{
  "summary": "meal description",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }

Input:
${description ? `Description: ${description}` : "No description provided."}
${base64Image ? "An image of the meal is provided." : "No image provided."}

Rules:
- Always use numeric values for calories, protein, carbs, and fat.
- Do not include fractions as strings (e.g., "0.5") — round to nearest integer.
- Do not add totals, only per-food items.
`,
    },
  ];

  if (base64Image) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${file.type};base64,${base64Image}`,
      },
    });
  }

  const messages = [{ role: "user", content: userContent }];

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 1000,
      top_p: 1,
    });

    const output = response.choices[0].message.content;
    const cleaned = output
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (jsonErr) {
      console.error("Failed to parse AI output:", cleaned, jsonErr);
      return Response.json(
        { error: "AI returned invalid JSON", raw: cleaned },
        { status: 500 },
      );
    }
    const mealRow = {
      userId,
      eatenDate: date,
      summary: result.summary,
      calories: Math.round(result.calories),
      protein: Math.round(result.protein),
      carbs: Math.round(result.carbs),
      fat: Math.round(result.fat),
    };

    return Response.json(mealRow);
  } catch (err) {
    console.error("analyzeMeal error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
