import React, { useState } from 'react';
import { Task, Category } from '../../types';
import { playCelebration } from '../../utils/audio';

interface AiScheduleAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddTasks: (newTasks: Task[]) => void;
}

interface ExtractedTaskItem {
  title: string;
  category: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  dueDate: string;
  startTime: string | null;
  durationMinutes: number;
  description: string;
  isTodo?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  tasks?: ExtractedTaskItem[];
  timestamp: string;
}

const EXAMPLE_PROMPTS = [
  "I have Data Structures from 9 to 11 AM and Machine Learning at 2 PM",
  "Morning GATE revision from 8:30 to 10:30 AM, then DBMS Lab at 1:30 PM",
  "Operating Systems at 10 AM, Lunch break at 12 PM, Coding practice at 4 PM, and buy notebook",
];

export const AiScheduleAssistantModal: React.FC<AiScheduleAssistantModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddTasks,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: "안녕하세요! 화이팅! 🌸 Describe your classes, daily routine, or to-dos in natural language (e.g. 'I have Data Structures from 9 to 11 AM and Machine Learning at 2 PM'). I'll automatically parse your hours and organize your schedule!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_chat',
          prompt: promptText,
          context: {
            categories: categories.map(c => c.name),
            today: new Date().toISOString().split('T')[0],
          },
        }),
      });

      const data = await res.json();
      let replyText = "화이팅! 🌸 I organized your schedule.";
      let extracted: ExtractedTaskItem[] = [];

      if (data?.data?.reply) {
        replyText = data.data.reply;
        extracted = data.data.extractedTasks || [];
      } else if (data?.response?.reply) {
        replyText = data.response.reply;
        extracted = data.response.extractedTasks || [];
      } else if (data?.text) {
        replyText = data.text;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        tasks: extracted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "화이팅! I ran into a network hiccup, but you can retry or type directly into your schedule 🌷",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = (taskList: ExtractedTaskItem[], msgId: string) => {
    if (addedIds[msgId]) return;

    const today = new Date().toISOString().split('T')[0];
    const newTasks: Task[] = taskList.map((t, idx) => ({
      id: `task-ai-${Date.now()}-${idx}`,
      title: t.title,
      description: t.description || `Created via 화이팅 AI Assistant`,
      category: t.category || 'Study',
      priority: t.priority || 'P2',
      dueDate: t.dueDate || today,
      startTime: t.startTime || null,
      durationMinutes: t.durationMinutes || 60,
      subtasks: [],
      tags: ['AI-Scheduled'],
      recurring: 'none',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: t.startTime ? ['15m'] : [],
      comments: [],
      attachments: [],
      order: Date.now() + idx,
      quadrant: t.priority === 'P1' ? 'urgent-important' : 'not-urgent-important',
      isTodo: t.isTodo ?? (!t.startTime),
    }));

    onAddTasks(newTasks);
    playCelebration();
    setAddedIds(prev => ({ ...prev, [msgId]: true }));
  };

  const formatTaskTime = (t: ExtractedTaskItem) => {
    if (!t.startTime || t.isTodo) return '📝 To-Do Item';
    const [h, m] = t.startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + t.durationMinutes;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    return `⏰ ${t.startTime} – ${endStr} (${t.durationMinutes}m)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-linear-to-r from-pastel-pink/20 to-pastel-purple/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-stone-800 shadow-xs flex items-center justify-center text-xl">
              🌸
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                화이팅 AI Schedule Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pastel-purple/40 text-purple-800 dark:text-purple-300">
                  Gemini
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Natural-language daily timetable planner & to-do generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm break-words whitespace-normal leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-pastel-pink text-stone-800 rounded-tr-none font-medium shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200/50 dark:border-stone-700'
                }`}
              >
                {msg.text}
              </div>

              {/* Extracted Tasks Card */}
              {msg.tasks && msg.tasks.length > 0 && (
                <div className="mt-3 w-full max-w-[95%] bg-pastel-purple/15 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-3 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      📅 Extracted Schedule ({msg.tasks.length} item{msg.tasks.length > 1 ? 's' : ''})
                    </span>
                    <button
                      onClick={() => handleAddAll(msg.tasks!, msg.id)}
                      disabled={addedIds[msg.id]}
                      className={`text-xs font-semibold px-3 py-1 rounded-xl transition shadow-xs flex items-center gap-1 ${
                        addedIds[msg.id]
                          ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 cursor-default'
                          : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90'
                      }`}
                    >
                      {addedIds[msg.id] ? '✓ Added to Schedule' : '✨ Add All to Schedule'}
                    </button>
                  </div>

                  <div className="grid gap-2">
                    {msg.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-stone-800 rounded-xl p-2.5 border border-stone-200/70 dark:border-stone-700 flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 break-words whitespace-normal">
                              {task.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                              {task.category}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                            <span>{formatTaskTime(task)}</span>
                            <span>•</span>
                            <span className="capitalize">{task.priority} Priority</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 text-xs py-2">
              <span className="inline-block w-2 h-2 rounded-full bg-pastel-pink animate-ping" />
              <span>화이팅 AI is structuring your schedule...</span>
            </div>
          )}
        </div>

        {/* Example Chips */}
        <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap pl-1">Try:</span>
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(ex)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-pastel-pink hover:text-stone-900 whitespace-nowrap transition cursor-pointer"
            >
              {ex.slice(0, 36)}...
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. Data Structures 9 to 11 AM and Machine Learning at 2 PM..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-transparent focus:border-pastel-pink focus:bg-white dark:focus:bg-stone-900 outline-none text-sm text-stone-800 dark:text-stone-200 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-2.5 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Send</span>
              <span>✨</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
