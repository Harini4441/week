import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, BookOpen, Clock, Check, Plus } from 'lucide-react';
import { Task, UserScheduleConfig } from '../../types';

interface AIAssistantModalProps {
  tasks: Task[];
  scheduleConfig: UserScheduleConfig;
  onClose: () => void;
  onAddGeneratedTask: (taskTitle: string, category: string, durationMinutes: number) => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  suggestedTasks?: { title: string; category: string; duration: number }[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  tasks,
  scheduleConfig,
  onClose,
  onAddGeneratedTask,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `안녕하세요! 🌸 I am your **화이팅 AI Productivity Mentor** ("Your little steps, your big dreams 🌷").\n\nHow can I help you today? I can help you plan your GATE prep, break down an overwhelming college project, or find the best free time slot in your schedule!`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    { label: 'Plan GATE Prep for this week', action: 'study_planner', prompt: 'Plan my GATE computer science preparation schedule for this week, balancing deep work with rest.' },
    { label: 'Find free time tomorrow', action: 'free_time_advice', prompt: 'Find the best 2 to 3 hour uninterrupted free time blocks tomorrow based on my current commitments.' },
    { label: 'Breakdown ML Assignment', action: 'breakdown_task', prompt: 'Break my Machine Learning Assignment into 4 bite-sized, manageable subtasks.' },
    { label: 'Analyze schedule balance', action: 'free_time_advice', prompt: 'Analyze my schedule this week. Am I studying enough and keeping healthy margins of free time?' },
  ];

  const handleSendMessage = async (promptToSend?: string, actionType?: string) => {
    const textToSend = promptToSend || inputText;
    if (!textToSend.trim() || isLoading) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMsgs);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType || 'study_planner',
          prompt: textToSend,
          context: {
            taskCount: tasks.length,
            wakeTime: scheduleConfig.wakeTime,
            sleepTime: scheduleConfig.sleepTime,
            sampleTasks: tasks.slice(0, 5).map((t) => ({
              title: t.title,
              category: t.category,
              due: t.dueDate,
              startTime: t.startTime,
              duration: t.durationMinutes,
            })),
          },
        }),
      });

      const json = await res.json();
      let aiText = json.text;
      let suggestions: { title: string; category: string; duration: number }[] = [];

      if (json.data && json.data.subtasks) {
        aiText = `${json.data.summary || 'Here is your structured action plan:'}\n\n${json.data.subtasks
          .map((st: any) => `• **${st.title}** (${st.durationMinutes || 30} mins)`)
          .join('\n')}\n\n${json.data.encouragement || '화이팅! You can do it 🌷'}`;

        suggestions = json.data.subtasks.map((st: any) => ({
          title: st.title,
          category: 'GATE Preparation',
          duration: st.durationMinutes || 45,
        }));
      } else if (json.isFallback && json.response?.advice) {
        aiText = json.response.advice;
      } else if (!aiText) {
        aiText = `🌸 화이팅! Based on your schedule, I suggest carving out 2 focused hours between 10:00 AM and 12:00 PM for deep study, followed by a mindful tea break. Small steps build giant breakthroughs! 🌷`;
      }

      setMessages([...newMsgs, { sender: 'ai', text: aiText, suggestedTasks: suggestions }]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: `🌸 화이팅! Remember to protect your morning hours for deep work like GATE or programming problem sets. Take deep breaths—you have enough time! 🌷`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl h-[620px] max-h-[90vh] rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary,#F8C8DC)] flex items-center justify-center text-sm shadow-2xs">
              🌸
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--color-text,#3D3548)]">
                화이팅 AI Productivity Assistant
              </h3>
              <span className="text-[10px] text-[var(--color-muted,#7B6F8A)]">
                Powered by Gemini 3.8 · Schedule Optimizer & Study Planner
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] font-medium shadow-2xs rounded-br-xs'
                    : 'bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] shadow-2xs rounded-bl-xs'
                }`}
              >
                {m.text}

                {/* Suggested Action Buttons if present */}
                {m.suggestedTasks && m.suggestedTasks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[var(--color-border,#F1E4DF)] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                      Quick Add to Your Tasks:
                    </span>
                    {m.suggestedTasks.map((st, i) => (
                      <button
                        key={i}
                        onClick={() => onAddGeneratedTask(st.title, st.category, st.duration)}
                        className="w-full text-left p-1.5 rounded-xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] text-[11px] font-medium text-[var(--color-text,#3D3548)] flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{st.title}</span>
                        <Plus className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)] shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-muted,#7B6F8A)] max-w-xs border border-[var(--color-border,#F1E4DF)]">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent,#E78EA9)]" />
              <span>화이팅 AI is crafting your plan...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)] flex items-center gap-1.5 overflow-x-auto text-xs">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp.prompt, qp.action)}
              className="px-2.5 py-1 rounded-full bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] text-[11px] text-[var(--color-text,#3D3548)] whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about your schedule, study plan, or free time..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            className="flex-1 px-4 py-2 text-xs rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-[var(--color-text,#3D3548)] focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
