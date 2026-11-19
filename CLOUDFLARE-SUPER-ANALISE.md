# Super análise integrada com Cloudflare

O Worker usa Workers AI com a cota gratuita do plano Cloudflare Workers Free. A chave do modelo não fica no site. A página envia somente FEN, lance, avaliação e variantes do Stockfish; nomes, resultado e relógios da partida são omitidos. A Cloudflare também processa o IP para verificação Turnstile e controle de frequência.

## Configuração inicial

1. Crie uma conta Cloudflare e permaneça no plano **Workers Free**. Habilite Workers AI sem migrar para um plano pago.
2. Em Turnstile, crie um widget do tipo gerenciado para o hostname `gsbblu.github.io`. Guarde a **site key** e a **secret key**.
3. Instale Node.js e, na raiz deste repositório, execute:

   ```sh
   npx wrangler login
   npx wrangler deploy --config cloudflare/wrangler.toml
   npx wrangler secret put TURNSTILE_SECRET_KEY --config cloudflare/wrangler.toml
   ```

   Ao publicar, o Wrangler mostrará uma URL `https://mychess6-super-analysis.<sua-conta>.workers.dev`.

4. Edite `super-analysis-config.js` com a URL terminada em `/analyze` e a site key pública do Turnstile:

   ```js
   window.MYCHESS_SUPER_ANALYSIS = Object.freeze({
     endpoint: 'https://mychess6-super-analysis.<sua-conta>.workers.dev/analyze',
     turnstileSiteKey: 'SUA_SITE_KEY'
   });
   ```

5. Publique essa configuração no GitHub Pages. O botão **Analisar aqui** aparecerá nas posições com análise completa do Stockfish.

## Limites e proteção

- O modelo `@cf/google/gemma-4-26b-a4b-it` é executado pela binding privada `env.AI`; nenhum token de conta vai para o navegador.
- O Worker permite requisições de navegador com a origem do GitHub Pages, verifica o Turnstile e limita cada IP a 3 pedidos por minuto. A checagem de origem não é autenticação; a validação do Turnstile e o limite reduzem o abuso.
- A limitação por localização da Cloudflare é aproximada. O Turnstile reduz abuso, mas não transforma uma API pública em privada.
- A cota gratuita atual de Workers AI é de 10 mil Neurons por dia, compartilhada na conta, e reseta diariamente. Se acabar, o Worker retorna erro e não tenta habilitar cobrança nem migrar o plano.
- A resposta é exibida como texto simples dentro do painel, sem interpretar HTML gerado pelo modelo.

As cotas, os modelos e os termos do plano gratuito podem mudar. Nunca coloque a secret key do Turnstile, tokens Cloudflare ou outra credencial em `super-analysis-config.js`.
