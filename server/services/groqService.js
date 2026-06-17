
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

/**
 * Safely extract JSON from model response
 */
function parseJsonResponse(text) {
  try {
    // Remove markdown code fences if present
    text = text.replace(/```json|```/gi, "").trim();

    // Extract JSON object if extra text exists
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      text = text.slice(start, end + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("JSON Parse Error:");
    console.error("Raw Response:", text);
    throw new Error("Failed to parse AI response");
  }
}

export async function generateQuestions({
  role,
  experienceLevel,
  jobDescription,
  questionCount = 5,
}) {
  const prompt = `
You are a senior technical interviewer specializing in ${role} roles.

Generate exactly ${questionCount} interview questions for a ${role}
position at ${experienceLevel} level.

RULES:
- Every question must be relevant to the role.
- Include 1 behavioral question.
- Avoid generic HR questions.
- Match difficulty to experience level.
${jobDescription ? `- Prioritize topics from: ${jobDescription}` : ""}

Return ONLY valid JSON.

{
  "questions": [
    {
      "id": "1",
      "question": "Explain React Virtual DOM.",
      "category": "Technical",
      "difficulty": "Medium",
      "hint": "Think about how React avoids direct DOM manipulation."
    }
  ]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 1000,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0].message.content;

    console.log("Question Generation Response:");
    console.log(text);

    const parsed = parseJsonResponse(text);

    return parsed.questions || [];
  } catch (error) {
    console.error("generateQuestions error:", error);
    throw error;
  }
}

export async function evaluateAnswer({
  question,
  answer,
  role,
  experienceLevel,
}) {
  const meaningfulAnswer =
    answer &&
    answer.trim().length > 15 &&
    answer.trim() !== "..." &&
    /[a-zA-Z]/.test(answer);

  if (!meaningfulAnswer) {
    return {
      score: 0,
      strengths: [],
      improvements: [
        "No meaningful answer was provided.",
        "Please attempt to answer the question even if unsure.",
        "A partial answer is better than no answer.",
      ],
      idealAnswerHints:
        "A strong answer should explain the concept clearly with examples.",
      followUpQuestion: null,
    };
  }

  const prompt = `
You are a strict but fair senior interviewer.

Role: ${role}
Experience: ${experienceLevel}

Question:
${question}

Candidate Answer:
${answer}

Scoring:
0-2 = Completely incorrect
3-4 = Weak understanding
5-6 = Partial understanding
7-8 = Good answer
9-10 = Excellent answer

Return ONLY valid JSON.

{
  "score": 0,
  "strengths": [],
  "improvements": [],
  "idealAnswerHints": "",
  "followUpQuestion": ""
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1000,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0].message.content;

    console.log("Evaluation Response:");
    console.log(text);

    return parseJsonResponse(text);
  } catch (error) {
    console.error("evaluateAnswer error:", error);

    return {
      score: 0,
      strengths: [],
      improvements: ["Failed to evaluate answer."],
      idealAnswerHints: "Evaluation service unavailable.",
      followUpQuestion: null,
    };
  }
}

