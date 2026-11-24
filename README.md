# Gabe's Chess — revisão guiada de xadrez

> Gabe's Chess é um app pessoal de revisão de partidas, com explicações táticas verificáveis e reprodução passo a passo das respostas do Stockfish.

Site gratuito de análise de xadrez, desenvolvido progressivamente.

## Etapa atual

O site inclui interface responsiva, tabuleiro interativo com peças vetoriais próprias, importação/navegação PGN, Stockfish local para análise individual e de partidas, e cache em memória limitado a 256 posições. O arraste usa eventos de ponteiro, portanto funciona com mouse e toque. Resultados são reutilizados quando FEN, profundidade e versão do motor coincidem; o cache desaparece ao recarregar a página. Análises de partida calculam cada posição em sequência na profundidade escolhida (10 rápida, 16 equilibrada ou 22 profunda), indicam quantas posições foram reaproveitadas e permitem cancelar com segurança.

A **Biblioteca de partidas** está personalizada para o perfil público Chess.com **Gab0bu**: ao abrir o app, carrega automaticamente os arquivos mensais desse perfil e permite filtrar partidas por ritmo e iniciar uma análise no tabuleiro. O nome está fixado nesta cópia pessoal; isso não faz login no Chess.com nem permite acessar partidas privadas. Ao concluir uma análise, Gabe's Chess guarda PGN, profundidade, avaliações e classificações no IndexedDB deste navegador; os registros podem ser excluídos ou exportados/importados como cópia JSON. A consulta à API é pública e somente de leitura (nesta cópia ela acontece sozinha ao abrir o app, ou seja, o navegador contata api.chess.com a cada abertura); limites temporários e atrasos dependem do Chess.com.

Gabe's Chess pode analisar partidas na nuvem sem manter esta página aberta. O workflow em `.github/workflows/chesscom-cloud-analysis.yml` abre o app num navegador sem interface no GitHub Actions a cada 15 minutos, encontra partidas sem análise nos arquivos públicos de 2026 em diante e processa lotes de até cinco, na profundidade equilibrada (16). Ao terminar cada lote, verifica se o arquivo ainda tem partidas pendentes e inicia o próximo automaticamente. Os resultados são publicados em `cloud-data/index.json` e shards JSON de no máximo 5 MiB cada, evitando o limite de 100 MB por arquivo do GitHub; a biblioteca aberta sincroniza novos resultados a cada minuto, mostrando o total publicado e o cursor do retropreenchimento. O processo continua pelos arquivos mensais até concluir ou atingir o limite seguro de tempo; se ainda houver partidas, outra execução é iniciada automaticamente. A automação depende da visibilidade pública do perfil e dos atrasos de atualização da API do Chess.com; veja `CLOUD.md` antes de publicar.

A **Super análise com IA** está integrada ao painel da partida pelo Cloudflare Workers AI. Ela usa as variantes do Stockfish e mostra a resposta no próprio Gabe's Chess; o código do Worker fica em `cloudflare/worker.js` e a configuração do estado atual está em `CONTEXTO-PROJETO.md` e `CLOUDFLARE-SUPER-ANALISE.md`. A implantação está feita e o teste ponta a ponta no navegador ainda está pendente; não afirmar que funciona até confirmá-lo.

A aba **Visão geral** é um diagnóstico, não só um resumo de contagens. Ela lê as análises salvas (módulo puro `insights.js`, testado em `tests/test_insights.js`) e mostra: **precisão estimada** com tendência (últimas 5 partidas contra as 5 anteriores) e gráfico por partida; resultados; **"O que treinar primeiro"**, até quatro prioridades ordenadas pelo impacto estimado, cada uma com *o que foi medido*, *sugestão de treino* (conselho geral, separado da medição), confiança conforme o tamanho da amostra e botões que abrem a partida direto no lance de exemplo; **pontos fortes**; desempenho por fase; qualidade dos lances; cores e aberturas; gestão de tempo; os lances que mais custaram e as partidas para rever. Filtros por período (pela data da partida, ou pela do salvamento se faltar) e por ritmo (bullet, blitz, rápidas, correspondência, deduzido de `TimeControl`).

Como cada número é obtido:

