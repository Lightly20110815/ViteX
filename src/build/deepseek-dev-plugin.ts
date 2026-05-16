/**
 * Vite dev-server middleware that mirrors api/deepseek.ts so /api/deepseek works during `npm run dev`.
 * Only active in development. Production uses the Vercel Edge function at api/deepseek.ts.
 */
import type { Plugin } from 'vite';
import https from 'node:https';

export function deepseekDevPlugin(): Plugin {
  return {
    name: 'vitex-deepseek-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/deepseek', (req, res) => {
        const origin = (req.headers.origin as string | undefined) || '*';

        // CORS preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.end(JSON.stringify({ error: 'Missing DEEPSEEK_API_KEY in dev env' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          let parsed: Record<string, unknown>;
          try {
            parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }

          const stream = parsed.stream !== false;
          const payload = JSON.stringify({
            model: typeof parsed.model === 'string' ? parsed.model : 'deepseek-chat',
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
            stream,
            ...pickNumeric(parsed, [
              'temperature',
              'top_p',
              'frequency_penalty',
              'presence_penalty',
              'max_tokens',
            ]),
          });

          const upstream = https.request(
            {
              hostname: 'api.deepseek.com',
              path: '/chat/completions',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(payload),
              },
            },
            (upstreamRes) => {
              res.statusCode = upstreamRes.statusCode || 502;
              res.setHeader('Access-Control-Allow-Origin', origin);
              if (stream) {
                res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache, no-transform');
                res.setHeader('Connection', 'keep-alive');
              } else {
                res.setHeader(
                  'Content-Type',
                  upstreamRes.headers['content-type'] || 'application/json; charset=utf-8',
                );
              }
              upstreamRes.pipe(res);
            },
          );
          upstream.on('error', (err) => {
            console.error('[deepseek-dev] upstream error:', err);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.end(JSON.stringify({ error: 'Upstream error', message: err.message }));
          });
          upstream.write(payload);
          upstream.end();
        });
      });
    },
  };
}

function pickNumeric(src: Record<string, unknown>, keys: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keys) {
    const v = src[k];
    if (typeof v === 'number') out[k] = v;
  }
  return out;
}
