import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, User, AlertCircle, RefreshCw, Quote } from 'lucide-react';
import type { Message, Citation } from '../lib/types';

interface Props {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sourcesEmpty: boolean;
  onSend: (question: string) => void;
  onClearMessages: () => void;
}

function Citations({ items }: { items: Citation[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3 border-t border-ink-700/50 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Quote className="h-3 w-3" /> Cited sources
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-500/30 bg-brand-500/10 px-2 py-1 text-[11px] font-medium text-brand-200"
          >
            <span className="rounded bg-brand-500/30 px-1 text-[10px] font-bold text-brand-100">
              {c.id}
            </span>
            <span className="max-w-[180px] truncate text-slate-300">{c.name}</span>
            {c.page && <span className="text-slate-500">· p.{c.page}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-400 [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-400 [animation-delay:400ms]" />
    </span>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex animate-fadeIn gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? 'bg-ink-700 text-slate-300'
            : 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-tr-sm bg-ink-750 text-slate-100'
            : 'rounded-tl-sm border border-ink-700/60 bg-ink-850/80 text-slate-200'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {!isUser && message.citations && message.citations.length > 0 && (
          <Citations items={message.citations} />
        )}
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  loading,
  error,
  sourcesEmpty,
  onSend,
  onClearMessages,
}: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    onSend(q);
    setInput('');
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-ink-700/60 px-6 py-4">
        <div>
          <h1 className="font-display text-lg font-semibold text-white">
            Chat with your sources
          </h1>
          <p className="text-xs text-slate-500">
            Answers are grounded in the documents and notes you upload.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClearMessages}
            className="flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-ink-800 hover:text-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {empty && !loading && (
            <div className="mx-auto mt-16 max-w-md text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 ring-1 ring-brand-500/30">
                <Sparkles className="h-7 w-7 text-brand-300" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-white">
                What would you like to learn?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {sourcesEmpty
                  ? 'Upload a PDF or TXT file, or add a note, then ask your first question.'
                  : 'Ask a question about your sources below.'}
              </p>
              {!sourcesEmpty && (
                <div className="mt-6 grid gap-2 text-left">
                  {['Summarize the key points', 'What are the main findings?', 'List the important terms'].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="rounded-lg border border-ink-700 bg-ink-850/40 px-4 py-2.5 text-sm text-slate-300 transition hover:border-brand-500/50 hover:bg-brand-500/5 hover:text-white"
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {loading && (
            <div className="flex animate-fadeIn gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm border border-ink-700/60 bg-ink-850/80 px-4 py-3.5">
                <TypingDots />
                <span className="text-sm text-slate-400">Searching sources and generating an answer...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex animate-fadeIn items-start gap-2.5 rounded-xl border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-ink-700/60 bg-ink-900/60 px-6 py-4 backdrop-blur">
        <form onSubmit={submit} className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              placeholder={
                sourcesEmpty
                  ? 'Add a source first, then ask a question...'
                  : 'Ask a question about your sources...'
              }
              className="w-full rounded-xl border border-ink-700 bg-ink-850/70 px-4 py-3 pr-12 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-brand-500/70"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600">
              {input.length}/2000
            </span>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-glow transition hover:from-brand-400 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-600">
          Answers cite retrieved passages. The AI won't invent facts outside your sources.
        </p>
      </div>
    </div>
  );
}
