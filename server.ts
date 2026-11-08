import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Assistant Endpoint
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { action, prompt, context } = req.body;

    if (!prompt && action !== 'free_time_advice' && action !== 'weekly_summary') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!ai) {
      // High-quality local rule-based fallback when GEMINI_API_KEY is not configured
      return res.json({
        success: true,
        isFallback: true,
        response: generateFallbackResponse(action, prompt, context),
      });
    }

    let systemInstruction = `You are 화이팅 (Hwaiting) AI, an ultra-thoughtful, highly encouraging, and intelligent Korean-inspired productivity mentor ("Your little steps, your big dreams 🌷").
You help students, developers, and professionals organize tasks, manage schedules, calculate free time, plan GATE/college preparation, and avoid burnout.
Always maintain an inspiring, calm, and pastel-aesthetic tone. Be structured, concise, and deeply practical.`;

    let userMessage = prompt;

    if (action === 'parse_voice_or_text') {
      systemInstruction += ` You are parsing a natural language task description (from voice or text) into a structured JSON task object.
Output STRICTLY valid JSON with no markdown tags or code fences around the JSON if possible, matching this schema:
{
  "title": string,
  "category": "Study" | "College" | "Coding" | "GATE Preparation" | "Assignments" | "Personal" | "Health" | "Entertainment" | "Self-care" | "Reading" | "Career" | "Goals",
  "priority": "P1" | "P2" | "P3" | "P4",
  "dueDate": "YYYY-MM-DD" or null,
  "startTime": "HH:MM" or null,
  "durationMinutes": number,
  "description": string,
  "subtasks": string[]
}`;
      userMessage = `Parse this voice/text into a task: "${prompt}". Reference context current date: ${new Date().toISOString().split('T')[0]}.`;
    } else if (action === 'breakdown_task') {
      systemInstruction += ` You are breaking a large, intimidating goal or task into 4 to 6 manageable, bite-sized subtasks with duration estimates.
Return a structured JSON with:
{
  "summary": string,
  "subtasks": [
    { "title": string, "durationMinutes": number, "priority": "P1" | "P2" | "P3" | "P4" }
  ],
  "encouragement": string
}`;
      userMessage = `Break down this task into actionable steps: "${prompt}". Existing context: ${JSON.stringify(context || {})}`;
    } else if (action === 'free_time_advice') {
      systemInstruction += ` Analyze the user's current scheduled commitments vs free time today and provide realistic recommendations on how to spend their remaining free hours without feeling overwhelmed. Keep it warm, motivating, and organized.`;
      userMessage = `Here is my current schedule breakdown: ${JSON.stringify(context || {})}. Prompt: ${prompt || 'Analyze my schedule and suggest how to optimize my free time'}.`;
    } else if (action === 'study_planner') {
      systemInstruction += ` Create a balanced, realistic study timetable for the user's topic (e.g. GATE preparation, College exams, DBMS, ML, etc.). Balance deep work with necessary rest and free time.`;
      userMessage = `Create a timetable for: "${prompt}". User's context: ${JSON.stringify(context || {})}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        ...(action === 'parse_voice_or_text' || action === 'breakdown_task'
          ? { responseMimeType: 'application/json' }
          : {}),
      },
    });

    const text = response.text || '';
    let parsedJson = null;
    if (action === 'parse_voice_or_text' || action === 'breakdown_task') {
      try {
        const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      } catch (err) {
        console.warn('Failed to parse AI JSON, returning text:', err);
      }
    }

    return res.json({
      success: true,
      text,
      data: parsedJson,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Provide fallback gracefully on API error
    const { action, prompt, context } = req.body;
    return res.json({
      success: true,
      isFallback: true,
      response: generateFallbackResponse(action, prompt, context),
      note: 'Processed via offline AI engine',
    });
  }
});

// Fallback logic when no Gemini API key is configured or offline
function generateFallbackResponse(action: string, prompt: string = '', context: any = {}) {
  const today = new Date().toISOString().split('T')[0];
  const pLower = (prompt || '').toLowerCase();

  if (action === 'parse_voice_or_text') {
    let category = 'Study';
    if (pLower.includes('gate') || pLower.includes('exam')) category = 'GATE Preparation';
    else if (pLower.includes('code') || pLower.includes('react') || pLower.includes('debug') || pLower.includes('api')) category = 'Coding';
    else if (pLower.includes('college') || pLower.includes('lecture') || pLower.includes('professor')) category = 'College';
    else if (pLower.includes('assign') || pLower.includes('homework') || pLower.includes('lab')) category = 'Assignments';
    else if (pLower.includes('run') || pLower.includes('gym') || pLower.includes('walk') || pLower.includes('water')) category = 'Health';
    else if (pLower.includes('self-care') || pLower.includes('relax') || pLower.includes('meditat') || pLower.includes('tea')) category = 'Self-care';
    else if (pLower.includes('game') || pLower.includes('movie') || pLower.includes('watch')) category = 'Entertainment';

    let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';
    if (pLower.includes('urgent') || pLower.includes('critical') || pLower.includes('asap')) priority = 'P1';
    else if (pLower.includes('important') || pLower.includes('high')) priority = 'P2';

    let durationMinutes = 60;
    if (pLower.includes('2 hour') || pLower.includes('two hour')) durationMinutes = 120;
    else if (pLower.includes('30 min') || pLower.includes('half hour')) durationMinutes = 30;
    else if (pLower.includes('3 hour') || pLower.includes('three hour')) durationMinutes = 180;

    let startTime = '18:00';
    const timeMatch = prompt.match(/(\d{1,2})\s*(?:pm|am|:00)/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      if (prompt.toLowerCase().includes('pm') && h < 12) h += 12;
      startTime = `${h.toString().padStart(2, '0')}:00`;
    }

    return {
      title: prompt.replace(/tomorrow at \d+ (?:pm|am)|study |for \d+ hours?/gi, '').trim() || 'New Focus Task',
      category,
      priority,
      dueDate: today,
      startTime,
      durationMinutes,
      description: `Created via 화이팅 Voice/Text Assistant: "${prompt}"`,
      subtasks: ['Review core concepts & notes', 'Practice hands-on exercises', 'Review progress & summarize takeaways'],
    };
  }

  if (action === 'breakdown_task') {
    return {
      summary: `Action plan for: "${prompt}" 🌸`,
      subtasks: [
        { title: `Clarify requirements & gather reference notes for ${prompt}`, durationMinutes: 25, priority: 'P2' },
        { title: `Core deep-work phase 1: First draft & key components`, durationMinutes: 50, priority: 'P1' },
        { title: `Core deep-work phase 2: Edge cases, problem sets & testing`, durationMinutes: 45, priority: 'P2' },
        { title: `Final polish, proofreading & self-care reset`, durationMinutes: 20, priority: 'P3' },
      ],
      encouragement: '화이팅! You do not have to finish everything in one giant sprint. Small steps make big miracles 🌷',
    };
  }

  return {
    advice: `🌸 화이팅 Schedule Insight: You have plenty of potential today! Prioritize 1-2 key tasks during your peak energy hours, and safeguard at least 1.5 hours of true resting free time to recharge. You've got this! ✨`,
  };
}

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const p = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(p)) return p;
  }
  // In production (Cloud Run), honor process.env.PORT. In development, always bind to 3000.
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }
  return 3000;
}

function getHost(): string {
  if (process.env.HOST) return process.env.HOST;
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback to transform and serve index.html for client-side routing
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite?.ssrFixStacktrace) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`🌸 화이팅 (Hwaiting!) server running at http://${HOST}:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
