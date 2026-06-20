
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
  resumeText,
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
${resumeText ? `
CANDIDATE'S RESUME CONTENT:
${resumeText}

IMPORTANT — STRICT QUESTION SPLIT:
Generate exactly ${questionCount} questions total, split as follows:
- Exactly ${Math.ceil(questionCount / 2)} questions must be GENERAL questions 
  for the ${role} role at ${experienceLevel} level — standard technical/behavioral 
  questions NOT related to the resume at all
- Exactly ${Math.floor(questionCount / 2)} questions must be RESUME-SPECIFIC — 
  directly referencing a project, skill, or experience mentioned in the resume above

Tag each question's source clearly in the JSON output using a new field 'source':
- 'source': 'general' for role-based questions
- 'source': 'resume' for resume-based questions

Resume-specific questions should:
- Reference the actual project/technology by name from the resume
- Ask about specific decisions, challenges, or depth of knowledge
- Not just ask "tell me about X project" — ask something that requires 
  real understanding, e.g. "Why did you choose X over Y in your project?"

Mix the order — do NOT put all resume questions first or all general questions 
first. Interleave them naturally.
` : ''}

Return ONLY valid JSON.

{
  "questions": [
    {
      "id": "1",
      "question": "...",
      "category": "Technical | Behavioral | System Design | DSA",
      "difficulty": "Easy | Medium | Hard",
      "hint": "...",
      "source": "general | resume"
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
    const questions = parsed.questions || [];

    return questions.map((q) => ({
      ...q,
      source: q.source || "general",
    }));
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

export async function generateHint({ question, role, experienceLevel, category }) {
  const prompt = `You are a senior technical interviewer giving a helpful 
hint to a candidate who is stuck.

Role: ${role} (${experienceLevel})
Question: ${question}
Category: ${category}

Generate ONE specific, useful hint that:
- Points toward the key concept or approach needed, without giving away 
  the full answer
- Is concrete, not vague — mention a specific term, technique, or angle 
  to think about
- Is 1-2 sentences max
- For technical questions: hint at the right data structure, algorithm 
  category, or technical concept to consider
- For system design questions: hint at one key constraint or component 
  to think about first
- For behavioral questions: hint at the structure to use (e.g. "think 
  about using the STAR method — what was the Situation and Task?")

BAD hint example: "Think about the basics of this topic."
GOOD hint example: "Think about time complexity — what happens if you 
use a hash map instead of nested loops here?"

Return this exact JSON only, no markdown:
{
  "hint": "your specific hint here"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      response_format: {
        type: "json_object",
      },
    });

    let text = response.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text).hint;
  } catch (error) {
    console.error("generateHint error:", error);
    throw error;
  }
}