- **Precisão**: fórmula aberta do Lichess (curva exponencial sobre a perda de chance) aplicada à perda de pontos esperados do app; nota da partida = média entre a aritmética e a harmônica dos lances. É uma estimativa, não a nota de nenhum site.
- **Padrões de erro**: usam o tema que o treinador gravou em cada imprecisão, erro ou erro grave. "Preferência posicional" significa que nenhuma causa tática foi demonstrada e é apresentada como hipótese. Registros antigos sem lição ficam em "sem causa registrada" e nunca viram prioridade.
- **Tempo**: lido dos comentários `[%clk]` do PGN (Chess.com); só aparece com relógio em pelo menos 3 partidas. "Pouco tempo" = 12% do tempo base (mínimo 10 s). Derrota por tempo vem do cabeçalho `Termination`.
- **Aberturas**: nome lido de `Opening`, `ECOUrl` ou `ECO` e agrupado por família; não há base de teoria.
- **Vantagem desperdiçada**: a chance esperada do jogador passou de 80% e a partida não terminou em vitória.
- **Amostra mínima**: tema com 3 lances, fase com 15 lances em 3 partidas, abertura com 3 partidas, cor com 5 partidas cada, vantagem com 2 casos. Abaixo disso a seção diz que faltam dados em vez de afirmar algo. A ordem das prioridades é uma heurística e itens podem se sobrepor.
- Com partidas do perfil configurado, só as jogadas dele entram e partidas de terceiros são contadas à parte; sem nenhuma partida do perfil, os dois lados entram e cores, aberturas e vantagens ficam ocultas.

A biblioteca do MyChess 5 é separada da do MyChess 4: para trazer o histórico, exporte a biblioteca no MyChess 4 e importe o arquivo JSON no MyChess 5.

Após solicitar a análise da partida, o gráfico interativo mostra a avaliação do Stockfish em cada posição (vantagem branca acima da linha central, preta abaixo, escala limitada a cinco peões) e colore cada ponto pela qualidade do lance. Selecione um ponto para navegar diretamente à posição depois daquele lance no tabuleiro. O gráfico também mostra os resultados já calculados se a análise for cancelada.

Acima do gráfico, o **Resumo da partida** mostra a contagem de cada classificação por cor/jogador, uma avaliação separada para abertura, meio-jogo e final estimado, padrões táticos que merecem revisão, temas posicionais observados em lances bem avaliados e até três lances que mais custaram pontos esperados, com links para abri-los no tabuleiro. A abertura considera os primeiros dez lances completos; o final é estimado quando não há damas e restam no máximo seis peças além dos peões e reis. Sem uma base de teoria, o site não inventa o nome da abertura nem marca lances de livro. Os padrões a rever são agrupados pelo tema que o treinador demonstrou (ver "Como o treinador explica um lance"); lances sem causa demonstrada aparecem como preferência posicional, sem motivo atribuído; não há nota proprietária de estratégia/precisão equivalente à do Chess.com. Durante uma análise interrompida, o resumo é marcado como parcial. A avaliação final do motor não substitui o resultado registrado no PGN.

O resumo também oferece uma **revisão guiada**: até três momentos críticos (de qualquer um dos lados) mais, quando existe, um "lance para repetir". Cada cartão traz uma pergunta de estudo, o tema do lance e um botão que revela o que a análise encontrou, com o hábito a levar. **Resolver no tabuleiro** abre a posição **antes** do lance, esconde classificação e avaliação, e aceita um palpite feito no tabuleiro (que não altera a partida). Ao revelar, o painel compara o palpite com o lance jogado e com o Stockfish; se o palpite estiver entre as linhas calculadas (MultiPV), informa a avaliação dele, e se não estiver diz que não há avaliação direta, sem chamá-lo de ruim.

O exercício guiado permite tentar o lance antes de revelar a revisão; depois da revelação, lances classificados como imprecisão, erro ou erro grave oferecem **Reproduzir punição passo a passo**. Cada clique aplica um meio-lance legal da linha principal do Stockfish na variação, com a partida original preservada para retorno. A linha representa a continuação calculada pelo motor, não a única resposta possível.

