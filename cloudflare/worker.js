const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const MAX_PROMPT_LENGTH = 12_000;

function json(body, status, origin) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    vary: 'Origin'
  };
  if (origin) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'POST, OPTIONS';
    headers['access-control-allow-headers'] = 'Content-Type';
    headers['access-control-max-age'] = '86400';
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

async function validTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: false, reason: 'missing-secret' };
  if (!token || token.length > 2_048) return { ok: false, reason: 'invalid-token' };
  const form = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token
  });
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) form.set('remoteip', clientIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });
  if (!response.ok) return { ok: false, reason: 'siteverify-http-error' };
  const result = await response.json();
  if (result.success !== true) {
    return { ok: false, reason: 'siteverify-rejected', codes: result['error-codes'] || [] };
  }
  if (result.hostname !== env.ALLOWED_HOSTNAME) {
    return { ok: false, reason: 'hostname-mismatch', hostname: result.hostname || '' };
  }
  if (result.action !== 'mychess-super-analysis') {
    return { ok: false, reason: 'action-mismatch', action: result.action || '' };
  }
  return { ok: true };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (origin !== env.ALLOWED_ORIGIN) return json({ error: 'Origem não autorizada.' }, 403);
    if (request.method === 'OPTIONS') return json({}, 204, origin);

    const url = new URL(request.url);
    if (url.pathname !== '/analyze' || request.method !== 'POST') {
      return json({ error: 'Rota não encontrada.' }, 404, origin);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.SUPER_ANALYSIS_LIMITER.limit({ key: ip });
    if (!success) return json({ error: 'Limite temporário de pedidos atingido.' }, 429, origin);

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_PROMPT_LENGTH + 3_000) return json({ error: 'Pedido muito longo.' }, 413, origin);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > MAX_PROMPT_LENGTH + 3_000) return json({ error: 'Pedido muito longo.' }, 413, origin);
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'Pedido inválido.' }, 400, origin);
    }

    if (typeof body.prompt !== 'string' || body.prompt.length < 1 || body.prompt.length > MAX_PROMPT_LENGTH) {
      return json({ error: 'Dados de análise inválidos.' }, 400, origin);
    }

    try {
      const verification = await validTurnstile(body.turnstileToken, request, env);
      if (!verification.ok) {
        // These fields are safe to log; never log the token, secret, prompt, or client IP.
        console.warn('Turnstile verification failed', {
          reason: verification.reason,
          codes: verification.codes,
          hostname: verification.hostname,
          action: verification.action
        });
        if (verification.reason === 'missing-secret') {
          return json({ error: 'O secret do Turnstile não está disponível na versão ativa do Worker. Publique uma nova versão após salvar a configuração.' }, 503, origin);
        }
        return json({ error: 'A verificação de segurança expirou ou não foi aprovada.' }, 403, origin);
      }
    } catch {
      return json({ error: 'A verificação de segurança está indisponível.' }, 503, origin);
    }

    try {
      const result = await env.AI.run(MODEL, {
        messages: [
          {
            role: 'system',
            content: 'Você é um treinador de xadrez. Explique em português e com rigor. Trate as avaliações e variantes do Stockfish como evidência principal. Confira a legalidade e a sequência das variantes antes de afirmar uma tática. Não invente ameaças, peças ou planos. Separe fatos demonstrados de hipóteses e diga explicitamente quando a variante não prova a causa. Seja didático, direto e conciso.'
          },
          { role: 'user', content: body.prompt }
        ],
        chat_template_kwargs: { enable_thinking: false },
        max_tokens: 700,
        temperature: 0.2
      });
      const answer = typeof result?.response === 'string' ? result.response.trim() : '';
      if (!answer) return json({ error: 'O modelo não retornou uma resposta.' }, 503, origin);
      return json({ answer }, 200, origin);
    } catch {
      return json({ error: 'O modelo está indisponível ou a cota gratuita foi atingida.' }, 503, origin);
    }
  }
};
