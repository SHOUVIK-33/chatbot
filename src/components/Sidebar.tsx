import { useState } from 'react';
import { FileText, FileType, NotebookPen, Trash2, X } from 'lucide-react';
import type { Source } from '../lib/types';

interface Props {
  sources: Source[];
  uploading: boolean;
  uploadStatus: string;
  onFiles: (files: FileList) => void;
  onNote: (text: string, label: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const kindIcon: Record<Source['kind'], typeof FileText> = {
  pdf: FileType,
  txt: FileText,
  note: NotebookPen,
};

export function Sidebar({
  sources,
  uploading,
  uploadStatus,
  onFiles,
  onNote,
  onDelete,
  onClearAll,
  collapsed,
  onToggle,
}: Props) {
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);

  const handleAddNote = () => {
    const text = noteText.trim();
    if (!text) return;
    onNote(text, `Note ${sources.filter((s) => s.kind === 'note').length + 1}`);
    setNoteText('');
    setShowNote(false);
  };

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-30 rounded-lg border border-ink-700 bg-ink-850/80 p-2 text-slate-300 backdrop-blur transition hover:bg-ink-800 hover:text-white"
        aria-label="Show sources"
      >
        <FileText className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/80 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold leading-tight text-white">
              Source Chat
            </h2>
            <p className="text-[11px] text-slate-500">Grounded AI research</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="rounded-md p-1 text-slate-500 transition hover:bg-ink-800 hover:text-slate-200"
          aria-label="Collapse sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5">
        <label className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-600 bg-ink-850/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand-500/60 hover:bg-ink-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 transition group-hover:bg-brand-500/25">
            <FileText className="h-4 w-4" />
          </span>
          <span>Upload PDF or TXT</span>
          <input
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) onFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>

        <button
          onClick={() => setShowNote((v) => !v)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-850/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-ink-800 hover:text-white"
        >
          <NotebookPen className="h-4 w-4 text-accent-400" />
          {showNote ? 'Hide note field' : 'Add a text note'}
        </button>

        {showNote && (
          <div className="mt-3 animate-fadeIn rounded-xl border border-ink-700 bg-ink-850/60 p-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Paste your notes here..."
              className="scrollbar-thin min-h-[90px] w-full resize-y rounded-lg border border-ink-700 bg-ink-950/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-brand-500/70"
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="mt-2 w-full rounded-lg bg-accent-500/90 px-3 py-2 text-sm font-semibold text-ink-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add note as source
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between px-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Sources ({sources.length})
        </h3>
        {sources.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium text-slate-500 transition hover:text-error-400"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {sources.length === 0 ? (
          <div className="mt-10 px-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-800">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">
              No sources yet. Upload a document or add a note to begin.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {sources.map((s) => {
              const Icon = kindIcon[s.kind] || FileText;
              return (
                <li
                  key={s.id}
                  className="group flex items-start gap-2.5 rounded-lg border border-ink-700/40 bg-ink-850/40 px-3 py-2.5 transition hover:border-ink-600 hover:bg-ink-800"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-500/12 text-brand-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{s.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {s.kind.toUpperCase()}
                      {s.page ? ` · page ${s.page}` : ''}
                      {` · ${Math.max(1, Math.round(s.content.length / 1000))}k chars`}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove source"
                  >
                    <Trash2 className="h-4 w-4 text-slate-600 hover:text-error-400" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(uploading || uploadStatus) && (
        <div className="border-t border-ink-700/60 px-5 py-3 text-[11px] text-slate-400">
          {uploading && (
            <span className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-400 [animation-delay:200ms]" />
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-400 [animation-delay:400ms]" />
              </span>
              {uploadStatus || 'Working...'}
            </span>
          )}
          {!uploading && uploadStatus && <span>{uploadStatus}</span>}
        </div>
      )}
    </aside>
  );
}
