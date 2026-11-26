# Contexto do projeto MyChess6

Use este arquivo para dar contexto a outro assistente ou continuar o trabalho em outra conta.

## Links

- Repositório público: <https://github.com/Gsbblu/MyChess6>
- Site publicado: <https://gsbblu.github.io/MyChess6/>
- Perfil Chess.com monitorado: <https://www.chess.com/member/Gab0bu>

## Estado de continuidade — 19/11/2026

O trabalho mais recente é integrar a **Super análise com IA** ao painel da partida para que a explicação apareça no MyChess, sem precisar sair para outro site. A integração foi publicada no GitHub e o Worker Cloudflare está implantado; falta confirmar o teste completo pelo navegador e corrigir qualquer erro que apareça.

- Worker Cloudflare: `https://mychess6-super-analysis.gsbblu.workers.dev`; endpoint usado pelo site: `/analyze`.
- Worker conectado ao GitHub pelo Cloudflare Workers Builds, repositório `Gsbblu/MyChess6`, branch `main`, diretório raiz `/cloudflare`, sem comando de build e comando de deploy `npx wrangler deploy`.
- A configuração do Worker mostra as bindings `AI` (Workers AI) e `SUPER_ANALYSIS_LIMITER`. O modelo é `@cf/google/gemma-4-26b-a4b-it`.
- Widget Turnstile criado com hostname `gsbblu.github.io`. A secret key foi adicionada pelo usuário no Worker como secret `TURNSTILE_SECRET_KEY`; ela não deve ser pedida, copiada para o repositório nem incluída em mensagens. A site key pública e o endpoint estão em `super-analysis-config.js`.
- GitHub Pages concluiu com sucesso o deploy do commit `9d8aba7` (execução: <https://github.com/Gsbblu/MyChess6/actions/runs/44528929207>).
- Próximo passo: pedir ao usuário para recarregar o site com `Ctrl+Shift+R`, abrir uma partida já analisada, selecionar um lance e clicar em **Analisar aqui**, concluir o Turnstile e relatar o resultado. Não afirmar que a integração funciona até esse teste passar.

### Atualização — APG

A interface local inclui a **APG (Análise de Partida Guiada)**: usa análises completas na profundidade 16 e envia a cronologia de todos os lances com avaliações/classificações. A IA gera uma visão geral e comentários individuais em ordem, breves para lances comuns e mais profundos nos momentos de impacto. O painel mostra a visão geral na posição inicial e apenas o comentário do lance selecionado nas outras posições; todos os lances podem ser abertos no tabuleiro e os momentos de impacto ficam destacados. A aba APG fica desabilitada até a conclusão. Há entrada APG nas partidas do arquivo Chess.com (quando a análise já está sincronizada na biblioteca), na biblioteca salva e no painel da partida analisada. O Worker diferencia o prompt APG e permite resposta mais longa. A versão do painel de APG foi publicada no commit `b1d6109`; esta atualização de exibição por lance ainda precisa ser publicada no `main`, aguardar o deploy do Worker/Pages e passar por teste no navegador; não marcar como validada antes disso.
- Se houver falha, registrar o texto exato do status no site e conferir **Workers & Pages → mychess6-super-analysis → Deployments/Observability**. Verificar também se o secret `TURNSTILE_SECRET_KEY` continua configurado e se o Workers Build não falhou.

### Funcionamento e limites da Super análise

- O botão aparece quando a posição tem resultados do Stockfish antes e depois do lance, fora de linhas hipotéticas e exercícios. Também permanecem as opções de abrir o ChatGPT e copiar o prompt.
- O navegador envia FEN, lance, classificação, avaliação e variantes do Stockfish ao Worker. O prompt enviado à IA não inclui nomes, resultado nem relógios da partida. Cloudflare/Turnstile processam dados técnicos, incluindo IP, para validação e controle de frequência.
- O Worker valida o Turnstile, aceita a origem do GitHub Pages, limita aproximadamente cada IP a 3 pedidos por minuto e limita o tamanho do prompt. A resposta é inserida como texto simples.
- A integração usa a cota gratuita atual do Workers AI (10 mil Neurons por dia compartilhados na conta). O código não ativa um plano pago; se a cota acabar, a análise deve falhar até a renovação. Cotas/modelos gratuitos podem mudar.
- Não colocar tokens ou secrets em `super-analysis-config.js`, no GitHub, em logs ou mensagens. A site key é pública; `TURNSTILE_SECRET_KEY` é privada.
- Arquivos principais: `cloudflare/worker.js`, `cloudflare/wrangler.toml`, `super-analysis-config.js`, `CLOUDFLARE-SUPER-ANALISE.md`, além da integração visual em `app.js`, `index.html` e `styles.css`.

## O que o projeto faz

O MyChess6 importa partidas públicas de xadrez padrão do perfil Gab0bu e gera análises com Stockfish na profundidade equilibrada (16). A análise automática roda no GitHub Actions, sem precisar deixar o site ou o laptop ligado. Os resultados são publicados em `cloud-data/index.json` e shards JSON de no máximo 5 MiB cada; quando o site é aberto, ele importa essas análises para a biblioteca IndexedDB daquele navegador. Assim, diferentes dispositivos podem receber a mesma biblioteca do repositório, embora cada navegador mantenha sua própria cópia local.

## Automação atual

- Workflow: `.github/workflows/chesscom-cloud-analysis.yml`.
- Agendamento: a cada 15 minutos, nos minutos 7, 22, 37 e 52 de cada hora.
- Processa lotes de até cinco partidas, publica o índice e os shards após cada lote e repete até concluir o retropreenchimento ou atingir o limite seguro de tempo; inicia outra execução automaticamente se ainda houver partidas. A interface sincroniza a nuvem a cada minuto e mostra o total publicado e o cursor.
- Busca arquivos mensais de 2026 em diante; partidas de anos anteriores ficam fora do retropreenchimento automático.
- Continua do arquivo mensal salvo em `cloud-data/index.json` até concluir o histórico elegível. Depois, revisita os meses recentes.
- Para iniciar manualmente: GitHub → **Actions** → **Chess.com automatic analysis** → **Run workflow**.
- Agendamentos do GitHub podem atrasar. Confira o estado do workflow e a execução mais recente antes de concluir que algo travou.

## Biblioteca e armazenamento

- A lista de análises salvas é ordenada pela data em que as partidas foram jogadas, mais recentes primeiro; se o PGN não tiver uma data válida, usa a data em que a análise foi salva.
- A cópia compartilhada fica em `cloud-data/index.json` e `cloud-data/shards/`, no repositório público. Cada shard tem limite interno de 5 MiB para evitar o bloqueio de 100 MB por arquivo do GitHub.
- O site importa os resultados para IndexedDB no navegador. Essa cópia local persiste entre visitas, mas pode ser removida ao limpar os dados do site; é possível importá-la novamente enquanto a cópia do GitHub estiver disponível.
- Código, PGNs públicos e análises no repositório são visíveis publicamente. Não adicionar tokens, senhas ou partidas privadas.

## Arquivos importantes

- `app.js`: importação da biblioteca, lista de partidas e análise pelo motor.
- `scripts/cloud_analyze.py`: execução headless com Playwright, seleção de arquivos e retropreenchimento.
- `.github/workflows/chesscom-cloud-analysis.yml`: cron e publicação automática dos resultados.
- `cloud-data/index.json` e `cloud-data/shards/`: análises compartilhadas e cursor do retropreenchimento.
- `README.md` e `CLOUD.md`: instruções e descrição da automação.

## Histórico técnico relevante

Uma falha anterior fez o script confundir a opção inicial “Busque um jogador” com um arquivo mensal; ele então esperava até o timeout sem iniciar análise alguma. O seletor foi corrigido para aceitar somente URLs mensais válidas da API do Chess.com. Não remova essa validação. Com a correção, uma execução manual concluiu com sucesso; o lote seguinte salvou cinco análises.

## Resumo para colar em outra conversa

> Estou continuando o projeto MyChess6. O repositório público é <https://github.com/Gsbblu/MyChess6> e o site é <https://gsbblu.github.io/MyChess6/>. Antes de alterar algo, leia `CONTEXTO-PROJETO.md`, `CLOUDFLARE-SUPER-ANALISE.md` e confira o estado atual de GitHub Actions e Cloudflare Workers Builds. A tarefa em andamento é verificar a Super análise com IA diretamente na tela: Worker `https://mychess6-super-analysis.gsbblu.workers.dev/analyze`, modelo Workers AI Gemma 4, widget Turnstile e cota gratuita; a configuração está publicada, mas a validação ponta a ponta pelo usuário ainda está pendente. Não peça nem exponha a secret `TURNSTILE_SECRET_KEY`. O sistema também analisa automaticamente partidas públicas de xadrez padrão do Chess.com para Gab0bu com Stockfish em profundidade 16. O cron roda a cada 15 minutos; cada execução repete lotes de até cinco partidas, publica o índice `cloud-data/index.json` e shards JSON de até 5 MiB, e inicia outra execução se ainda houver partidas, respeitando o limite seguro de tempo. A sincronização da biblioteca ocorre a cada minuto. A busca automática é limitada a arquivos de 2026 em diante; os dados públicos são importados para IndexedDB em cada navegador.
