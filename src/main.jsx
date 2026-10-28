import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chess } from "chess.js";
import { analyzeGame, evaluateMoves } from "./src/analysis.js";
import { historicGames } from "./src/games.js";
import { historicEvaluations } from "./src/historic-evaluations.js";

const PIECES = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const BADGES = {
  Brilliant: {
    glyph: "!",
    tone: "brilliant",
  },
  Great: {
    glyph: "!!",
    tone: "great",
    label: "Great Move",
  },
  Best: {
    glyph: "★",
    tone: "best",
    label: "Best Move",
  },
  Excellent: {
    glyph: "✓",
    tone: "excellent",
  },
  Good: {
    glyph: "★",
    tone: "good",
    label: "Good Move",
  },
  Book: {
    glyph: "📖",
    tone: "book",
    label: "Book Move",
  },
  Inaccuracy: {
    glyph: "?!",
    tone: "inaccuracy",
  },
  Mistake: {
    glyph: "?",
    tone: "mistake",
  },
  Miss: {
    glyph: "❌",
    tone: "miss",
  },
  Blunder: {
    glyph: "??",
    tone: "blunder",
  },
};

function headersFromPgn(pgn) {
  return Object.fromEntries(
    [...pgn.matchAll(/^\[([A-Za-z]+)\s+"([^"]*)"\]\s*$/gm)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function makeReviewGame(pgn, details = {}) {
  const headers = headersFromPgn(pgn);
  const resultToken = pgn.match(/(?:^|\s)(1-0|0-1|1\/2-1\/2|\*)\s*$/)?.[1];
  if (!headers.Result && resultToken) headers.Result = resultToken;
  const startFen =
    headers.SetUp === "1" && headers.FEN
      ? headers.FEN
      : new Chess().fen();
  const parsed = new Chess(startFen);
  parsed.loadPgn(pgn);
  const moves = parsed.history({ verbose: true });
  if (!moves.length) throw new Error("No chess moves were found in this PGN.");

  const replay = new Chess(startFen);
  const fens = [replay.fen()];
  const reviewMoves = moves.map((move) => {
    const replayed = replay.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    const record = {
      from: replayed.from,
      to: replayed.to,
      promotion: replayed.promotion,
      color: replayed.color,
      san: replayed.san,
      captured: replayed.captured,
      beforeFen: fens.at(-1),
    };
    fens.push(replay.fen());
    return record;
  });
  return {
    pgn,
    headers,
    moves: reviewMoves,
    fens,
    startFen,
    ...details,
  };
}

function makeEmptyReviewGame() {
  const startFen = new Chess().fen();
  return {
    title: "Choose a game to review",
    headers: {},
    moves: [],
    fens: [startFen],
    startFen,
  };
}

function describePosition(cp) {
  if (cp == null || !Number.isFinite(cp) || Math.abs(cp) < 50) return "The position is roughly level";
  if (Math.abs(cp) < 180) return `${cp > 0 ? "White" : "Black"} has a small edge`;
  if (Math.abs(cp) < 450) return `${cp > 0 ? "White" : "Black"} has a clear advantage`;
  return `${cp > 0 ? "White" : "Black"} is winning`;
}

function getEndingMarker(game) {
  const finalPosition = new Chess(game.fens.at(-1) ?? game.startFen);
  const board = finalPosition.board();
  let mode;
  let losingColor;

  if (finalPosition.isCheckmate()) {
    mode = "checkmate";
    losingColor = finalPosition.turn();
  } else {
    const result = (game.headers.Result || game.result || "").trim();
    const termination = (game.headers.Termination || "").toLowerCase();
    const isResignation = /resign|forfeit|abandon|out of time|timeout|time forfe/.test(termination)
      || result === "1-0"
      || result === "0-1";
    if (!isResignation) return null;
    mode = "resign";
    losingColor = result === "1-0" ? "b" : result === "0-1" ? "w" : finalPosition.turn();
  }

  const kingSquare = board.flatMap((rank, row) =>
    rank.map((piece, col) => piece?.type === "k" && piece.color === losingColor
      ? `${"abcdefgh"[col]}${8 - row}`
      : null),
  ).find(Boolean);

  return kingSquare ? { mode, square: kingSquare } : null;
}

function Icon({ name, size = 18, className = "" }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" /></>,
    play: <path d="m8 5 11 7-11 7z" />,
    pause: <><path d="M8 5h3v14H8z" /><path d="M15 5h3v14h-3z" /></>,
    first: <><path d="M5 5v14" /><path d="m19 5-9 7 9 7z" /></>,
    prev: <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
    next: <><path d="m9 18 6-6-6-6" /><path d="M5 12h10" /></>,
    last: <><path d="M19 5v14" /><path d="m5 5 9 7-9 7z" /></>,
    external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h5" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark" aria-label="Endgame logo mark">
        <svg className="brand-mark-svg" viewBox="0 0 32 32" role="img" aria-hidden="true">
          <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#111311" stroke="#53633c" strokeWidth="1.2" />
          <rect x="1.5" y="1.5" width="14" height="14" fill="#c5f36b" />
          <rect x="16.5" y="16.5" width="14" height="14" fill="#c5f36b" />
          <rect x="16.5" y="1.5" width="14" height="14" fill="#111311" />
          <rect x="1.5" y="16.5" width="14" height="14" fill="#111311" />
        </svg>
      </div>
      <div className="brand-text">
        <div className="brand-name">endgame</div>
        <div className="brand-caption">GAME REVIEW STUDIO</div>
      </div>
    </div>
  );
}

function MoveBadge({ category, compact = false }) {
  if (!category) return null;
  const badge = BADGES[category];
  return (
    <span
      className={`move-badge badge-${badge?.tone ?? "good"} ${compact ? "badge-compact" : ""}`}
      title={category}
      aria-label={category}
    >
      <span className="badge-glyph">{badge?.glyph}</span>
      {!compact && <span className="badge-name">{badge?.label ?? category}</span>}
    </span>
  );
}

function Chessboard({ fen, lastMove, nextMove, engineMove, moveMarker, endingMarker, onSquareClick }) {
  const board = useMemo(() => {
    const chess = new Chess(fen);
    return chess.board();
  }, [fen]);
  const drawArrow = (move, className, description) => {
    const match = move?.uci?.match(/^([a-h][1-8])([a-h][1-8])/);
    if (!match) return null;

    const fromX = "abcdefgh".indexOf(match[1][0]) * 100 + 50;
    const fromY = (8 - Number(match[1][1])) * 100 + 50;
    const toX = "abcdefgh".indexOf(match[2][0]) * 100 + 50;
    const toY = (8 - Number(match[2][1])) * 100 + 50;
    return (
      <g key={className} className={`board-arrow ${className}`} aria-label={description} pointerEvents="none">
        <line x1={fromX} y1={fromY} x2={toX} y2={toY} markerEnd={`url(#${className.includes("played-") ? "played" : "engine"}-arrow-head)`} />
      </g>
    );
  };
  const [selected, setSelected] = useState(null);
  useEffect(() => setSelected(null), [fen]);

  const handleClick = (square) => {
    if (selected === nextMove?.from && square === nextMove?.to) {
      onSquareClick("next");
      setSelected(null);
      return;
    }
    if (selected === lastMove?.to && square === lastMove?.from) {
      onSquareClick("prev");
      setSelected(null);
      return;
    }
    setSelected(square);
  };

  return (
    <div className="board-frame">
      <svg className="chessboard" viewBox="0 0 800 800" role="grid" aria-label="Chessboard">
        <defs>
          <marker id="engine-arrow-head" markerWidth="20" markerHeight="20" refX="15" refY="10" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,20 L20,10 Z" className="engine-arrow-head" />
          </marker>
        </defs>
        {board.flatMap((rank, row) =>
          rank.map((piece, col) => {
            const square = `${"abcdefgh"[col]}${8 - row}`;
            const isLight = (row + col) % 2 === 0;
            const isLast = lastMove?.from === square || lastMove?.to === square;
            const isNext = nextMove?.from === square || nextMove?.to === square;
            const isSelected = selected === square;
            return (
              <g
                key={square}
                role="gridcell"
                aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
                tabIndex={0}
                onClick={() => handleClick(square)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") handleClick(square);
                }}
                className="board-square"
              >
                <rect
                  x={col * 100}
                  y={row * 100}
                  width="100"
                  height="100"
                  className={`${isLight ? "square-light" : "square-dark"} ${isLast ? "square-last" : ""} ${isNext ? "square-next" : ""} ${isSelected ? "square-selected" : ""}`}
                />
                {col === 0 && (
                  <text x="8" y={row * 100 + 22} className={`coordinate ${isLight ? "coord-dark" : "coord-light"}`}>
                    {8 - row}
                  </text>
                )}
                {row === 7 && (
                  <text x={col * 100 + 86} y="790" className={`coordinate ${isLight ? "coord-dark" : "coord-light"}`}>
                    {"abcdefgh"[col]}
                  </text>
                )}
                {piece && (
                  <text
                    x={col * 100 + 50}
                    y={row * 100 + 77}
                    textAnchor="middle"
                    className={`chess-piece ${piece.color === "w" ? "piece-white" : "piece-black"}`}
                  >
                    {PIECES[piece.type]}
                  </text>
                )}
                {endingMarker?.square === square && (
                  <g
                    className={`ending-marker ending-marker-${endingMarker.mode}`}
                    transform={`translate(${col * 100 + 78} ${row * 100 + 22})`}
                    role="img"
                    aria-label={endingMarker.mode === "checkmate" ? "Checkmate" : "Resignation"}
                    pointerEvents="none"
                  >
                    <title>{endingMarker.mode === "checkmate" ? "Checkmate" : "Resignation"}</title>
                    <circle r="18" />
                    {endingMarker.mode === "checkmate" ? (
                      <>
                        <path className="ending-ground" d="M-11 10h22" />
                        <text className="ending-fallen-king" y="7">♚</text>
                      </>
                    ) : (
                      <>
                        <path className="ending-flag-pole" d="M-5-11v22" />
                        <path className="ending-white-flag" d="M-4-10h13l-3 5 3 5H-4z" />
                      </>
                    )}
                  </g>
                )}
              </g>
            );
          }),
        )}
        {engineMove && drawArrow(engineMove, "engine-arrow", `Engine suggests ${engineMove.move}`)}
        {moveMarker && (() => {
          const toX = "abcdefgh".indexOf(moveMarker.to[0]) * 100;
          const toY = (8 - Number(moveMarker.to[1])) * 100;
          const badge = BADGES[moveMarker.category];
          if (!badge) return null;
          return (
            <g
              className={`board-move-marker marker-${badge.tone}`}
              transform={`translate(${toX + 78} ${toY + 22})`}
              role="img"
              aria-label={`${moveMarker.category} move`}
              pointerEvents="none"
            >
              <title>{moveMarker.category}</title>
              <circle r="17" />
              <text y="1">{badge.glyph}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function EvaluationBar({ cp, sideToMove }) {
  const whiteCp = cp == null ? 0 : (sideToMove === "w" ? cp : -cp);
  const ratio = Math.max(0, Math.min(1, (Math.max(-1000, Math.min(1000, whiteCp)) + 1000) / 2000));
  return (
    <div className="eval-column" aria-label={cp == null ? "No evaluation available" : describePosition(whiteCp)}>
      <span className="eval-side eval-side-black">Black</span>
      <div className="eval-bar">
        <div className="eval-black" />
        <div className="eval-white-fill" style={{ height: `${ratio * 100}%` }} />
        {cp != null && <span className="eval-tick" style={{ bottom: `${ratio * 100}%` }} />}
      </div>
      <span className="eval-side eval-side-white">White</span>
    </div>
  );
}

function EvaluationGraph({ positions, fens, currentPly, onSelect }) {
  const width = 560;
  const height = 134;
  const points = positions.map((position, index) => {
    const side = fens[index]?.split(" ")[1] ?? "w";
    const cp = (side === "w" ? 1 : -1) * position.cp;
    const x = positions.length < 2 ? width / 2 : 8 + (index / (positions.length - 1)) * (width - 16);
    const y = 8 + ((1000 - Math.max(-1000, Math.min(1000, cp))) / 2000) * (height - 16);
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const cursorX = points[currentPly]?.x ?? 8;

  return (
    <div className="graph-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="eval-graph" role="img" aria-label="Evaluation graph">
        <defs>
          <linearGradient id="graph-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c5f36b" stopOpacity=".23" />
            <stop offset="100%" stopColor="#c5f36b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((line) => (
          <line key={line} x1="0" y1={height * line} x2={width} y2={height * line} className="graph-grid" />
        ))}
        {points.length > 1 && <path d={`${path} L ${points.at(-1).x} ${height} L ${points[0].x} ${height} Z`} fill="url(#graph-area)" />}
        {points.length > 0 && <path d={path} className="graph-line" />}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === currentPly ? 4 : 2}
            className={index === currentPly ? "graph-current" : "graph-point"}
            onClick={() => onSelect(index)}
          />
        ))}
        <line x1={cursorX} y1="0" x2={cursorX} y2={height} className="graph-cursor" />
      </svg>
      <div className="graph-labels"><span>White ahead</span><span>Level</span><span>Black ahead</span></div>
    </div>
  );
}

function MoveList({ moves, currentPly, onSelect }) {
  const rows = [];
  for (let index = 0; index < moves.length; index += 2) {
    rows.push({ number: Math.floor(index / 2) + 1, white: moves[index], black: moves[index + 1] });
  }
  return (
    <div className="move-list" role="list" aria-label="Move list">
      {rows.map((row) => (
        <div className="move-row" key={row.number}>
          <span className="move-number">{String(row.number).padStart(2, "0")}.</span>
          {[row.white, row.black].map((move) =>
            move ? (
              <button
                className={`move-item ${currentPly === move.index + 1 ? "move-active" : ""}`}
                key={move.index}
                onClick={() => onSelect(move.index + 1)}
                aria-label={`Go to move ${move.index + 1}: ${move.san}`}
              >
                <span>{move.san}</span>
                <MoveBadge category={move.category} compact />
              </button>
            ) : <span className="move-item move-empty" key="empty" />,
          )}
        </div>
      ))}
    </div>
  );
}

function Commentary({ move, loading }) {
  if (loading) {
    return (
      <div className="commentary-empty">
        <span className="loading-dot" />
        Finding the strongest continuation…
      </div>
    );
  }
  if (!move) {
    return <div className="commentary-empty">Select a move to see what changed and why.</div>;
  }
  return (
    <div className="commentary">
      <div className="commentary-heading">
        <MoveBadge category={move.category} />
        <span className="commentary-move">{move.color === "w" ? "White" : "Black"} · {move.san}</span>
      </div>
      <p>{move.commentary}</p>
      {move.best && !["Best", "Book"].includes(move.category) && (
        <div className="suggestion-card">
          <span className="suggestion-label">A stronger option</span>
          <strong>{move.best.move}</strong>
          <span>{move.bestExplanation}</span>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ onStartReview, onImportPgn, onChooseGame }) {
  const featuredGame = historicGames.find((game) => game.id === "immortal");
  const heroChess = new Chess();
  heroChess.loadPgn(featuredGame.pgn);
  const featuredMoves = heroChess.history({ verbose: true });
  const turningPointIndex = 42;
  const turningPoint = featuredMoves[turningPointIndex];
  heroChess.reset();
  featuredMoves.slice(0, turningPointIndex + 1).forEach(({ from, to, promotion }) => {
    heroChess.move({ from, to, promotion });
  });
  const heroPosition = heroChess.board();
  const highlightedSquares = new Set([turningPoint.from, turningPoint.to]);
  const turningPointMoveNumber = Math.floor(turningPointIndex / 2) + 1;
  const games = historicGames;

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="hero-eyebrow"><span className="status-light" /> STOCKFISH CHESS REVIEW</div>
          <h1>Understand the<br /><span>moves that matter.</span></h1>
          <p>Analyze a game move by move, compare your choices with Stockfish, and learn from each position.</p>
          <div className="hero-actions">
            <button className="hero-primary" onClick={onStartReview}>Review a game <Icon name="arrow" size={17} /></button>
            <button className="hero-secondary" onClick={() => document.getElementById("home-library")?.scrollIntoView({ behavior: "smooth" })}>Browse historic games <span>↓</span></button>
          </div>
          <button className="hero-import-link" onClick={onImportPgn}>Have a PGN? <span>Import it <Icon name="arrow" size={12} /></span></button>
          <div className="hero-proof"><span className="proof-icons"><i>♟</i><i>♞</i><i>♝</i></span><span>Stockfish analysis. No account needed.</span></div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-board-frame">
            <div className="hero-board" role="img" aria-label={`Position after ${turningPointMoveNumber}.${turningPoint.san} in Kasparov versus Topalov`}>
              {Array.from({ length: 64 }, (_, index) => {
                const row = Math.floor(index / 8);
                const col = index % 8;
                const piece = heroPosition[row][col];
                const square = `${"abcdefgh"[col]}${8 - row}`;
                const glyph = piece ? PIECES[piece.type] : null;
                return (
                  <div
                    className={`hero-square ${(row + col) % 2 === 0 ? "hero-square-light" : "hero-square-dark"} ${highlightedSquares.has(square) ? "hero-square-marked" : ""}`}
                    key={square}
                  >
                    {glyph && <span className={piece.color === "w" ? "hero-piece-light" : "hero-piece-dark"}>{glyph}</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hero-callout hero-callout-turning-point">
            <strong>The turning point: {turningPointMoveNumber}. {turningPoint.san}!</strong>
          </div>
          <div className="hero-callout hero-callout-advantage">
            <strong>White has an advantage.</strong>
          </div>
        </div>

        <div className="hero-index">01 <span>—</span> REVIEW STUDIO</div>
      </section>

      <section className="home-features" aria-label="Review features">
        <div className="feature-item"><span className="feature-icon">♟</span><div><strong>Review every position</strong><span>See the engine's assessment and best move.</span></div></div>
        <div className="feature-item"><span className="feature-icon">⌁</span><div><strong>Track the evaluation</strong><span>Spot where the balance of the game changed.</span></div></div>
        <div className="feature-item"><span className="feature-icon">↗</span><div><strong>Use your own games</strong><span>Import a PGN or browse public Chess.com games.</span></div></div>
      </section>

      <section className="home-library" id="home-library">
        <div className="home-section-heading">
          <div><div className="section-eyebrow"><span className="eyebrow-line" /> HISTORIC GAMES</div><h2>Replay and learn.</h2><p>Choose a game to explore its moves and key lesson.</p></div>
          <button onClick={onStartReview}>Review your own game <Icon name="arrow" size={15} /></button>
        </div>
        <div className="home-game-grid">
          {games.map((record, index) => (
            <button className="home-game-card" key={record.id} onClick={() => onChooseGame(record)}>
              <span className={`home-game-art historic-art-${(index % 3) + 1}`}>
                <span>{["♞", "♛", "♙", "♜", "♝", "♟"][index % 6]}</span>
                <span className="home-art-year">{record.event.split("·").at(-1).trim()}</span>
                <span className="home-art-play"><Icon name="play" size={15} /></span>
              </span>
              <span className="home-game-details"><span className="home-game-event">{record.event}</span><strong>{record.title}</strong><span className="home-game-players">{record.subtitle}</span></span>
              <span className="home-game-result">{record.result}</span>
            </button>
          ))}
        </div>
      </section>
      <footer className="home-footer"><Brand /><span>PGN imports · public Chess.com games</span><span>STOCKFISH 19 LITE</span></footer>
    </main>
  );
}

function App() {
  const [game, setGame] = useState(makeEmptyReviewGame);
  const [activePage, setActivePage] = useState("home");
  const [moves, setMoves] = useState([]);
  const [positions, setPositions] = useState([]);
  const [currentPly, setCurrentPly] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [analysisError, setAnalysisError] = useState("");
  const [activeSource, setActiveSource] = useState("chesscom");
  const [username, setUsername] = useState("");
  const [archives, setArchives] = useState([]);
  const [chessGames, setChessGames] = useState([]);
  const [selectedArchive, setSelectedArchive] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [pgnText, setPgnText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    if (game.moves.length === 0) {
      setProgress({ done: 0, total: 0 });
      setPositions([]);
      setMoves([]);
      setCurrentPly(0);
      setAnalysisError("");
      return undefined;
    }

    const preset = historicEvaluations.games[game.id];
    if (preset && preset.length === game.fens.length) {
      setProgress({ done: preset.length, total: preset.length });
      setPositions(preset);
      setMoves(evaluateMoves(game.moves, preset, game.startFen));
      setCurrentPly(0);
      setAnalysisError("");
      return undefined;
    }

    const abort = new AbortController();
    const streamedPositions = [];
    setProgress({ done: 0, total: game.fens.length });
    setPositions([]);
    setMoves([]);
    setCurrentPly(0);
    setAnalysisError("");

    analyzeGame(
      game.fens,
      (done, total, position) => {
        if (abort.signal.aborted) return;
        setProgress({ done, total });
        streamedPositions.push(position);
        setPositions([...streamedPositions]);
        if (streamedPositions.length > 1) {
          setMoves(evaluateMoves(game.moves.slice(0, streamedPositions.length - 1), streamedPositions, game.startFen));
        }
      },
      abort.signal,
    )
      .then((evaluations) => {
        if (abort.signal.aborted) return;
        setPositions(evaluations);
        setMoves(evaluateMoves(game.moves, evaluations, game.startFen));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setAnalysisError(error.message || "Stockfish analysis failed.");
      });

    return () => abort.abort();
  }, [game]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const interval = window.setInterval(() => {
      setCurrentPly((ply) => Math.min(ply + 1, game.moves.length));
    }, 850);
    return () => window.clearInterval(interval);
  }, [isPlaying, game.moves.length]);

  useEffect(() => {
    if (isPlaying && currentPly >= game.moves.length) setIsPlaying(false);
  }, [isPlaying, currentPly, game.moves.length]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loading = progress.total > 0 && progress.done < progress.total && !analysisError;
  const currentPosition = positions[currentPly];
  const currentFen = game.fens[currentPly] ?? game.startFen;
  const currentMove = moves[currentPly - 1];
  const candidateMove = currentPosition?.candidates?.[0];
  const recommendationMove =
    currentMove &&
    ["Inaccuracy", "Mistake", "Miss", "Blunder"].includes(currentMove.category) &&
    candidateMove?.uci &&
    !candidateMove.uci.startsWith(`${currentMove.from}${currentMove.to}`)
      ? candidateMove
      : null;
  const nextMove = game.moves[currentPly];
  const lastMove = game.moves[currentPly - 1];
  const toMove = currentFen.split(" ")[1] ?? "w";
  const scoreCp = currentPosition?.cp;
  const whiteScore = scoreCp == null ? null : (toMove === "w" ? scoreCp : -scoreCp);
  const finished = currentPly >= game.moves.length;
  const displayName = game.headers.White && game.headers.Black
    ? `${game.headers.White} — ${game.headers.Black}`
    : game.title || "Imported game";

  const chooseGame = (record) => {
    try {
      const imported = makeReviewGame(record.pgn, record);
      setGame(imported);
      setIsPlaying(false);
      setImportError("");
      setToast(`Loaded ${record.title ?? "game"} · Stockfish analysis started`);
    } catch (error) {
      setImportError(`Could not read this game: ${error.message}`);
    }
  };

  const loadPgn = (pgn, label = "Pasted PGN") => {
    try {
      const imported = makeReviewGame(pgn, { title: label, event: "Imported PGN" });
      setGame(imported);
      setPgnText(pgn);
      setIsPlaying(false);
      setImportError("");
      setToast("PGN loaded · Stockfish analysis started");
    } catch (error) {
      setImportError(`Could not parse PGN: ${error.message}`);
    }
  };

  const importFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pgn") && file.type !== "application/x-chess-pgn" && file.type !== "text/plain") {
      setImportError("Choose a .pgn or plain-text PGN file.");
      return;
    }
    try {
      loadPgn(await file.text(), file.name.replace(/\.pgn$/i, ""));
    } catch (error) {
      setImportError(`Could not read this file: ${error.message}`);
    }
  };

  const fetchArchives = async (event) => {
    event.preventDefault();
    const cleanName = username.trim();
    if (!cleanName) return;
    setImportBusy(true);
    setImportError("");
    setArchives([]);
    setChessGames([]);
    setSelectedArchive("");
    try {
      const response = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(cleanName)}/games/archives`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error(response.status === 404 ? "Chess.com username not found." : `Chess.com returned ${response.status}.`);
      const data = await response.json();
      const latest = (data.archives ?? []).slice(-6).reverse();
      if (!latest.length) throw new Error("No game archives were found for that player.");
      setArchives(latest);
      await fetchArchiveGames(latest[0], cleanName);
    } catch (error) {
      setImportError(error.message || "Unable to fetch Chess.com archives.");
    } finally {
      setImportBusy(false);
    }
  };

  const fetchArchiveGames = async (url, player = username.trim()) => {
    setSelectedArchive(url);
    setImportError("");
    setImportBusy(true);
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Could not load archive (${response.status}).`);
      const data = await response.json();
      const games = (data.games ?? [])
        .filter((record) => record.pgn)
        .slice()
        .reverse()
        .slice(0, 24)
        .map((record, index) => {
          const white = record.white?.username ?? "White";
          const black = record.black?.username ?? "Black";
          return {
            id: `chesscom-${record.end_time}-${index}`,
            title: `${white} vs ${black}`,
            subtitle: record.time_class ?? "Chess.com game",
            event: new Date((record.end_time ?? 0) * 1000).toLocaleDateString(),
            result: record.white?.result === "win" ? "1-0" : record.black?.result === "win" ? "0-1" : "½-½",
            pgn: record.pgn,
            url: record.url,
            player,
          };
        });
      setChessGames(games);
      if (!games.length) setImportError("No PGN games were available in this archive.");
    } catch (error) {
      setChessGames([]);
      setImportError(error.message || "Unable to load games from that archive.");
    } finally {
      setImportBusy(false);
    }
  };

  const activeCp = scoreCp;
  const goTo = (ply) => {
    setCurrentPly(Math.max(0, Math.min(game.moves.length, ply)));
  };

  const startReview = (source = activeSource, newReview = false) => {
    if (newReview) {
      setGame(makeEmptyReviewGame());
      setIsPlaying(false);
      setImportError("");
    }
    setActiveSource(source);
    setActivePage("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openHistoricGame = (record) => {
    chooseGame(record);
    startReview();
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand-home" onClick={() => { setActivePage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Endgame home"><Brand /></button>
          <nav className="top-nav" aria-label="Main navigation">
            <button className={activePage === "home" ? "nav-active" : ""} onClick={() => { setActivePage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Home</button>
            <button className={activePage === "review" ? "nav-active" : ""} onClick={() => startReview()}>Review</button>
            <button onClick={() => {
              if (activePage !== "home") setActivePage("home");
              window.setTimeout(() => document.getElementById("home-library")?.scrollIntoView({ behavior: "smooth" }), 0);
            }}>Game library</button>
          </nav>
          <div className="header-right">
            {activePage === "home" && <button className="header-cta" onClick={() => startReview("chesscom", true)}>Review a game <Icon name="arrow" size={14} /></button>}
            <div className="engine-pill"><span className="status-light" /> STOCKFISH 19 LITE</div>
          </div>
        </div>
      </header>

      {activePage === "home" ? (
        <HomeScreen onStartReview={() => startReview("chesscom", true)} onImportPgn={() => startReview("pgn", true)} onChooseGame={openHistoricGame} />
      ) : <main className="workspace" id="review">
          <section className="import-card">
            <div className="section-eyebrow"><span className="eyebrow-line" /> GAME IMPORT</div>
            <div className="source-tabs" role="tablist" aria-label="Import source">
              <button role="tab" aria-selected={activeSource === "chesscom"} className={activeSource === "chesscom" ? "source-active" : ""} onClick={() => setActiveSource("chesscom")}>Chess.com</button>
              <button role="tab" aria-selected={activeSource === "pgn"} className={activeSource === "pgn" ? "source-active" : ""} onClick={() => setActiveSource("pgn")}>PGN file</button>
            </div>
            {activeSource === "chesscom" ? (
              <div className="import-content">
                <form onSubmit={fetchArchives}>
                  <label className="field-label" htmlFor="chess-username">PLAYER USERNAME</label>
                  <div className="input-row">
                    <span className="input-at">@</span>
                    <input
                      id="chess-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="e.g. hikaru"
                      autoComplete="off"
                    />
                    <button className="square-button" disabled={importBusy || !username.trim()} aria-label="Find games">
                      {importBusy ? <span className="spinner" /> : <Icon name="arrow" size={16} />}
                    </button>
                  </div>
                </form>
                <p className="helper-text">Look up a username to browse their recent public games. No sign-in required.</p>
                {archives.length > 0 && (
                  <div className="archive-picker">
                    <label className="field-label" htmlFor="archive">MONTHLY ARCHIVE</label>
                    <select id="archive" value={selectedArchive} onChange={(event) => fetchArchiveGames(event.target.value)}>
                      {archives.map((url) => (
                        <option value={url} key={url}>{url.slice(-7).replace("/", " / ")}</option>
                      ))}
                    </select>
                    <div className="online-games">
                      {chessGames.map((record) => (
                        <button className="online-game" key={record.id} onClick={() => chooseGame(record)}>
                          <span className="online-game-main">{record.title}</span>
                          <span className="online-game-meta">{record.event} · {record.subtitle} <Icon name="chevron" size={13} /></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {importBusy && <div className="inline-status"><span className="spinner" /> Fetching public games…</div>}
                {importError && <p className="error-text">{importError}</p>}
              </div>
            ) : (
              <div className="import-content">
                <div
                  className={`drop-zone ${dragging ? "drop-zone-active" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    importFile(event.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInput.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => { if (event.key === "Enter") fileInput.current?.click(); }}
                >
                  <div className="drop-icon"><Icon name="upload" size={20} /></div>
                  <div><strong>Drop a PGN file</strong><span>or click to browse · .pgn, .txt</span></div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pgn,.txt,text/plain,application/x-chess-pgn"
                    hidden
                    onChange={(event) => importFile(event.target.files?.[0])}
                  />
                </div>
                <label className="field-label pgn-label" htmlFor="pgn-text">OR PASTE PGN</label>
                <textarea
                  id="pgn-text"
                  className="pgn-input"
                  placeholder={'[Event "Casual Game"]\n\n1. e4 e5 2. Nf3 Nc6 ...'}
                  value={pgnText}
                  onChange={(event) => setPgnText(event.target.value)}
                />
                <button className="primary-button import-pgn" disabled={!pgnText.trim()} onClick={() => loadPgn(pgnText)}>
                  Analyze game <Icon name="arrow" size={15} />
                </button>
                {importError && <p className="error-text">{importError}</p>}
              </div>
            )}
          </section>

        <section className="review-area">
          <div className="game-heading">
            <div className="game-heading-copy">
              <div className="game-kicker">
                {game.event || game.headers.Event || (game.moves.length ? "GAME REVIEW" : "READY TO REVIEW")}
                {(game.headers.Date || game.headers.ECO) && <span className="kicker-dot"> · {[game.headers.Date, game.headers.ECO].filter(Boolean).join(" · ")}</span>}
              </div>
              <h1>{displayName}</h1>
              <div className="game-tags">
                {(game.headers.Result || game.result) && <span className="result-tag">{game.headers.Result || game.result}</span>}
                {game.moves.length > 0 && <span>{Math.ceil(game.moves.length / 2)} moves</span>}
                {game.moves.length > 0 && <span className="stockfish-tag"><span className="status-light" /> Stockfish 19 Lite</span>}
              </div>
            </div>
            {game.url && (
              <a className="game-link" href={game.url} target="_blank" rel="noreferrer">
                Original game <Icon name="external" size={14} />
              </a>
            )}
          </div>

          <div className="board-layout">
            <div className="board-section">
              <div className="board-top-labels">
                <span className="player-token black-token">♚</span>
                <div><strong>{game.headers.Black || "Black"}</strong>{game.headers.BlackElo && <span>Rating {game.headers.BlackElo}</span>}</div>
                {game.headers.TimeControl && <span className="player-clock">{game.headers.TimeControl}</span>}
              </div>
              <div className="board-and-eval">
                <Chessboard
                  fen={currentFen}
                  lastMove={lastMove}
                  nextMove={nextMove}
                  engineMove={recommendationMove}
                  moveMarker={currentMove}
                  endingMarker={finished ? getEndingMarker(game) : null}
                  onSquareClick={(direction) => goTo(currentPly + (direction === "next" ? 1 : -1))}
                />
                <EvaluationBar cp={activeCp} sideToMove={toMove} />
              </div>
              <div className="board-bottom-labels">
                <span className="player-token white-token">♔</span>
                <div><strong>{game.headers.White || "White"}</strong>{game.headers.WhiteElo && <span>Rating {game.headers.WhiteElo}</span>}</div>
                {game.headers.TimeControl && <span className="player-clock">{game.headers.TimeControl}</span>}
              </div>
              <div className="board-controls">
                <div className="control-group">
                  <button className="control-button" onClick={() => goTo(0)} disabled={currentPly === 0} title="First move"><Icon name="first" size={17} /></button>
                  <button className="control-button" onClick={() => goTo(currentPly - 1)} disabled={currentPly === 0} title="Previous move"><Icon name="prev" size={17} /></button>
                  <button className="control-play" onClick={() => {
                    if (finished) goTo(0);
                    setIsPlaying((playing) => !playing);
                  }} title={isPlaying ? "Pause autoplay" : "Autoplay"}>
                    <Icon name={isPlaying ? "pause" : "play"} size={16} />
                  </button>
                  <button className="control-button" onClick={() => goTo(currentPly + 1)} disabled={finished} title="Next move"><Icon name="next" size={17} /></button>
                  <button className="control-button" onClick={() => goTo(game.moves.length)} disabled={finished} title="Last move"><Icon name="last" size={17} /></button>
                </div>
                <div className="ply-position">
                  <span>{currentPly === 0 ? "START" : `${Math.ceil(currentPly / 2)}${currentPly % 2 ? "..." : "."}`}</span>
                  <span>{currentPly} / {game.moves.length}</span>
                </div>
              </div>
              <div className="board-hint">
                {recommendationMove
                  ? <>Played: <strong>{currentMove.san}</strong> · Suggested: <strong>{recommendationMove.move}</strong>.</>
                  : currentMove
                    ? <>Played: <strong>{currentMove.san}</strong>.</>
                    : "Select a move from the list to inspect its position."}
              </div>
              {finished && game.learning && (
                <section className="game-learning" aria-live="polite">
                  <div className="section-eyebrow"><span className="eyebrow-line" /> THE GAME'S TAKEAWAY</div>
                  <h2>One thing to remember</h2>
                  <p>{game.learning}</p>
                </section>
              )}
            </div>

            <aside className="move-panel">
              <section className="move-explanation">
                <div className="section-eyebrow"><span className="eyebrow-line" /> MOVE EXPLANATION</div>
                <h2>Why it matters</h2>
                <Commentary move={currentMove} loading={loading} />
              </section>
              <div className="panel-heading">
                <div><div className="section-eyebrow"><span className="eyebrow-line" /> GAME MOVES</div><h2>Move list</h2></div>
                <span className="moves-total">{game.moves.length} ply</span>
              </div>
              <div className="move-list-wrap">
                <MoveList moves={moves} currentPly={currentPly} onSelect={goTo} />
                {moves.length === 0 && !analysisError && (
                  <div className="moves-placeholder">
                    {game.moves.length === 0 ? "Import a game to see its moves." : <><span className="loading-dot" />{loading ? `Analyzing ${progress.done} of ${progress.total} positions` : "Preparing review"}</>}
                  </div>
                )}
              </div>
              {analysisError && (
                <div className="analysis-error">
                  <strong>Stockfish could not complete the analysis.</strong>
                  <span>{analysisError}</span>
                  <button onClick={() => setGame({ ...game })}>Retry analysis</button>
                </div>
              )}
              <div className="legend">
                {Object.keys(BADGES).map((category) => (
                  <div className="legend-item" key={category}>
                    <div className="legend-heading">
                      <MoveBadge category={category} compact />
                      <span className="legend-name">{BADGES[category].label ?? category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="analysis-grid">
            <section className="analysis-card graph-card">
              <div className="card-title-row">
                <div><div className="section-eyebrow"><span className="eyebrow-line" /> POSITION EVALUATION</div><h2>Momentum</h2></div>
                <div className="position-summary">
                  {game.moves.length === 0 ? "Load a game to see its evaluation" : whiteScore == null ? "Building position assessment…" : describePosition(whiteScore)}
                </div>
              </div>
              {positions.length > 0 ? (
                <EvaluationGraph positions={positions} fens={game.fens} currentPly={currentPly} onSelect={goTo} />
              ) : game.moves.length === 0 ? (
                <div className="graph-loading">Import a game to see its evaluation.</div>
              ) : (
                <div className="graph-loading"><span className="loading-dot" />{analysisError ? "No engine evaluations available" : `Building evaluation graph ${progress.done}/${progress.total}`}</div>
              )}
              <div className="graph-footer"><span>WHITE ADVANTAGE <span>↑</span></span><span>MOVE NUMBER <span>→</span></span></div>
            </section>
          </div>

          <footer className="workspace-footer">
            <span><span className="status-light" /> {game.moves.length === 0 ? "Choose a game to begin" : loading ? `Analyzing position ${progress.done} of ${progress.total}` : analysisError ? "Engine unavailable" : "Analysis complete"}</span>
            <span>Stockfish 19 Lite · Depth 20 · Analysis runs in your browser</span>
          </footer>
        </section>
      </main>}
      {toast && <div className="toast"><span className="status-light" />{toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
