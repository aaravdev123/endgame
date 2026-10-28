export const historicGames = [
  {
    id: "opera",
    title: "The Opera Game",
    subtitle: "Morphy vs. Duke Karl / Count Isouard",
    event: "Paris Opera House · 1858",
    result: "1-0",
    learning: "Develop quickly and connect your rooks before launching an attack. Morphy's active pieces made the king hunt possible even after he sacrificed material.",
    pgn: `[Event "Paris Opera House"]
[Site "Paris, France"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5
6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5
11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6
15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    id: "immortal",
    title: "Kasparov's Immortal",
    subtitle: "Kasparov vs. Topalov",
    event: "Hoogovens · 1999",
    result: "1-0",
    learning: "When the king is exposed, calculate forcing checks and captures before settling for a quiet move. Kasparov kept the initiative alive through a long sequence of tactical threats.",
    pgn: `[Event "Hoogovens"]
[Site "Wijk aan Zee, Netherlands"]
[Date "1999.01.20"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6
6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5
11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4
15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8
19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5
23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5
27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4
31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2
35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4
39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5
43. Kc1 Rd2 44. Qa7 1-0`,
  },
  {
    id: "fischer-spassky",
    title: "Game 6",
    subtitle: "Fischer vs. Spassky",
    event: "World Championship · 1972",
    result: "1-0",
    learning: "A space advantage matters most when you can use it to create a passed pawn or open a file. Fischer's central pawn advance gave his pieces targets and routes into Black's position.",
    pgn: `[Event "World Championship Match"]
[Site "Reykjavik, Iceland"]
[Date "1972.07.23"]
[White "Robert James Fischer"]
[Black "Boris Spassky"]
[Result "1-0"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O
6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7
10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8
14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7
18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7
22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5
26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7
30. h4 Rc8 31. e6 Qc7 32. Qxc7 Rexc7 33. Rd5 Nf6
34. Rd6 Rb7 35. Rc6 Ne4 36. Rf4 Nf6 37. Rxc5 Ra7
38. a4 h5 39. Rff5 Kh7 40. Rxa5 Rxa5 41. Rxa5 1-0`,
  },
  {
    id: "immortal-game",
    title: "The Immortal Game",
    subtitle: "Anderssen vs. Kieseritzky",
    event: "London · 1851",
    result: "1-0",
    learning: "Material is only one part of the position. Anderssen gave up major pieces to keep tempi, open lines, and bring every remaining piece into the attack.",
    pgn: `[Event "The Immortal Game"]
[Site "London, England"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6
6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6
11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8
15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1
19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6
23. Be7# 1-0`,
  },
  {
    id: "evergreen",
    title: "The Evergreen Game",
    subtitle: "Anderssen vs. Dufresne",
    event: "Berlin · 1852",
    result: "1-0",
    learning: "A sacrifice is strongest when it comes with forced tempo. Anderssen's attack works because checks and threats keep Black from coordinating a defense.",
    pgn: `[Event "The Evergreen Game"]
[Site "Berlin, Germany"]
[Date "1852.??.??"]
[White "Adolf Anderssen"]
[Black "Jean Dufresne"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5
6. d4 exd4 7. O-O d3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7
11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7
15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8
19. Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7
22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# 1-0`,
  },
  {
    id: "game-of-century",
    title: "The Game of the Century",
    subtitle: "Byrne vs. Fischer",
    event: "New York · 1956",
    result: "0-1",
    learning: "Before taking a queen, count what the opponent gets in return and check whether your king is safe. Fischer's queen sacrifice unleashed a coordinated attack by his minor pieces.",
    pgn: `[Event "Rosenwald Memorial"]
[Site "New York, USA"]
[Date "1956.10.17"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[Result "0-1"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5
6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4
11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6
15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+
19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+
23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2
27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5
31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7
35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+
39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`,
  },
  {
    id: "rotlewi-rubinstein",
    title: "Rubinstein's Immortal",
    subtitle: "Rotlewi vs. Rubinstein",
    event: "Łódź · 1907",
    result: "0-1",
    learning: "Look for overloaded defenders before sacrificing. Rubinstein's combination works because one piece cannot guard the king, queen, and mating squares at once.",
    pgn: `[Event "Lodz Chess Club"]
[Site "Lodz, Poland"]
[Date "1907.12.26"]
[White "Gersz Rotlewi"]
[Black "Akiba Rubinstein"]
[Result "0-1"]

1. d4 d5 2. Nf3 e6 3. e3 c5 4. c4 Nc6 5. Nc3 Nf6
6. dxc5 Bxc5 7. a3 a6 8. b4 Bd6 9. Bb2 O-O 10. Qd2 Qe7
11. Bd3 dxc4 12. Bxc4 b5 13. Bd3 Rd8 14. Qe2 Bb7
15. O-O Ne5 16. Nxe5 Bxe5 17. f4 Bc7 18. e4 Rac8
19. e5 Bb6+ 20. Kh1 Ng4 21. Be4 Qh4 22. g3 Rxc3
23. gxh4 Rd2 24. Qxd2 Bxe4+ 25. Qg2 Rh3 26. Rf3 Bxf3
27. Rf1 Rxh2# 0-1`,
  },
  {
    id: "lasker-bauer",
    title: "The Double Bishop Sacrifice",
    subtitle: "Lasker vs. Bauer",
    event: "Amsterdam · 1889",
    result: "1-0",
    learning: "A bishop sacrifice on h7 or h2 is not a recipe by itself. Lasker's follow-up uses forcing checks and active pieces to make the sacrifice work.",
    pgn: `[Event "Amsterdam"]
[Site "Amsterdam, Netherlands"]
[Date "1889.08.??"]
[White "Emanuel Lasker"]
[Black "Johann Hermann Bauer"]
[Result "1-0"]

1. f4 d5 2. e3 Nf6 3. b3 e6 4. Bb2 Be7 5. Bd3 b6
6. Nc3 Bb7 7. Nf3 Nbd7 8. O-O O-O 9. Ne2 c5 10. Ng3 Qc7
11. Ne5 Nxe5 12. Bxe5 Qc6 13. Qe2 a6 14. Nh5 Nxh5
15. Bxh7+ Kxh7 16. Qxh5+ Kg8 17. Bxg7 Kxg7 18. Qg4+ Kh7
19. Rf3 e5 20. Rh3+ Qh6 21. Rxh6+ Kxh6 22. Qd7 Bf6
23. Qxb7 Kg7 24. Rf1 Rab8 25. Qd7 Rfd8 26. Qg4+ Kf8
27. fxe5 Bg7 28. e6 Rb7 29. Qg6 f6 30. Rxf6+ Bxf6
31. Qxf6+ Ke8 32. Qh8+ Ke7 33. Qg7+ Kxe6
34. Qxb7 Rd6 35. Qxa6 d4 36. exd4 cxd4 37. h4 d3
38. Qxd3 1-0`,
  },
  {
    id: "immortal-draw",
    title: "The Immortal Draw",
    subtitle: "Hamppe vs. Meitner",
    event: "Vienna · 1872",
    result: "½-½",
    learning: "When defending a dangerous king attack, perpetual check can be a resource. Meitner's queen sacrifice leads to a repeating check sequence that saves a position with far less material.",
    pgn: `[Event "Vienna"]
[Site "Vienna, Austria"]
[Date "1872.??.??"]
[White "Carl Hamppe"]
[Black "Philipp Meitner"]
[Result "1/2-1/2"]

1. e4 e5 2. Nc3 Bc5 3. Na4 Bxf2+ 4. Kxf2 Qh4+
5. Ke3 Qf4+ 6. Kd3 d5 7. Kc3 Qxe4 8. Kb3 Na6
9. a3 Qxa4+ 10. Kxa4 Nc5+ 11. Kb4 a5+ 12. Kxc5 Ne7
13. Bb5+ Kd8 14. Bc6 b6+ 15. Kb5 Nxc6 16. Kxc6 Bb7+
17. Kb5 Ba6+ 18. Kc6 Bb7+ 1/2-1/2`,
  },
  {
    id: "levitsky-marshall",
    title: "Marshall's Queen Offer",
    subtitle: "Levitsky vs. Marshall",
    event: "Breslau · 1912",
    result: "0-1",
    learning: "A queen that appears en prise may be tactically untouchable. Before accepting a sacrifice, check every capture for a forcing check, fork, or mating net.",
    pgn: `[Event "DSB Congress"]
[Site "Breslau, Germany"]
[Date "1912.07.??"]
[White "Stepan Levitsky"]
[Black "Frank Marshall"]
[Result "0-1"]

1. d4 e6 2. e4 d5 3. Nc3 c5 4. Nf3 Nc6 5. exd5 exd5
6. Be2 Nf6 7. O-O Be7 8. Bg5 O-O 9. dxc5 Be6
10. Nd4 Bxc5 11. Nxe6 fxe6 12. Bg4 Qd6 13. Bh3 Rae8
14. Qd2 Bb4 15. Bxf6 Rxf6 16. Rad1 Qc5 17. Qe2 Bxc3
18. bxc3 Qxc3 19. Rxd5 Nd4 20. Qh5 Ref8 21. Re5 Rh6
22. Qg5 Rxh3 23. Rc5 Qg3 0-1`,
  },
  {
    id: "legals-mate",
    title: "Légal's Mate",
    subtitle: "Légal vs. Saint Brie",
    event: "Paris · c. 1750",
    result: "1-0",
    learning: "A pinned piece may still be tactically usable when the opponent's king is vulnerable. Légal ignores the apparent pin and wins with a forcing queen sacrifice and a knight mate.",
    pgn: `[Event "Légal's Mate"]
[Site "Paris, France"]
[Date "1750.??.??"]
[White "Sire de Légal"]
[Black "Saint Brie"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6
5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0`,
  },
  {
    id: "lasker-thomas",
    title: "The King Hunt",
    subtitle: "Edward Lasker vs. Thomas",
    event: "London · 1912",
    result: "1-0",
    learning: "A king hunt can justify a queen sacrifice when each check forces the king onto a more dangerous square. Lasker's pieces keep the chase coordinated until the king joins the final mate.",
    pgn: `[Event "London"]
[Site "London, England"]
[Date "1912.??.??"]
[White "Edward Lasker"]
[Black "George Thomas"]
[Result "1-0"]

1. d4 f5 2. Nf3 e6 3. Nc3 Nf6 4. Bg5 Be7 5. Bxf6 Bxf6
6. e4 fxe4 7. Nxe4 b6 8. Ne5 O-O 9. Bd3 Bb7
10. Qh5 Qe7 11. Qxh7+ Kxh7 12. Nxf6+ Kh6 13. Neg4+ Kg5
14. h4+ Kf4 15. g3+ Kf3 16. Be2+ Kg2 17. Rh2+ Kg1
18. Kd2# 1-0`,
  },
  {
    id: "napoleon-madame",
    title: "Napoleon's Miniature",
    subtitle: "Napoleon vs. Countess",
    event: "Paris · c. 1809",
    result: "1-0",
    learning: "A fast queen attack only works when it is supported by development. This miniature shows the danger of leaving f7 weak while the king and pieces are still on their starting squares.",
    pgn: `[Event "Napoleon's Chess Game"]
[Site "Paris, France"]
[Date "1809.??.??"]
[White "Napoleon Bonaparte"]
[Black "Madame de Remusat"]
[Result "1-0"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0`,
  },
];
