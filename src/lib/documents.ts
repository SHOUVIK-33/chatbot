import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
import type { SourceKind } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface ExtractedChunk {
  name: string;
  kind: SourceKind;
  page: number | null;
  content: string;
}

const MAX_CHUNK = 3000;
const MAX_CONTENT = 100000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function splitText(text: string): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n+/);
  let current = '';

  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = '';
      }
      for (let i = 0; i < paragraph.length; i += MAX_CHUNK) {
        chunks.push(paragraph.slice(i, i + MAX_CHUNK));
      }
      continue;
    }
    if ((current + '\n' + paragraph).length > MAX_CHUNK) {
      if (current.trim()) chunks.push(current.trim());
      current = paragraph;
    } else {
      current += '\n' + paragraph;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function readPdf(file: File, onProgress?: (msg: string) => void): Promise<ExtractedChunk[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const chunks: ExtractedChunk[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ');

    if (text.trim()) {
      chunks.push({
        name: file.name,
        kind: 'pdf',
        page: pageNumber,
        content: text.slice(0, MAX_CONTENT),
      });
    }
    onProgress?.(`Reading ${file.name} — page ${pageNumber} of ${pdf.numPages}`);
  }
  return chunks;
}

async function readTxt(file: File): Promise<ExtractedChunk[]> {
  const text = await file.text();
  return splitText(text).map((content) => ({
    name: file.name,
    kind: 'txt',
    page: null,
    content,
  }));
}

export async function extractFromFile(
  file: File,
  onProgress?: (msg: string) => void,
): Promise<ExtractedChunk[]> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large. Maximum size is 5 MB.`);
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return readPdf(file, onProgress);
  if (ext === 'txt') return readTxt(file);
  throw new Error(`Unsupported file type: ${file.name}`);
}

export function makeNoteChunks(text: string, label: string): ExtractedChunk[] {
  return splitText(text).map((content) => ({
    name: label,
    kind: 'note',
    page: null,
    content,
  }));
}