Para cada lance, o relatório compara a melhor avaliação da posição anterior com a posição após o lance e converte essa diferença em pontos esperados com uma curva local ajustada ao rating do jogador. O rating é lido dos campos `WhiteElo` e `BlackElo` do PGN; se faltarem, começa em 1200 e pode ser editado. Os cortes aproximam os usados publicamente pela Chess.com para perda de pontos esperados, mas o modelo completo deles não é público e não é reproduzido aqui. Os nomes são **Melhor**, **Excelente**, **Bom**, **Imprecisão**, **Erro** e **Erro grave**; uma oportunidade clara de vitória perdida pode receber **Chance perdida**. A revisão de partida compara três variantes para detectar possíveis **Grandes lances** quando a primeira linha é claramente superior às seguintes. Uma heurística limitada marca **Brilhante** quando há um sacrifício material visível na resposta principal do Stockfish, quase sem perda estimada e sem a posição já estar ganha. As classificações não foram alteradas. As explicações individuais priorizam um motivo por vez e só descrevem ataques e capturas confirmados por lances legais. O treinador é programático e local: não usa um LLM para escolher a classificação nem para inventar a causa. A comparação material é apresentada apenas quando as linhas e profundidades são comparáveis; saldo material, avaliação do motor e perda de chances são tratados separadamente. Quando não há evidência suficiente para explicar a preferência do motor, o texto declara essa incerteza. O cálculo com três variantes pode levar mais tempo que a análise de uma única linha. Isso não equivale ao sistema completo de revisão da Chess.com e não tenta inferir intenção do jogador.

## Como o treinador explica um lance

A explicação vive em `coach.js`, um módulo puro (sem DOM) que recebe as duas análises do Stockfish (posição antes e depois do lance) e devolve uma lição estruturada. Cada afirmação cai em uma de três categorias, mostradas separadas no painel:

- **Fatos calculados**, cada um com a origem indicada: *Regras do xadrez* (lances legais aplicados à posição, incluindo a troca de capturas e recapturas numa casa, com cravadas respeitadas), *Variante do motor* (linha do Stockfish reaplicada lance a lance com validação de legalidade) ou *Avaliação do motor*. Exemplos: mate permitido ou perdido, peça deixada em risco de captura, ameaça do adversário que o lance não tratou, saldo material de uma variante, ataque duplo confirmado pela variante, ranking entre as três linhas calculadas.
- **Indícios posicionais (heurísticas, não provas)**: desenvolvimento, centro, roque, mobilidade, coluna sem peões, estrutura de peões (dobrados, isolados, passados) e escudo de peões do rei. Cada indício tem polaridade: um peão dobrado ou um escudo enfraquecido é *ponto de atenção* e nunca entra como elogio no resumo. São medidas simples e verificáveis, mas não demonstram por que o motor prefere outro lance; só aparecem quando nenhuma causa tática foi demonstrada, ou em lances aprovados.
- **O que não ficou provado**: quando as variantes não sustentam uma causa, o texto diz isso em vez de inventar um motivo. Também registra profundidade baixa, variante curta, captura pendente no fim da linha e profundidades diferentes entre as análises.

Regras de honestidade: o saldo material de uma variante só é afirmado quando ela termina sem captura pendente e só é comparado entre análises de mesma profundidade; um fato vindo só das regras, que o motor não confirma na resposta principal, é chamado de *indício forte*, não de *causa verificada*; lances que o motor aprova nunca recebem causas negativas (uma peça entregue num lance aprovado vira "sacrifício sustentado pelo motor, compensação não medida"); se a posição já estava perdida, o texto diz que o melhor lance não é o culpado. A confiança de cada explicação (*verificada*, *parcial*, *não confirmada*) aparece no topo da análise. Limites: o treinador não avalia planos de longo prazo, não mede a segurança do rei além do escudo de peões, não considera táticas fora da casa da captura (ataques por cravada ou raio-X são vistos só se a variante do motor os mostrar) e não conhece teoria de aberturas.

A classificação do lance (Melhor … Erro grave) continua vindo só da perda de pontos esperados descrita acima; o treinador explica, não reclassifica. Uma exceção por coerência: se o lance jogado é exatamente o que o motor escolheu na posição, a perda é zero, porque a posição seguinte é pesquisada de novo e a diferença entre as duas pontuações seria só instabilidade da busca (observado com o motor real em profundidade 14, no 15.Bxd7+ da partida da Ópera). Mate e afogamento são resolvidos pelas regras e não são enviados ao motor, de modo que o lance que dá mate é avaliado.

Depois da análise completa, navegar para um lance também atualiza o painel Stockfish ao lado do tabuleiro com a avaliação daquela posição, a classificação do lance selecionado, a explicação, a melhor continuação e a linha principal. Assim, não é necessário consultar apenas a lista de resultados abaixo dos lances.

Ao clicar em **Analisar posição** sobre um lance já percorrido, o painel também atualiza a classificação e a explicação enxadrística desse lance, comparando a análise atual com a posição anterior na mesma profundidade. Isso funciona com buscas novas e resultados do cache. No modo de jogada hipotética, a classificação identifica explicitamente o lance como hipotético.

