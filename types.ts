export type SourceKind = 'pdf' | 'txt' | 'note';

export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  page: number | null;
  content: string;
  created_at: string;
}

export interface Citation {
  id: string;
  name: string;
  page: number | null;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  citations: Citation[] | null;
  created_at: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export interface WorkspaceState {
  sources: Source[];
  messages: Message[];
}
