# ChessboArt assets

The 12 original ChessboArt SVG pieces and the board texture are from the Lichess `lila` repository, pinned to commit [`ba86f0d`](https://github.com/lichess-org/lila/commit/ba86f0dd814e489348444df5134d721041d6e06b). The artwork is by Michał Fudalej / ChessboArt and is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The displayed piece files are adapted to soften interior engraving. The board SVG is adapted to show white squares and a denser dark wood-grain pattern, using variations of the original ChessboArt grain paths.

To download fresh, unmodified copies into `originals/` from the project root (the site continues to use the softened files in `pieces/`):

```sh
set -eu
asset_dir=public/assets/chessboart/originals
mkdir -p "$asset_dir/pieces" "$asset_dir/board"
for piece in wK wQ wR wB wN wP bK bQ bR bB bN bP; do
  curl -fsSL "https://raw.githubusercontent.com/lichess-org/lila/ba86f0dd814e489348444df5134d721041d6e06b/public/piece/chessboart/${piece}.svg" \
    -o "$asset_dir/pieces/${piece}.svg"
done
curl -fsSL 'https://raw.githubusercontent.com/lichess-org/lila/ba86f0dd814e489348444df5134d721041d6e06b/public/images/board/svg/chessboart.svg' \
  -o "$asset_dir/board/chessboart.svg"
```
