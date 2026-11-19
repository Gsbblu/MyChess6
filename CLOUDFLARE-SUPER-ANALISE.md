# Super análise integrada com Cloudflare

## Estado atual — 19/11/2026

A integração foi preparada e publicada. O Worker já está implantado pela integração GitHub do Cloudflare Workers Builds e a configuração do GitHub Pages aponta para ele. Falta concluir o teste ponta a ponta pelo navegador.

- Repositório conectado: `Gsbblu/MyChess6`, branch `main`.
- Raiz do Worker dentro do repositório: `cloudflare/`.
- Worker: `mychess6-super-analysis`.
- URL pública: `https://mychess6-super-analysis.gsbblu.workers.dev`.
- Endpoint: `https://mychess6-super-analysis.gsbblu.workers.dev/analyze`.
- Modelo: `@cf/google/gemma-4-26b-a4b-it`, por meio da binding `AI`.
- Binding de controle de frequência: `SUPER_ANALYSIS_LIMITER`.
- O `wrangler.toml` define `ALLOWED_ORIGIN` para CORS e `ALLOWED_HOSTNAME` para a validação da resposta do Turnstile; ambos precisam permanecer configurados.
- Turnstile: widget criado para `gsbblu.github.io`; a secret key foi cadastrada no Worker com o nome `TURNSTILE_SECRET_KEY`.
- A configuração pública `super-analysis-config.js` contém o endpoint e a site key. A site key é pública; a secret key não deve ser colocada no repositório ou enviada em mensagens.
- A publicação do site após configurar o endpoint terminou com sucesso: <https://github.com/Gsbblu/MyChess6/actions/runs/44528929207>.

### Próximo passo

1. Recarregar <https://gsbblu.github.io/MyChess6/> com `Ctrl+Shift+R`.
2. Abrir uma partida já analisada e selecionar um lance.
3. Clicar em **Analisar aqui**, concluir o Turnstile e confirmar que a resposta aparece no painel.
4. Se falhar, registrar o status exibido e consultar **Workers & Pages → mychess6-super-analysis → Deployments/Observability**. Conferir também se o secret `TURNSTILE_SECRET_KEY` está configurado e se o build/deploy do Worker terminou com sucesso.

Não marcar a funcionalidade como validada antes desse teste. A secret key não deve ser pedida ao usuário nem exibida em logs, documentação pública ou mensagens. Se ela precisar ser trocada, o usuário deve cadastrar a nova diretamente nas configurações do Worker.

## Como a integração funciona

- O painel prepara um prompt usando FEN antes/depois do lance, SAN, classificação, avaliação e linhas do Stockfish.
- Nomes, resultado e relógios da partida são omitidos do prompt enviado à IA. O Worker/Turnstile processa dados técnicos como o IP para validar e limitar pedidos.
- O navegador carrega o widget Turnstile quando o usuário clica **Analisar aqui** e envia o token junto do prompt.
- O Worker permite a origem do GitHub Pages, valida o token pelo Siteverify, aplica limite aproximado de 3 pedidos por IP por minuto e rejeita prompts excessivamente longos.
- O resultado do modelo é exibido como texto simples no painel; HTML gerado não é interpretado.
- Se a análise integrada ainda não estiver configurada, o botão fica oculto e as opções de abrir o ChatGPT/copy prompt continuam disponíveis.

## Plano gratuito e limites

- Usar **Workers Free** e a cota gratuita do Workers AI. A cota documentada atualmente é 10 mil Neurons por dia por conta; é compartilhada com outros usos e pode mudar.
- Não ativar um plano pago para exceder a cota. O código não inicia uma cobrança; se o limite for atingido, a análise deve retornar uma falha até a cota renovar.
- Turnstile e o rate limiter reduzem abuso, mas a rota é pública e os limites de frequência são aproximados por localidade.
- As explicações da IA complementam as variantes e avaliações do Stockfish; elas não substituem a verificação das linhas nem garantem que a causa estratégica inferida seja correta.

## Recriar ou revisar a configuração

### Worker via Cloudflare Workers Builds

1. No Cloudflare, **Workers & Pages → Create application → GitHub** e conecte `Gsbblu/MyChess6`.
2. Use o nome `mychess6-super-analysis`, branch `main`, diretório raiz `cloudflare`, build command vazio e deploy command `npx wrangler deploy`. Mantenha as variáveis `ALLOWED_ORIGIN` e `ALLOWED_HOSTNAME` declaradas em `wrangler.toml`; a segunda é comparada com o hostname devolvido pelo Siteverify.
3. A configuração versionada em `cloudflare/wrangler.toml` declara a binding Workers AI, o modelo é escolhido em `cloudflare/worker.js`, e o deploy deve manter o endereço `workers.dev` habilitado.
4. Depois do primeiro deploy, configure o segredo em **Worker → Settings → Variables and Secrets → Add → Secret**:
   - Variable name: `TURNSTILE_SECRET_KEY`
   - Value: secret key do widget Turnstile
5. Salve e faça Deploy. Nunca grave esse valor em `wrangler.toml`, `super-analysis-config.js` ou no GitHub.

### Turnstile

O widget deve ser do tipo Managed e permitir o hostname `gsbblu.github.io`. O valor público da site key fica em `super-analysis-config.js`; a secret key fica somente no secret do Worker.

### Frontend

`super-analysis-config.js` deve conter somente configurações públicas:

```js
window.MYCHESS_SUPER_ANALYSIS = Object.freeze({
  endpoint: 'https://mychess6-super-analysis.gsbblu.workers.dev/analyze',
  turnstileSiteKey: 'SITE_KEY_PUBLICA'
});
```

Depois de alterar esse arquivo, publique no branch `main` para atualizar o GitHub Pages.
