import { supabase, CHAT_FUNCTION_URL } from './supabase';
import type { ChatResponse, Source, Message, WorkspaceState } from './types';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export async function loadWorkspace(): Promise<WorkspaceState> {
  const [srcRes, msgRes] = await Promise.all([
    supabase.from('sources').select('*').order('created_at', { ascending: true }),
    supabase.from('messages').select('*').order('created_at', { ascending: true }),
  ]);
  if (srcRes.error) throw new Error(srcRes.error.message);
  if (msgRes.error) throw new Error(msgRes.error.message);
  return {
    sources: (srcRes.data || []) as Source[],
    messages: (msgRes.data || []) as Message[],
  };
}

export async function addSources(
  rows: { name: string; kind: 'pdf' | 'txt' | 'note'; page: number | null; content: string }[],
): Promise<Source[]> {
  if (rows.length === 0) return [];
  const { data, error } = await supabase.from('sources').insert(rows).select('*');
  if (error) throw new Error(error.message);
  return (data || []) as Source[];
}

export async function deleteSource(id: string): Promise<void> {
  const { error } = await supabase.from('sources').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function sendChat(question: string): Promise<ChatResponse> {
  const res = await fetch(CHAT_FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && typeof data.error === 'string' && data.error) ||
      `The request failed (${res.status}).`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (typeof data.answer !== 'string') {
    throw new Error('The server returned an unexpected response.');
  }
  return {
    answer: data.answer,
    citations: Array.isArray(data.citations) ? data.citations : [],
  };
}

export async function clearAll(): Promise<void> {
  const { error: mErr } = await supabase
    .from('messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (mErr) throw new Error(mErr.message);
  const { error: sErr } = await supabase
    .from('sources')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (sErr) throw new Error(sErr.message);
}

export async function clearMessages(): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(error.message);
}
