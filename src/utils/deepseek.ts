/**
 * Client wrapper for /api/deepseek (Vercel Edge in prod, Vite dev plugin in dev).
 * Streams DeepSeek chat completions and emits text deltas via the onDelta callback.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface DeepSeekStreamOpts {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  signal?: AbortSignal;
  onDelta?: (delta: string, full: string) => void;
}

const ENDPOINT = '/api/deepseek';

export async function streamDeepSeek(opts: DeepSeekStreamOpts): Promise<string> {
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model ?? 'deepseek-chat',
      temperature: opts.temperature ?? 1.0,
      stream: true,
      messages: opts.messages,
      max_tokens: opts.max_tokens,
    }),
    signal: opts.signal,
  });

  if (!resp.ok || !resp.body) {
    throw new Error(`DeepSeek HTTP ${resp.status}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let full = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data) continue;
      if (data === '[DONE]') return full;
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          full += delta;
          opts.onDelta?.(delta, full);
        }
      } catch {
        /* ignore SSE parse hiccups */
      }
    }
  }
  return full;
}

export async function chatDeepSeek(opts: Omit<DeepSeekStreamOpts, 'onDelta'>): Promise<string> {
  return streamDeepSeek(opts);
}
