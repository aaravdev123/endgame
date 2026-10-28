import { Chess } from "chess.js";
import { getBookMoveFlags } from "./opening-book.js";

const ENGINE_URL = new URL(
  "../vendor/stockfish/stockfish-19-lite-single.js",
  import.meta.url,
);
const ANALYSIS_DEPTH = 13;

export function winChance(cp) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.003682 * cp)) - 1);
}

function scoreToCp(match) {
  if (!match) return null;
  if (match[1] === "cp") return Number(match[2]);
  const mate = Number(match[2]);
  if (!mate) return 0;
  return Math.sign(mate) * (10000 - Math.min(Math.abs(mate), 99) * 100);
}

function parseInfo(line, lines) {
  const depth = Number(line.match(/\bdepth (\d+)/)?.[1] ?? 0);
  const multipv = Number(line.match(/\bmultipv (\d+)/)?.[1] ?? 1);
  const scoreMatch = line.match(/\bscore (cp|mate) (-?\d+)/);
  const pv = line.match(/\bpv (.+)$/)?.[1]?.trim().split(/\s+/) ?? [];
  if (!scoreMatch || pv.length === 0) return;

  const current = lines.get(multipv);
  if (!current || depth >= current.depth) {
    lines.set(multipv, {
      depth,
      cp: scoreToCp(scoreMatch),
      mate: scoreMatch[1] === "mate" ? Number(scoreMatch[2]) : null,
      pv,
    });
  }
}

function toSan(fen, uci) {
  const match = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) throw new Error(`Stockfish returned an invalid UCI move: ${uci}`);
  const position = new Chess(fen);
  const move = position.move({
    from: match[1],
    to: match[2],
    promotion: match[3],
  });
  if (!move) throw new Error(`Stockfish returned an illegal move for the analyzed position: ${uci}`);
  return move.san;
}

export function createEngine() {
  return new Worker(ENGINE_URL);
}

