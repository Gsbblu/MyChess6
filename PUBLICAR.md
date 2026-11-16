# Publicar o MyChess 5

O projeto estático não precisa de compilação nem de instalação de ferramentas. A pasta `publicacao/` contém uma cópia pronta para hospedagem: página, estilos, aplicação, Stockfish local e licença do motor.

## Publicar pelo Netlify Drop

1. Abra [app.netlify.com/drop](https://app.netlify.com/drop) e crie uma conta ou entre em uma conta existente para poder administrar o site depois.
2. Arraste a pasta `publicacao` desta cópia do projeto para a área de envio.
3. Quando o envio terminar, abra o endereço `*.netlify.app` mostrado pelo painel. Esse endereço pode ser aberto no celular; o laptop não precisa ficar ligado.
4. No primeiro acesso, confira se o Stockfish consegue analisar uma posição. O motor é baixado do próprio site junto com os demais arquivos e roda no navegador.

O envio torna os arquivos da pasta `publicacao` disponíveis ao serviço de hospedagem. O código JavaScript e o aviso/licença do Stockfish fazem parte desses arquivos. Não coloque dados pessoais ou segredos nessa pasta.

## Atualizar o site publicado

Antes de publicar mudanças futuras, copie para `publicacao/` as versões atualizadas de `index.html`, `styles.css`, `app.js`, `coach.js` e `insights.js`. Se os arquivos do motor ou a licença mudarem, atualize também `publicacao/public/engine/`. Rode `python3 tests/verificar_projeto.py`: ele falha se a cópia em `publicacao/` estiver diferente dos arquivos principais. Depois, arraste novamente a pasta `publicacao` à área de deploy do projeto existente no Netlify.

## Observações

- O nome de usuário do Chess.com (Gab0bu) está fixo e o campo é somente leitura: num site público, qualquer visitante verá as partidas desse perfil e não poderá trocá-lo.
- Não há etapa de build nem dependências externas do projeto.
- O Stockfish está incluído localmente; a análise usa CPU e bateria do aparelho que abriu a página.
- Para compartilhar o site com outras pessoas, verifique no painel se a visibilidade está pública. A configuração de visibilidade pode depender da conta/plano.
- O motor distribuído é Stockfish.js sob GPL-3.0; mantenha `public/engine/Copying.txt` ao redistribuí-lo.
