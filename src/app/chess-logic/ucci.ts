// the type of the chess piece
export enum Piece {
  E = 0, // empty piece
  K = 1, // king
  A = 2, // advisor
  B = 3, // bishop
  R = 4, // rook
  N = 5, // knight
  C = 6, // canon
  P = 7, // pawn
  MASK = 7 // mask
}

// the type of the 
export enum Player {
  E = 0, // empty
  WHITE = 0o10, // white player
  BLACK = 0o20, // black player
  MASK = 0o30 // mask
}

export class Ucci {
  matrix: number[][] = []
  l2n: Map<String, number> = new Map()
  n2l: Map<number, String> = new Map()

  // initialize the maps
  constructor() {
    this.l2n.set(' ', Piece.E | Player.E)
    this.l2n.set('K', Piece.K | Player.WHITE)
    this.l2n.set('A', Piece.A | Player.WHITE)
    this.l2n.set('B', Piece.B | Player.WHITE)
    this.l2n.set('R', Piece.R | Player.WHITE)
    this.l2n.set('N', Piece.N | Player.WHITE)
    this.l2n.set('C', Piece.C | Player.WHITE)
    this.l2n.set('P', Piece.P | Player.WHITE)
    this.l2n.set('k', Piece.K | Player.BLACK)
    this.l2n.set('a', Piece.A | Player.BLACK)
    this.l2n.set('b', Piece.B | Player.BLACK)
    this.l2n.set('r', Piece.R | Player.BLACK)
    this.l2n.set('n', Piece.N | Player.BLACK)
    this.l2n.set('c', Piece.C | Player.BLACK)
    this.l2n.set('p', Piece.P | Player.BLACK)
    for (let p of this.l2n) {
      this.n2l.set(p[1], p[0])
    }
  }

  // Read the chess board state from a FEN string
  readFEN(fen: string): boolean {
    let lines = fen.split('/')
    if (lines.length < 10) {
      return false
    }
    let mat: number[][] = []
    for (let i = 0; i <= 9; i++) {
      let row: number[] = []
      let line = lines[i]
      for (let k = 0; k < line.length; k++) {
        let c = line[k]
        if (c >= '1' && c <= '9') {
          for (let j = 0; j < Number(c); j++) {
            row.push(0)
          }
        } else {
          let mask = this.l2n.get(c)
          if (mask != undefined) {
            row.push(mask)
          } else {
            return false
          }
        }
      }
      mat.push(row)
    }
    this.matrix = mat
    return true
  }

  // write the chess state into a FEN string
  writeFEN(): string {
    let lines: string[] = []
    for (let row of this.matrix) {
      let line: string = ""
      let i = 0
      while (i < 9) {
        if (row[i] == 0) {
          let count = 0
          while (i < 9 && row[i] == 0) {
            count++
            i++
          }
          line += count
        } else {
          let c = this.n2l.get(row[i])
          if (c != undefined) {
            line += c
          }
          i++
        }
      }
      lines.push(line)
    }
    return lines.join('/')
  }

  getTeam(p: Player): [number, number][] {
    let ret: [number, number][] = []
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 8; j++) {
        if ((this.matrix[i][j] & Player.MASK) === p) {
          ret.push([i, j])
        }
      }
    }
    return ret
  }

  // get valid moves for king
  getKingMoves(p: [number, number]) {

  }
}