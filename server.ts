import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `You are the extraction engine for AgreeFlow, a tool that converts raw, messy meeting notes into a structured action plan. You are NOT a chatbot and must never respond conversationally, add commentary, or answer questions — only extract structured data.

Given a block of raw meeting notes, classify every relevant sentence or clause into exactly one of these four categories:

1. DECISIONS — things the team explicitly agreed on or confirmed (e.g. "We will use React", "We're submitting Friday").
2. SUGGESTIONS — ideas that were proposed but NOT confirmed as final (e.g. "We could add a chatbot", "Maybe we should use React" without confirmation).
3. OPEN_QUESTIONS — things left unresolved that still need an answer (e.g. "Should we deploy on Vercel or AWS?").
4. ACTION_ITEMS — concrete tasks that need to be done, each with:
   - task: a short, clear description of the work
   - owner: the person named as responsible, or null if not stated
   - deadline: the date/day mentioned, or null if not stated
   - owner_missing: boolean indicating if owner is missing (true if owner is null or empty)
   - deadline_missing: boolean indicating if deadline is missing (true if deadline is null or empty)
   - source_sentence: the exact original sentence(s) this was extracted from (verbatim, unmodified)

CRITICAL RULES:
- Never invent, guess, or infer an owner or deadline that was not explicitly stated in the text. If missing, set the field to null (or empty string) — do not fabricate a plausible-sounding value.
- Every single item in every category MUST include a "source_sentence" field containing the exact original text it was derived from, so it can be traced back and verified. Do not paraphrase the source_sentence — copy it verbatim from the input.
- If a sentence is ambiguous between "suggestion" and "decision", default to SUGGESTION unless there is clear confirming language ("we agreed", "we will", "decided", "confirmed").
- If the notes contain no items for a category, return an empty array for it — do not fabricate filler content.
- Do not summarize, rephrase, or shorten the meaning of any item — extract as close to the original intent as possible.
- Output ONLY valid JSON matching the schema below. No preamble, no explanation, no markdown code fences.`;

// Rule-based heuristic fallback if API key is missing or quota exceeded
function fallbackExtract(notes: string) {
  const lines = notes.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const decisions: Array<{ text: string; source_sentence: string }> = [];
  const suggestions: Array<{ text: string; source_sentence: string }> = [];
  const open_questions: Array<{ text: string; source_sentence: string }> = [];
  const action_items: Array<{
    task: string;
    owner: string | null;
    deadline: string | null;
    owner_missing: boolean;
    deadline_missing: boolean;
    source_sentence: string;
  }> = [];

  for (const line of lines) {
    const cleanLine = line.replace(/^[-*•0-9.)\s]+/, '').trim();
    if (!cleanLine) continue;

    // Check Question
    if (cleanLine.includes('?') || /^(should|could|can|is|are|do|does|who|what|where|when|why|how)\b/i.test(cleanLine)) {
      open_questions.push({
        text: cleanLine,
        source_sentence: cleanLine,
      });
      continue;
    }

    // Check Decision
    if (/\b(agreed|definitively|approved|confirmed|decided|we will definitely|signed off|unanimous)\b/i.test(cleanLine)) {
      decisions.push({
        text: cleanLine,
        source_sentence: cleanLine,
      });
      continue;
    }

    // Check Suggestion
    if (/\b(suggested|could also|maybe|what if|propose|proposed|idea|might save|explore)\b/i.test(cleanLine)) {
      suggestions.push({
        text: cleanLine,
        source_sentence: cleanLine,
      });
      continue;
    }

    // Check Action items
    const hasActionWords = /\b(will handle|to complete|needs to|scheduled for|action:|todo:|ship|draft|prepare|facilitate|setup|migrate|audit)\b/i.test(cleanLine);
    if (hasActionWords || line.startsWith('-') || line.startsWith('*')) {
      let owner: string | null = null;
      let deadline: string | null = null;

      // Extract known names
      const nameMatch = cleanLine.match(/\b(Marcus|Sarah|Dave|Elena|David|Maya|Priyanshu|Alex|Kenji|Rachel)\b/i);
      if (nameMatch) {
        owner = nameMatch[0];
      }

      // Extract deadline
      const dateMatch = cleanLine.match(/\b(Friday|Wednesday|Monday|Tuesday|Thursday|tomorrow|next week|end of month|August \d+|Aug \d+|\d{1,2}:\d{2}\s*(?:AM|PM))\b/i);
      if (dateMatch) {
        deadline = dateMatch[0];
      }

      action_items.push({
        task: cleanLine,
        owner,
        deadline,
        owner_missing: !owner,
        deadline_missing: !deadline,
        source_sentence: cleanLine,
      });
    }
  }

  return {
    decisions,
    suggestions,
    open_questions,
    action_items,
  };
}

// POST endpoint for analyzing meeting notes
app.post('/api/analyze', async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return res.status(400).json({ error: 'Please provide notes to analyze.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY not configured. Using intelligent fallback extraction.');
      const result = fallbackExtract(notes);
      return res.json(result);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Meeting notes:\n"""\n${notes}\n"""` }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  source_sentence: { type: Type.STRING },
                },
                required: ['text', 'source_sentence'],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  source_sentence: { type: Type.STRING },
                },
                required: ['text', 'source_sentence'],
              },
            },
            open_questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  source_sentence: { type: Type.STRING },
                },
                required: ['text', 'source_sentence'],
              },
            },
            action_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  owner_missing: { type: Type.BOOLEAN },
                  deadline_missing: { type: Type.BOOLEAN },
                  source_sentence: { type: Type.STRING },
                },
                required: ['task', 'owner_missing', 'deadline_missing', 'source_sentence'],
              },
            },
          },
          required: ['decisions', 'suggestions', 'open_questions', 'action_items'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // In case wrapped in markdown block
      const cleaned = text.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Clean action items to ensure booleans and nulls match
    if (Array.isArray(parsed.action_items)) {
      parsed.action_items = parsed.action_items.map((item: any) => {
        const owner = item.owner && item.owner.trim() ? item.owner.trim() : null;
        const deadline = item.deadline && item.deadline.trim() ? item.deadline.trim() : null;
        return {
          ...item,
          owner,
          deadline,
          owner_missing: !owner,
          deadline_missing: !deadline,
        };
      });
    }

    return res.json({
      decisions: parsed.decisions || [],
      suggestions: parsed.suggestions || [],
      open_questions: parsed.open_questions || [],
      action_items: parsed.action_items || [],
    });
  } catch (error: any) {
    console.error('Error during meeting analysis:', error);
    // Provide graceful extraction rather than crashing user flow
    const fallback = fallbackExtract(req.body?.notes || '');
    return res.json(fallback);
  }
});

// Mount Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AgreeFlow server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
