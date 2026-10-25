import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { extractFromFile, makeNoteChunks } from '@/lib/documents';
import {
  addSources,
  clearAll,
  clearMessages,
  deleteSource,
  loadWorkspace,
  sendChat,
} from '@/lib/api';
import type { Message, Source } from '@/lib/types';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function App() {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [workspaceStatus, setWorkspaceStatus] = useState<Status>('loading');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const ws = await loadWorkspace();
        if (!active) return;
        setSources(ws.sources);
        setMessages(ws.messages);
        setWorkspaceStatus('ready');
      } catch (e) {
        if (!active) return;
        setWorkspaceStatus('error');
        setChatError(e instanceof Error ? e.message : 'Failed to load your workspace.');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      setUploadStatus('');
      try {
        for (const file of Array.from(files)) {
          setUploadStatus(`Reading ${file.name}...`);
          const chunks = await extractFromFile(file, (m) => setUploadStatus(m));
          if (chunks.length === 0) {
            setUploadStatus(`${file.name} had no selectable text.`);
            continue;
          }
          const saved = await addSources(
            chunks.map((c) => ({
              name: c.name,
              kind: c.kind,
              page: c.page,
              content: c.content,
            })),
          );
          setSources((prev) => [...prev, ...saved]);
          setUploadStatus(`Added ${saved.length} chunk${saved.length === 1 ? '' : 's'} from ${file.name}.`);
        }
      } catch (e) {
        setUploadStatus(e instanceof Error ? e.message : 'Upload failed.');
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const handleNote = useCallback(
    async (text: string, label: string) => {
      const chunks = makeNoteChunks(text, label);
      if (chunks.length === 0) return;
      setUploading(true);
      setUploadStatus('Saving note...');
      try {
        const saved = await addSources(
          chunks.map((c) => ({
            name: c.name,
            kind: c.kind,
            page: c.page,
            content: c.content,
          })),
        );
        setSources((prev) => [...prev, ...saved]);
        setUploadStatus('Note added.');
      } catch (e) {
        setUploadStatus(e instanceof Error ? e.message : 'Could not save note.');
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const handleDeleteSource = useCallback(async (id: string) => {
    try {
      await deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setUploadStatus(e instanceof Error ? e.message : 'Could not remove source.');
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    try {
      await clearAll();
      setSources([]);
      setMessages([]);
      setChatError(null);
      setUploadStatus('Workspace cleared.');
    } catch (e) {
      setUploadStatus(e instanceof Error ? e.message : 'Could not clear workspace.');
    }
  }, []);

  const handleClearMessages = useCallback(async () => {
    try {
      await clearMessages();
      setMessages([]);
      setChatError(null);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : 'Could not clear chat.');
    }
  }, []);

  const handleSend = useCallback(
    async (question: string) => {
      if (sources.length === 0) {
        setChatError('Upload a document or add a note first.');
        return;
      }
      setChatError(null);
      setChatLoading(true);
      const tempId = `temp-${Date.now()}`;
      const userMsg: Message = {
        id: tempId,
        role: 'user',
        content: question,
        citations: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const { answer, citations } = await sendChat(question);
        const assistantMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: answer,
          citations: citations.length > 0 ? citations : null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'The request failed.';
        setChatError(msg);
      } finally {
        setChatLoading(false);
      }
    },
    [sources.length],
  );

  if (workspaceStatus === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 animate-pulseDot rounded-full bg-brand-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-pulseDot rounded-full bg-brand-400 [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-pulseDot rounded-full bg-brand-400 [animation-delay:400ms]" />
          </span>
          <p className="text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-950 bg-radial-glow">
      <Sidebar
        sources={sources}
        uploading={uploading}
        uploadStatus={uploadStatus}
        onFiles={handleFiles}
        onNote={handleNote}
        onDelete={handleDeleteSource}
        onClearAll={handleClearAll}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatPanel
          messages={messages}
          loading={chatLoading}
          error={chatError}
          sourcesEmpty={sources.length === 0}
          onSend={handleSend}
          onClearMessages={handleClearMessages}
        />
      </main>
    </div>
  );
}
