# Análise automática na nuvem

O workflow `.github/workflows/chesscom-cloud-analysis.yml` executa o MyChess6 a cada 15 minutos num navegador sem interface do GitHub Actions. O próprio app consulta o arquivo público do perfil, analisa partidas novas com o Stockfish local do projeto na profundidade equilibrada (16) e salva as avaliações em `cloud-data/games.json`. No primeiro ciclo, analisa somente a partida mais recente; os ciclos seguintes processam partidas novas desde a última marca salva. Ao abrir o site publicado, o MyChess importa as análises para sua biblioteca.

## Custo e visibilidade

No GitHub Free, execuções padrão do Actions são gratuitas e sem limite em repositórios públicos. GitHub Pages também está disponível gratuitamente para repositórios públicos. Para esse caminho continuar gratuito, o repositório precisa ser público. Isso torna público o código do MyChess6, os PGNs públicos processados e as análises geradas. O perfil Chess.com configurado no app também fica visível.

O workflow roda a cada 15 minutos, fora do início da hora, para reduzir atrasos. O GitHub pode atrasar execuções agendadas em períodos de alta demanda. A API do Chess.com também pode levar várias horas para atualizar seus arquivos públicos. Portanto, a análise pode não aparecer imediatamente após uma partida.

Workflows agendados em repositórios públicos podem ser desativados pelo GitHub após 60 dias sem atividade no repositório. Se isso ocorrer, reative o workflow na aba **Actions**.

## Ativar

1. Crie um repositório público novo no GitHub e envie os arquivos desta pasta MyChess6 para a branch `main`.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`.
3. Em **Actions**, habilite workflows para o repositório. O primeiro ciclo automático começa no próximo horário agendado; também é possível iniciar **Chess.com automatic analysis → Run workflow** manualmente.
4. Abra o endereço que aparece em **Settings → Pages**. Ao publicar uma nova análise, o workflow atualiza `cloud-data/games.json` e o site passa a carregá-la.

Não inclua tokens, senhas nem dados privados no repositório. A consulta ao Chess.com usa somente a API pública e não exige credenciais.