export function analyzePosition(worker, fen, signal) {
  return new Promise((resolve, reject) => {
    const lines = new Map();
    let settled = false;
    const timeout = window.setTimeout(() => {
      finish(new Error("Stockfish took too long to analyze a position."));
    }, 45000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onWorkerError);
      signal?.removeEventListener("abort", onAbort);
    };
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve(value);
    };
    const onAbort = () => finish(new DOMException("Analysis cancelled.", "AbortError"));
    const onWorkerError = (event) =>
      finish(new Error(event.message || "Stockfish failed while analyzing a position."));
    const onMessage = (event) => {
      const line = String(event.data);
      if (line.startsWith("info ")) parseInfo(line, lines);
      if (line.startsWith("bestmove ")) {
        try {
          const candidates = [...lines.entries()]
            .sort(([rankA], [rankB]) => rankA - rankB)
            .map(([rank, item]) => ({
              ...item,
              rank,
              move: toSan(fen, item.pv[0]),
              uci: item.pv[0],
              continuation: item.pv.slice(1, 5).map((_, index) =>
                toSanFromLine(fen, item.pv, index + 1),
              ),
            }));
          const first = candidates[0];
          if (!first) {
            finish(new Error("Stockfish returned no evaluation for this position."));
            return;
          }
          finish(null, { ...first, candidates });
        } catch (error) {
          finish(error);
        }
      }
    };

    function toSanFromLine(startFen, pv, endIndex) {
      const position = new Chess(startFen);
      const sans = [];
      for (const uci of pv.slice(0, endIndex + 1)) {
        const match = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
        if (!match) throw new Error(`Stockfish returned an invalid UCI move: ${uci}`);
        const move = position.move({
          from: match[1],
          to: match[2],
          promotion: match[3],
        });
        if (!move) throw new Error(`Stockfish returned an illegal continuation move: ${uci}`);
        sans.push(move.san);
      }
      return sans.at(-1);
    }

    if (signal?.aborted) {
      onAbort();
      return;
    }
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onWorkerError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${ANALYSIS_DEPTH}`);
  });
}

export async function analyzeGame(fens, onProgress, signal) {
  const worker = createEngine();
  try {
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(
        () => {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          signal?.removeEventListener("abort", onAbort);
          reject(new Error("Stockfish did not finish starting."));
        },
        30000,
      );
      const onMessage = (event) => {
        if (String(event.data).includes("uciok")) {
          window.clearTimeout(timeout);
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          signal?.removeEventListener("abort", onAbort);
          resolve();
        }
      };
      const onError = (event) => {
        window.clearTimeout(timeout);
        worker.removeEventListener("message", onMessage);
        signal?.removeEventListener("abort", onAbort);
        reject(new Error(event.message || "Could not load the Stockfish worker."));
      };
      const onAbort = () => {
        window.clearTimeout(timeout);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        reject(new DOMException("Analysis cancelled.", "AbortError"));
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError, { once: true });
      signal?.addEventListener("abort", onAbort, { once: true });
      worker.postMessage("uci");
    });

    worker.postMessage("setoption name MultiPV value 3");
    worker.postMessage("isready");
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(
        () => {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          signal?.removeEventListener("abort", onAbort);
          reject(new Error("Stockfish did not become ready for analysis."));
        },
        30000,
      );
      const onMessage = (event) => {
        if (String(event.data).includes("readyok")) {
          window.clearTimeout(timeout);
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          signal?.removeEventListener("abort", onAbort);
          resolve();
        }
      };
      const onError = (event) => {
        window.clearTimeout(timeout);
        worker.removeEventListener("message", onMessage);
        signal?.removeEventListener("abort", onAbort);
        reject(new Error(event.message || "Stockfish failed to initialize."));
      };
      const onAbort = () => {
        window.clearTimeout(timeout);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        reject(new DOMException("Analysis cancelled.", "AbortError"));
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError, { once: true });
      signal?.addEventListener("abort", onAbort, { once: true });
    });

    const positions = [];
    for (let index = 0; index < fens.length; index += 1) {
      if (signal?.aborted) throw new DOMException("Analysis cancelled.", "AbortError");
      const position = terminalEvaluation(fens[index]) ?? await analyzePosition(worker, fens[index], signal);
      positions.push(position);
      onProgress(index + 1, fens.length, position);
    }
    return positions;
  } finally {
    worker.terminate();
  }
}

function terminalEvaluation(fen) {
  const chess = new Chess();
  chess.load(fen);
  if (chess.isCheckmate()) {
    return { cp: -10000, mate: 0, candidates: [], pv: [], move: "—", rank: 1 };
  }
  if (chess.isDraw()) {
    return { cp: 0, mate: null, candidates: [], pv: [], move: "—", rank: 1 };
  }
  return null;
}

export function evaluateMoves(moves, positions, initialFen) {
  const chess = new Chess();
  chess.load(initialFen);
  const bookMoveFlags = getBookMoveFlags(moves, initialFen);
  return moves.map((move, index) => {
    const before = positions[index];
    const after = positions[index + 1];
    const whiteToMove = chess.turn() === "w";
    const expectedCp = before.cp;
    const playedCp = -after.cp;
    const expectedWinChance = winChance(expectedCp);
    const playedWinChance = winChance(playedCp);
    const loss = Math.max(0, expectedWinChance - playedWinChance);
    const playedUci = `${move.from}${move.to}${move.promotion ?? ""}`;
    const best = before.candidates[0];
    const playedCandidate = before.candidates.find((candidate) => candidate.uci === playedUci);
    const matchesBest = playedUci === best?.uci;
    const bestFacts = inspectMove(move.beforeFen, best?.uci);
    const missedTacticalOpportunity =
      !matchesBest &&
      expectedCp >= 300 &&
      loss >= 5 &&
      (best?.mate > 0 ||
        bestFacts?.check ||
        bestFacts?.promotion ||
        (bestFacts?.captured && bestFacts.captured !== "pawn"));
    const category = bookMoveFlags[index]
      ? "Book"
      : classifyMove({
          matchesBest,
          loss,
          missedTacticalOpportunity,
          expectedCp,
          playedCp,
          playedUci,
          candidates: before.candidates,
          reply: after.candidates[0],
          playedCandidate,
          beforeFen: move.beforeFen,
        });
    const moverEvalWhite = whiteToMove ? playedCp : -playedCp;

    chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    const afterFen = chess.fen();

    return {
      ...move,
      index,
      before,
      after,
      expectedCp,
      playedCp,
      expectedWinChance,
      playedWinChance,
      winChanceLoss: loss,
      whiteCp: moverEvalWhite,
      best,
      candidates: before.candidates,
      category,
      playedUci,
      bestExplanation: describeMove(best && inspectMove(move.beforeFen, best.uci)),
      commentary: makeCommentary(
        move,
        best,
        loss,
        category,
        expectedCp,
        playedCp,
        after.candidates[0],
        move.beforeFen,
        afterFen,
      ),
    };
  });
}

function classifyMove({
  matchesBest,
  loss,
  missedTacticalOpportunity,
  expectedCp,
  playedCp,
  playedUci,
  candidates,
  reply,
  playedCandidate,
  beforeFen,
}) {
  if (missedTacticalOpportunity) return "Miss";

  const destination = playedUci.slice(2, 4);
  const playedFacts = inspectMove(beforeFen, playedUci);
  const isWinningSacrifice =
    playedFacts?.piece &&
    playedFacts.piece !== "pawn" &&
    reply?.move?.includes("x") &&
    reply.uci?.slice(2, 4) === destination &&
    expectedCp >= -50 &&
    playedCp >= -50 &&
    loss < 2 &&
    candidates.some((candidate) => candidate.uci === playedUci && candidate.rank > 1);
  if (isWinningSacrifice) return "Brilliant";
  if (matchesBest) return "Best";
  const isCriticalAlternative =
    playedCandidate?.rank > 1 &&
    loss < 2 &&
    (playedFacts?.captured || playedFacts?.check || playedFacts?.promotion);
  if (isCriticalAlternative) return "Great";
  if (loss < 2) return "Excellent";
  if (loss < 5) return "Good";
  if (loss < 10) return "Inaccuracy";
  if (loss < 20) return "Mistake";
  return "Blunder";
}

const PIECE_NAMES = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function inspectMove(fen, uci) {
  const match = uci?.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) return null;

  const position = new Chess(fen);
  const piece = position.get(match[1]);
  if (!piece) return null;
  const move = position.move({
    from: match[1],
    to: match[2],
    promotion: match[3],
  });
  if (!move) return null;

  return {
    piece: PIECE_NAMES[piece.type],
    color: piece.color,
    from: move.from,
    captured: move.captured ? PIECE_NAMES[move.captured] : null,
    destination: move.to,
    enPassant: move.flags.includes("e"),
    capturedSquare: move.flags.includes("e") ? `${move.to[0]}${move.from[1]}` : move.to,
    promotion: move.promotion ? PIECE_NAMES[move.promotion] : null,
    san: move.san,
    check: position.isCheck(),
    checkmate: position.isCheckmate(),
  };
}

function describeMove(facts) {
  if (!facts) return "improves the position";
  const actions = [];
  if (facts.san.startsWith("O-O")) {
    actions.push("gets the king to safety and brings a rook into play");
  } else if (facts.enPassant) {
    actions.push(`captures the pawn on ${facts.capturedSquare} en passant`);
  } else if (facts.captured) {
    actions.push(`captures the ${facts.captured} on ${facts.destination} with the ${facts.piece}`);
  } else if (facts.piece === "pawn" && ["d4", "e4", "d5", "e5"].includes(facts.destination)) {
    actions.push(`pushes the pawn from ${facts.from} to ${facts.destination} to claim central space`);
  } else if (["knight", "bishop"].includes(facts.piece) && facts.from[1] === (facts.color === "w" ? "1" : "8")) {
    actions.push(`develops the ${facts.piece} from ${facts.from} to ${facts.destination}`);
  } else if (facts.piece === "pawn") {
    actions.push(`advances the pawn from ${facts.from} to ${facts.destination}`);
  } else if (["d4", "e4", "d5", "e5"].includes(facts.destination)) {
    actions.push(`centralizes the ${facts.piece} from ${facts.from} to ${facts.destination}`);
  } else {
    actions.push(`repositions the ${facts.piece} from ${facts.from} to ${facts.destination}`);
  }
  if (facts.promotion) actions.push(`promotes to a ${facts.promotion}`);
  if (facts.checkmate) actions.push("delivers checkmate");
  else if (facts.check) actions.push("gives check");
  return actions.join(" and ");
}

function describePositionForMover(cp) {
  if (Math.abs(cp) < 50) return "roughly level";
  if (cp >= 9900) return "a forced win";
  if (cp <= -9900) return "a forced loss";
  if (cp > 0) {
    if (cp < 180) return "a small edge";
    if (cp < 450) return "a clear advantage";
    return "a winning position";
  }
  if (cp > -180) return "a small disadvantage";
  if (cp > -450) return "a difficult position";
  return "a losing position";
}

function makeCommentary(move, best, loss, category, expectedCp, playedCp, reply, beforeFen, afterFen) {
  const playedFacts = inspectMove(beforeFen, `${move.from}${move.to}${move.promotion ?? ""}`);
  const playedAction = describeMove(playedFacts);
  const bestAction = describeMove(best && inspectMove(beforeFen, best.uci));
  const replyAction = describeMove(reply && inspectMove(afterFen, reply.uci));
  const position = describePositionForMover(playedCp);
  const replyText = reply
    ? ` The engine's strongest reply is ${reply.move}: it ${replyAction}.`
    : "";
  const impact = loss < 1
    ? "It keeps virtually all of the position's winning chances."
    : `Compared with the engine's top choice, it gives up about ${Math.round(loss)} percentage points of winning chances.`;

  if (category === "Best") {
    return `The engine's top choice is ${move.san}: it ${playedAction}. The resulting position is ${position}.${replyText}`;
  }
  if (category === "Brilliant") {
    return `A brilliant tactical idea: ${move.san} offers the ${playedFacts.piece} on ${playedFacts.destination}. The resulting position is still ${position}.${replyText}`;
  }
  if (category === "Great") {
    return `A strong alternative to the engine's first choice: ${move.san} ${playedAction}. ${impact}${replyText}`;
  }
  if (category === "Book") {
    return `This recognized opening move, ${move.san}, ${playedAction}. The position is ${position}.${replyText}`;
  }
  if (category === "Excellent") {
    return `An excellent choice: ${move.san} ${playedAction}. The position remains ${position}, and the move keeps almost all of the engine's winning chances.${replyText}`;
  }
  if (category === "Good") {
    return `A sound practical move: ${move.san} ${playedAction}. The position is ${position}. ${impact}${replyText}`;
  }

  const assessment = category === "Miss"
    ? `This misses a concrete opportunity: ${move.san} ${playedAction}.`
    : expectedCp <= -150
      ? `This makes an already difficult position harder: ${move.san} ${playedAction}.`
      : expectedCp >= 150
        ? loss >= 20
          ? `This throws away much of your advantage: ${move.san} ${playedAction}.`
          : `This gives away some of your advantage: ${move.san} ${playedAction}.`
        : `This gives the opponent a more comfortable position: ${move.san} ${playedAction}.`;
  const bestText = best
    ? `The better choice was ${best.move}, which ${bestAction}.`
    : "";
  return `${assessment} ${impact}${replyText} ${bestText} The resulting position is ${position}`.trim();
}
