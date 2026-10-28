# Endgame · Chess game review

A browser-based game review dashboard using `chess.js`, the Chess.com Public API, and a local Stockfish.js WebAssembly worker. Engine scores, move classifications, candidate lines, and commentary are produced in the browser; there is no LLM or server-side evaluation.

## Run locally

On macOS, double-click `Start Chess Review.command` to start the local server and open the app in your browser. Keep the Terminal window open while using the app; closing it stops the server.

Alternatively, serve this directory over HTTP (the engine worker will not run from `file://`):

```sh
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173). The page loads React, `chess.js`, Tailwind's browser CDN, and fonts from their public CDNs; an internet connection is needed for those assets and Chess.com imports. Stockfish's JavaScript and WASM files are included locally in `vendor/stockfish/`.

## What is included

- Chess.com username lookup with the six newest monthly archives and recent games.
- PGN text import and `.pgn` / `.txt` file upload.
- Three bundled historic game scores with precomputed Stockfish.js 19 Lite, depth-10 evaluations and up to three candidate lines per position. They load immediately without an API request.
- UCI engine analysis of every position at depth 10 with up to three candidate lines.
- Move-by-move explanations that name the played move's concrete action, the resulting position, the engine's strongest reply, and the winning-chance cost of a weaker choice; also includes a qualitative advantage graph and bar, a translucent suggestion arrow for moves needing correction, board navigation, and autoplay.
- Color-coded quality symbols shown on the destination square. Book labels are not assigned automatically because the app does not include a verified opening database.

The Stockfish JavaScript and WebAssembly engine are from Stockfish.js 19.0.1 and are distributed under the GNU General Public License; see [vendor/stockfish/Copying.txt](./vendor/stockfish/Copying.txt).
