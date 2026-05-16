// api/deepseek.ts — Vercel Edge Function proxy for DeepSeek chat completions.
// Mirrors the pattern used in vitepress-theme-curve. The browser calls /api/deepseek
// with an OpenAI-compatible payload; this function adds the DEEPSEEK_API_KEY server-side.

export const config = { runtime: 'edge' };

const ALLOWED_ORIGINS = ['https://vite-x.vercel.app'];

interface EdgeRequest {
  method: string;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}

function getAllowOrigin(req: EdgeRequest): string {
  const origin = req.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.startsWith('http://localhost')) return origin;
  if (origin.endsWith('.vercel.app')) return origin;
  return ALLOWED_ORIGINS[0];
}

function json(data: unknown, status = 200, origin = ALLOWED_ORIGINS[0]): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
    },
  });
}

interface UpstreamPayload {
  model: string;
  messages: unknown[];
  stream: boolean;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}

export default async function handler(req: EdgeRequest): Promise<Response> {
  const allowOrigin = getAllowOrigin(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405, allowOrigin);
  }

  const apiKey = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json({ error: 'Missing DEEPSEEK_API_KEY' }, 500, allowOrigin);
  }

  let body: Record<string, unknown>;
  try {
    body = ((await req.json()) as Record<string, unknown>) ?? {};
  } catch {
    return json({ error: 'Invalid JSON' }, 400, allowOrigin);
  }

  const payload: UpstreamPayload = {
    model: typeof body.model === 'string' ? body.model : 'deepseek-chat',
    messages: Array.isArray(body.messages) ? body.messages : [],
    stream: body.stream !== false,
  };
  if (typeof body.temperature === 'number') payload.temperature = body.temperature;
  if (typeof body.top_p === 'number') payload.top_p = body.top_p as number;
  if (typeof body.frequency_penalty === 'number') payload.frequency_penalty = body.frequency_penalty as number;
  if (typeof body.presence_penalty === 'number') payload.presence_penalty = body.presence_penalty as number;
  if (typeof body.max_tokens === 'number') payload.max_tokens = body.max_tokens as number;

  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    return new Response(text || 'Upstream error', {
      status: upstream.status,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Content-Type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8',
      },
    });
  }

  if (payload.stream) {
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': allowOrigin,
      },
    });
  }
  const text = await upstream.text();
  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': allowOrigin,
    },
  });
}
