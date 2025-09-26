export type AskResponse = {
  sql: string;
  columns: string[];
  data: Record<string, unknown>[];
  explanation: string;
  chart: 'bar' | 'line' | 'pie' | 'scatter' | 'table';
};

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function askQuestion(question: string, baseUrl = DEFAULT_BASE_URL): Promise<AskResponse> {
  const res = await fetch(`${baseUrl}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}