Ao fazer um lance diferente numa partida importada, o site inicia automaticamente uma linha hipotética e mantém o PGN original salvo na memória da sessão; o botão **Explorar outra jogada a partir daqui** também inicia esse modo. Ao fazer cada novo lance, o site reanalisa a linha (reaproveitando resultados do cache quando possível) e atualiza as classificações. **Voltar à partida original** restaura o PGN e a posição selecionada. As explicações da linha hipotética usam o mesmo treinador e as mesmas regras de honestidade.

Ao analisar uma posição que corresponde a um lance de uma partida, o botão **Revelar análise do treinador** apresenta a lição estruturada acima. **Reproduzir a linha do lance jogado** aplica no tabuleiro a variante legal calculada após o lance, enquanto os controles de melhor lance e melhor sequência exploram a alternativa. As explicações continuam heurísticas e não substituem a leitura completa da variante.

Na revisão de um lance analisado, **Ver a melhor alternativa** inicia uma linha hipotética com a melhor alternativa do Stockfish para a posição anterior ao lance. **Ver a melhor sequência** reproduz a linha principal completa disponível do motor (até 24 meios-lances) e analisa a sequência. Em ambos os casos a partida original permanece recuperável pelo botão de retorno.

É possível mover peças por clique/toque ou arrastar com o mouse. O tabuleiro verifica movimentos legais, incluindo roque, en passant e promoção (a dama é a escolha padrão ao mover no tabuleiro). PGNs podem ser abertos de arquivo ou colados, e um **FEN colado sozinho** abre o tabuleiro livre naquela posição (posições ilegais — peão na primeira/última fileira ou lado que não joga em xeque — são recusadas com explicação); a leitura de lances tolera exportações comuns (captura sem `x`, promoção `e8Q`, numeração `1…`); variações e comentários são ignorados durante a importação, e a lista de lances permite navegar pela partida. Se o arquivo tiver várias partidas, só a primeira é carregada (cabeçalhos e lances vêm dela) e o site avisa quantas foram ignoradas.

## Revisão técnica mais recente

- **Variações sem interrupção**: cada lance hipotético reanalisa a linha na profundidade já escolhida para a partida (antes, abria o diálogo "Qual profundidade?" a cada lance e a profundidade podia divergir da original, o que afeta a comparação do treinador).
- **Chess.com**: erros HTTP (404, 429…) mostram mensagem própria em vez de cair no JSONP; o JSONP ficou restrito a falhas de rede/CORS; os endereços dos arquivos mensais, que vêm da resposta da API, só são aceitos se forem `https://api.chess.com/pub/…`.
- **Biblioteca**: a importação de cópia JSON descarta registros incompletos ou malformados e informa quantos foram ignorados.
- **Testes de volta ao verde**: o diálogo de profundidade e a biblioteca (IndexedDB/Chess.com) tinham deixado os testes desatualizados. O harness `_app_node.js` agora simula `showModal`, `requestSubmit`, `fetch`, `indexedDB` e `<select>`; há cenários novos (diálogo, variação, FEN, PGN tolerante, Chess.com, biblioteca) e `tests/executar_todos.py` roda tudo de uma vez.

## Teclado e navegação

- **← e →** navegam pelos lances quando o foco está fora do tabuleiro (na página, na lista ou na barra fixa); **Home** e **End** vão ao início e ao fim quando o foco está na lista ou na barra fixa, para não tirar a rolagem normal da página.
- Com o foco no tabuleiro, as **setas** movem o foco entre as casas, e **Shift + ← / →** (e Shift + Home / End) navegam pelos lances. Só uma casa fica na ordem de Tab; **Enter** ou **Espaço** seleciona e move.
- Navegar pelos lances **não interrompe** a análise da partida em andamento. Fazer um lance novo no tabuleiro ou pedir outra análise continua invalidando os resultados anteriores.
- O foco é devolvido ao tabuleiro, à lista ou à barra fixa depois de cada atualização, e a contagem de posições da barra é anunciada como região de status.
- Com `prefers-reduced-motion` ativo, animações e rolagens suaves são desligadas.

## Executar

O tabuleiro e a importação PGN podem ser usados abrindo `index.html` em um navegador moderno. Para o Stockfish, os navegadores exigem que o Web Worker seja carregado por HTTP local. Em um terminal, execute o servidor apenas quando quiser usar o motor:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory "/home/gabzito/MyChess6"
```

Depois, abra `http://127.0.0.1:8000`. Para encerrar o servidor, pressione `Ctrl+C` no terminal. Esse servidor é local, não requer instalação, e não é iniciado automaticamente pelo projeto.

### Iniciar com um clique no Linux

