import { Chess } from "chess.js";

const START_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";

const OPENING_LINES = [
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6",
  "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4",
  "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O",
  "e4 e5 Nf3 Nc6 Bc4 Bc5 d3 Nf6 c3 d6 O-O O-O Re1",
  "e4 e5 Nf3 Nc6 d4 exd4 Nxd4",
  "e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3",
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6",
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6",
  "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 d6",
  "e4 e6 d4 d5 Nc3 Nf6 e5 Nfd7",
  "e4 e6 d4 d5 e5 c5 c3",
  "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6",
  "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6",
  "e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6",
  "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5",
  "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3",
  "d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6",
  "d4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O O-O",
  "d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3",
  "c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6",
  "Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7 c4 O-O",
  "e4 e5 f4 exf4 Nf3 g5 h4 g4",
  "e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5",
  "e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7 Bh6",
  "c4 e6 Nf3 d5 d4 Nf6 Nc3 Be7 Bg5 O-O e3 h6 Bh4 b6",
].map((line) => line.split(/\s+/).map(normalizeSan));

export function getBookMoveFlags(moves, initialFen) {
  const startingPosition = new Chess(initialFen).fen().split(" ").slice(0, 4).join(" ");
  if (startingPosition !== START_POSITION) return moves.map(() => false);

  let candidates = OPENING_LINES;
  return moves.map((move, index) => {
    const san = normalizeSan(move.san);
    candidates = candidates.filter((line) => line[index] === san);
    return candidates.length > 0;
  });
}

function normalizeSan(san) {
  return san.replace(/[+#?!]+$/g, "");
}
