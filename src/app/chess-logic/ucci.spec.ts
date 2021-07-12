import { Ucci, Player } from "./ucci"

describe("It should read and write FEN string correctly", function () {
  var ucci: Ucci = new Ucci()

  it("should create string to number map correctly", function () {
    let out: Map<String, number> = new Map()
    out.set(' ', 0o00)
    out.set('K', 0o11)
    out.set('A', 0o12)
    out.set('B', 0o13)
    out.set('R', 0o14)
    out.set('N', 0o15)
    out.set('C', 0o16)
    out.set('P', 0o17)
    out.set('k', 0o21)
    out.set('a', 0o22)
    out.set('b', 0o23)
    out.set('r', 0o24)
    out.set('n', 0o25)
    out.set('c', 0o26)
    out.set('p', 0o27)
    expect(ucci.l2n).toEqual(out)
  });

  it("should create number to string map correctly", function () {
    let out: Map<number, String> = new Map()
    out.set(0o00, ' ')
    out.set(0o11, 'K')
    out.set(0o12, 'A')
    out.set(0o13, 'B')
    out.set(0o14, 'R')
    out.set(0o15, 'N')
    out.set(0o16, 'C')
    out.set(0o17, 'P')
    out.set(0o21, 'k')
    out.set(0o22, 'a')
    out.set(0o23, 'b')
    out.set(0o24, 'r')
    out.set(0o25, 'n')
    out.set(0o26, 'c')
    out.set(0o27, 'p')
    expect(ucci.n2l).toEqual(out)
  });

  it("should read initial FEN correctly", function () {
    ucci.readFEN("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR");
    let out: number[][] =
      [[20, 21, 19, 18, 17, 18, 19, 21, 20],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 22, 0, 0, 0, 0, 0, 22, 0],
      [23, 0, 23, 0, 23, 0, 23, 0, 23],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [15, 0, 15, 0, 15, 0, 15, 0, 15],
      [0, 14, 0, 0, 0, 0, 0, 14, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [12, 13, 11, 10, 9, 10, 11, 13, 12]]
    expect(ucci.matrix).toEqual(out);
  });

  it("should write initial FEN correctly", function () {
    ucci.matrix =
      [[20, 21, 19, 18, 17, 18, 19, 21, 20],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 22, 0, 0, 0, 0, 0, 22, 0],
      [23, 0, 23, 0, 23, 0, 23, 0, 23],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [15, 0, 15, 0, 15, 0, 15, 0, 15],
      [0, 14, 0, 0, 0, 0, 0, 14, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [12, 13, 11, 10, 9, 10, 11, 13, 12]];
    let fen = ucci.writeFEN()
    expect(fen).toEqual("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR")
  });

  it("should get pieces of a team correctly", function () {
    ucci.matrix =
      [[20, 21, 19, 18, 17, 18, 19, 21, 20],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 22, 0, 0, 0, 0, 0, 22, 0],
      [23, 0, 23, 0, 23, 0, 23, 0, 23],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [15, 0, 15, 0, 15, 0, 15, 0, 15],
      [0, 14, 0, 0, 0, 0, 0, 14, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [12, 13, 11, 10, 9, 10, 11, 13, 12]];
    let whitePieces = ucci.getTeam(Player.WHITE)
    expect(whitePieces).toEqual([[6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
    [7, 1], [7, 7], [9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6],
    [9, 7], [9, 8]])
    let blackPieces = ucci.getTeam(Player.BLACK)
    expect(blackPieces).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    [0, 5], [0, 6], [0, 7], [0, 8], [2, 1], [2, 7], [3, 0], [3, 2],
    [3, 4], [3, 6], [3, 8]])
  });
});