Dê dois cliques em `INICIAR-MYCHESS5.desktop` e escolha **Permitir iniciar** ou **Executar** se o gerenciador de arquivos perguntar. O lançador abre sempre `http://127.0.0.1:8766/`, para que o navegador mantenha a mesma biblioteca local entre reinicializações. O servidor fica somente neste computador; uma janela de terminal permanece aberta enquanto o site estiver servido. Feche-a ou pressione `Ctrl+C` para encerrar. Nada inicia automaticamente ao ligar o computador. Se mover a pasta, ajuste o caminho `Exec` no arquivo `.desktop`; também é possível iniciar com dois cliques em `abrir-xadrez-livre.sh`, que funciona a partir do local em que a pasta estiver.

## Estrutura

- `index.html` — conteúdo e estrutura acessível da página.
- `styles.css` — identidade visual e comportamento responsivo.
- `app.js` — regras do tabuleiro, leitura PGN, navegação, classificação dos lances e integração com Stockfish.
- `insights.js` — Visão geral: transforma as análises salvas em diagnóstico, prioridades de treino e evidências (módulo puro, testável em Node).
- `coach.js` — treinador: transforma duas análises do motor em fatos calculados, indícios e incertezas (módulo puro, testável em Node).
- `public/engine/` — compilação local do Stockfish.js e texto da licença GPL-3.0.
- `public/assets/chessboart/` — peças e textura originais ChessboArt, créditos, licença e comandos `curl` para baixar novamente.
- `iniciar-servidor.py`, `abrir-xadrez-livre.sh` e `INICIAR-MYCHESS5.desktop` — iniciador local opcional.
- `cloud-data/index.json` e `cloud-data/shards/` — biblioteca compartilhada e cursor do processamento automático; cada shard tem limite de 5 MiB.
- `scripts/cloud_analyze.py` e `scripts/cloud_data_guard.py` — geração da biblioteca e bloqueio de arquivos acima do limite interno antes da publicação.
- `tests/verificar_projeto.py` — verificações estáticas sem dependências externas.
- `tests/test_perft.js` — contagem *perft* em seis posições de referência (inicial, Kiwipete e outras com roque, en passant, promoção e cravadas) para validar as regras do tabuleiro; requer Node.js, sem navegador.
- `tests/test_interface_node.js` — comportamento de navegação, teclado, exercício guiado e PGN com várias partidas, com DOM simulado; requer Node.js.
- `tests/_app_node.js` — harness dos testes em Node: DOM mínimo e Stockfish falso determinístico (não faz parte do site).
- `tests/test_insights.js` — Visão geral: precisão, relógio, aberturas, amostra mínima, temas, vantagens e filtros; requer Node.js.
- `tests/test_coach.js` — cenários do treinador (mate, peça em risco, ameaça ignorada, troca ruim, garfo, sacrifício, posição já perdida, indícios, entradas inconsistentes, brancas e pretas); requer Node.js.
- `tests/executar_todos.py` — executa todas as verificações abaixo e resume o resultado.
- `tests/test_explicacoes_browser.py` — ponta a ponta em Chromium com o Stockfish real (partida de Légal); requer `playwright` para Python e é ignorado (SKIP) se faltar.

## Verificação local

O caminho mais curto é `python3 tests/executar_todos.py`. Em detalhe: execute `python3 tests/verificar_projeto.py` dentro da pasta do projeto para conferir os IDs e recursos locais do HTML, os arquivos Stockfish e seus hashes SHA-256, a sintaxe Python dos lançadores e a presença das funcionalidades principais. Se tiver Node.js, execute também `node tests/test_perft.js`, `node tests/test_interface_node.js` e `node tests/test_coach.js`, `node tests/test_insights.js`; com Playwright, `python3 tests/test_explicacoes_browser.py`. Os testes conferem os motivos e os saldos de material em posições conhecidas e o fluxo completo com o motor real, mas não substituem a revisão pedagógica de partidas completas no navegador.

## Stockfish e licença

O motor incluído é Stockfish.js v19.0.1, variante lite single-threaded. Os arquivos são distribuídos no projeto upstream [nmrugg/stockfish.js](https://github.com/nmrugg/stockfish.js) sob GPL-3.0; o texto da licença está em `public/engine/Copying.txt`. Se redistribuir ou publicar o site com o motor, mantenha os avisos e cumpra os termos da licença.

SHA-256 dos arquivos recebidos:

- `stockfish-19-lite-single.js`: `ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a`
- `stockfish-19-lite-single.wasm`: `ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de`
