# Contexto do projeto MyChess6

Use este arquivo para dar contexto a outro assistente ou continuar o trabalho em outra conta.

## Links

- Repositório público: <https://github.com/Gsbblu/MyChess6>
- Site publicado: <https://gsbblu.github.io/MyChess6/>
- Perfil Chess.com monitorado: <https://www.chess.com/member/Gab0bu>

## O que o projeto faz

O MyChess6 importa partidas públicas de xadrez padrão do perfil Gab0bu e gera análises com Stockfish na profundidade equilibrada (16). A análise automática roda no GitHub Actions, sem precisar deixar o site ou o laptop ligado. Os resultados são publicados em `cloud-data/games.json`; quando o site é aberto, ele importa essas análises para a biblioteca IndexedDB daquele navegador. Assim, diferentes dispositivos podem receber a mesma biblioteca do repositório, embora cada navegador mantenha sua própria cópia local.

## Automação atual

- Workflow: `.github/workflows/chesscom-cloud-analysis.yml`.
- Agendamento: a cada 15 minutos, nos minutos 7, 22, 37 e 52 de cada hora.
- Processa até cinco partidas sem análise por execução.
- Busca arquivos mensais de 2026 em diante; partidas de anos anteriores ficam fora do retropreenchimento automático.
- Continua do arquivo mensal salvo em `cloud-data/games.json` até concluir o histórico elegível. Depois, revisita os meses recentes.
- Para iniciar manualmente: GitHub → **Actions** → **Chess.com automatic analysis** → **Run workflow**.
- Agendamentos do GitHub podem atrasar. Confira o estado do workflow e a execução mais recente antes de concluir que algo travou.

## Biblioteca e armazenamento

- A lista de análises salvas é ordenada pela data em que as partidas foram jogadas, mais recentes primeiro; se o PGN não tiver uma data válida, usa a data em que a análise foi salva.
- A cópia compartilhada fica em `cloud-data/games.json`, no repositório público. Ela não ocupa o armazenamento local do laptop durante o processamento.
- O site importa os resultados para IndexedDB no navegador. Essa cópia local persiste entre visitas, mas pode ser removida ao limpar os dados do site; é possível importá-la novamente enquanto a cópia do GitHub estiver disponível.
- Código, PGNs públicos e análises no repositório são visíveis publicamente. Não adicionar tokens, senhas ou partidas privadas.

## Arquivos importantes

- `app.js`: importação da biblioteca, lista de partidas e análise pelo motor.
- `scripts/cloud_analyze.py`: execução headless com Playwright, seleção de arquivos e retropreenchimento.
- `.github/workflows/chesscom-cloud-analysis.yml`: cron e publicação automática dos resultados.
- `cloud-data/games.json`: análises compartilhadas e cursor do retropreenchimento.
- `README.md` e `CLOUD.md`: instruções e descrição da automação.

## Histórico técnico relevante

Uma falha anterior fez o script confundir a opção inicial “Busque um jogador” com um arquivo mensal; ele então esperava até o timeout sem iniciar análise alguma. O seletor foi corrigido para aceitar somente URLs mensais válidas da API do Chess.com. Não remova essa validação. Com a correção, uma execução manual concluiu com sucesso; o lote seguinte salvou cinco análises.

## Resumo para colar em outra conversa

> Estou continuando o projeto MyChess6. O repositório público é <https://github.com/Gsbblu/MyChess6> e o site é <https://gsbblu.github.io/MyChess6/>. Antes de alterar algo, leia `CONTEXTO-PROJETO.md` e confira o estado atual do GitHub Actions. O sistema analisa automaticamente partidas públicas de xadrez padrão do Chess.com para Gab0bu com Stockfish em profundidade 16. O cron roda a cada 15 minutos, analisa até cinco partidas por ciclo e está limitado a arquivos de 2026 em diante. Os resultados são publicados em `cloud-data/games.json` e importados pelo site para IndexedDB de cada navegador. A biblioteca do site deve mostrar as partidas jogadas mais recentemente no topo.
