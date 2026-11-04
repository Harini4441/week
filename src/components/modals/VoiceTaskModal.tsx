import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Check, Loader2, Calendar, Clock } from 'lucide-react';
import { Task, Category, Priority } from '../../types';

interface VoiceTaskModalProps {
  categories: Category[];
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'comments' | 'attachments' | 'order'>) => void;
}

export const VoiceTaskModal: React.FC<VoiceTaskModalProps> = ({
  categories,
  onClose,
  onCreateTask,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Parsed draft state
  const [parsedTask, setParsedTask] = useState<{
    title: string;
    category: string;
    priority: Priority;
    dueDate: string;
    startTime: string;
    durationMinutes: number;
    description: string;
    subtasks: string[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Web Speech API is not supported in this browser. You can still type your prompt below!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg('');
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript + ' ';
      }
      setTranscript(current.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access was denied. Please allow microphone permissions or type below.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorMsg('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  // Process voice/text through backend Gemini AI route
  const handleAnalyzeWithAi = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_voice_or_text',
          prompt: transcript,
        }),
      });

      const json = await res.json();
      const data = json.data || json.response;

      if (data && data.title) {
        setParsedTask({
          title: data.title || 'New Voice Task',
          category: data.category || 'Study',
          priority: data.priority || 'P2',
          dueDate: data.dueDate || new Date().toISOString().split('T')[0],
          startTime: data.startTime || '',
          durationMinutes: data.durationMinutes || 60,
          description: data.description || transcript,
          subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
        });
      } else {
        // Fallback parse
        setParsedTask({
          title: transcript,
          category: 'Study',
          priority: 'P2',
          dueDate: new Date().toISOString().split('T')[0],
          startTime: '18:00',
          durationMinutes: 60,
          description: `Voice input: "${transcript}"`,
          subtasks: ['Review lecture notes', 'Complete practice questions'],
        });
      }
    } catch (err: any) {
      console.error('AI parse error:', err);
      // Local fallback
      setParsedTask({
        title: transcript,
        category: 'Study',
        priority: 'P2',
        dueDate: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        durationMinutes: 60,
        description: `Voice input: "${transcript}"`,
        subtasks: ['Review lecture notes', 'Complete practice questions'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCreate = () => {
    if (!parsedTask) return;
    onCreateTask({
      title: parsedTask.title,
      description: parsedTask.description,
      category: parsedTask.category,
      priority: parsedTask.priority,
      dueDate: parsedTask.dueDate || null,
      startTime: parsedTask.startTime || null,
      durationMinutes: parsedTask.durationMinutes,
      subtasks: parsedTask.subtasks.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        text: st,
        completed: false,
      })),
      tags: ['VoiceCreated'],
      recurring: 'none',
      completed: false,
      reminders: parsedTask.startTime ? ['15m'] : [],
      quadrant: parsedTask.priority === 'P1' ? 'urgent-important' : 'not-urgent-important',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎤</span>
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Voice Task Creation & Speech-to-Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Microphone Button & Wave effect */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-18 h-18 rounded-3xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse scale-105'
                : 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8 opacity-80" />}
          </button>
          <span className="text-xs font-semibold text-[var(--color-text,#3D3548)]">
            {isListening ? 'Listening... Speak naturally 🌸' : 'Tap mic and speak (or type below)'}
          </span>
          <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] text-center max-w-xs">
            Example: "Tomorrow at 6 PM, study DBMS normalization for two hours and make it high priority."
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Transcript Area */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--color-muted,#7B6F8A)]">
            Spoken Transcript
          </label>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your voice or typed instruction will appear here..."
            className="w-full p-3 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
          />
        </div>

        {/* AI Parse Button */}
        {!parsedTask && (
          <button
            onClick={handleAnalyzeWithAi}
            disabled={!transcript.trim() || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] text-xs font-semibold hover:brightness-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI extracting dates, priority & subtasks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[var(--color-accent,#E78EA9)]" />
                <span>Parse to Task with 화이팅 AI</span>
              </>
            )}
          </button>
        )}

        {/* Parsed Confirmation Card */}
        {parsedTask && (
          <div className="p-4 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                Extracted Task Structure
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)]">
                {parsedTask.priority}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-[var(--color-text,#3D3548)] block">
                {parsedTask.title}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted,#7B6F8A)]">
                <span>Category: <strong>{parsedTask.category}</strong></span>
                <span>·</span>
                <span>Date: <strong>{parsedTask.dueDate}</strong></span>
                {parsedTask.startTime && (
                  <>
                    <span>·</span>
                    <span>Time: <strong>{parsedTask.startTime}</strong> ({parsedTask.durationMinutes}m)</span>
                  </>
                )}
              </div>
            </div>

            {parsedTask.subtasks.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-[var(--color-border,#F1E4DF)]">
                <span className="text-[11px] font-semibold text-[var(--color-muted,#7B6F8A)]">
                  Generated Subtasks:
                </span>
                <ul className="text-xs text-[var(--color-text,#3D3548)] space-y-0.5 list-disc list-inside">
                  {parsedTask.subtasks.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setParsedTask(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[var(--color-muted,#7B6F8A)] hover:underline"
              >
                Re-parse
              </button>
              <button
                onClick={handleConfirmCreate}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Add Task</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
