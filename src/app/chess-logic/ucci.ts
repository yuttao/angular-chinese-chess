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

let North = [-1, 0]
let South = [1, 0]
let West = [0, -1]
let East = [0, 1]
let NorthEast = [-1, 1]
let NorthWest = [-1, 1]

function isPositionValid(p: [number, number]): boolean {
  return p[0] >= 0 && p[0] <= 9 && p[1] >= 0 && p[1] <= 8
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

  getPiece(p: [number, number]) {
    return this.matrix[p[0]][p[1]]
  }

  // get valid moves for a King
  getKingMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let x = p[0], y = p[1]
    let piece = this.matrix[x][y]
    let team = piece & Player.MASK
    for (let d of [North, South, East, West]) {
      let r = x + d[0], c = y + d[1]
      if (c >= 3 && c <= 5) {
        if (team === Player.WHITE && r >= 7 || team === Player.BLACK && r <= 2) {
          if ((this.matrix[r][c] & Player.MASK) != team) {
            ret.push([r, c])
          }
        }
      }
    }
    let d = team == Player.WHITE ? North : South
    for (let r = x + d[0], c = y + d[1]; isPositionValid([r, c]); r += d[0], c += d[1]) {
      let code = this.matrix[r][c]
      if (code != 0) {
        if ((code & Piece.MASK) == Piece.K) {
          ret.push([r, c])
        }
        break;
      }
    }
    return ret
  }

  // get valid moves for a Rook
  getRookMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let x = p[0], y = p[1]
    let piece = this.matrix[x][y]
    let team = piece & Player.MASK
    for (let d of [North, South, East, West]) {
      for (let r = x + d[0], c = y + d[1]; isPositionValid([r, c]); r += d[0], c += d[1]) {
        if (this.matrix[r][c] == 0) {
          ret.push([r, c])
        } else {
          if ((this.matrix[r][c] & Player.MASK) !== team) {
            ret.push([r, c])
          }
          break
        }
      }
    }
    return ret
  }

  // get all the possible moves for a Canon
  getCanonMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let x = p[0], y = p[1]
    let piece = this.matrix[x][y]
    let team = piece & Player.MASK
    for (let d of [North, South, East, West]) {
      let jumped = false
      for (let r = x + d[0], c = y + d[1]; isPositionValid([r, c]); r += d[0], c += d[1]) {
        if (jumped === false) {
          if (this.matrix[r][c] === 0) {
            ret.push([r, c])
          } else {
            r += d[0]
            c += d[1]
            jumped = true
          }
        } else if ((this.matrix[r][c] & Player.MASK) !== team) {
          ret.push([r, c])
          break
        }
      }
    }
    return ret
  }

  // return the possible moves for a Knight
  getKnightMoves(p: [number, number]): [number, number][] {
    let can: [number, number][] = []
    let x = p[0], y = p[1]
    let piece = this.matrix[x][y]
    let team = piece & Player.MASK
    for (let d of [North, West, South, East]) {
      let r = x + d[0], c = y + d[1];
      if (isPositionValid([r, c]) && this.matrix[r][c] == 0) {
        can.push([r + d[0] + d[1], c + d[1] + d[0]])
        can.push([r + d[0] - d[1], c + d[1] - d[0]])
      }
    }
    let ret: [number, number][] = []
    for (let c of can) {
      if (isPositionValid(c) && (this.getPiece(c) & Player.MASK) !== team) {
        ret.push(c)
      }
    }
    return ret
  }
}