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

let North: [number, number] = [-1, 0]
let South: [number, number] = [1, 0]
let West: [number, number] = [0, -1]
let East: [number, number] = [0, 1]
let NorthEast: [number, number] = [-1, 1]
let NorthWest: [number, number] = [-1, -1]
let SouthEast: [number, number] = [1, 1]
let SouthWest: [number, number] = [1, -1]

// check if the position is within the chess board
function isPositionValid(p: [number, number]): boolean {
  return p[0] >= 0 && p[0] <= 9 && p[1] >= 0 && p[1] <= 8
}

function isInPalace(p: [number, number], t: Player): boolean {
  if (p[1] < 3 || p[1] > 5) {
    return false
  }
  if (t === Player.BLACK && p[0] >= 0 && p[0] <= 2) {
    return true
  }
  if (t === Player.WHITE && p[0] >= 7 && p[0] <= 9) {
    return true
  }
  return false
}

// add a position and a step
function add(p: [number, number], s: [number, number]): [number, number] {
  return [p[0] + s[0], p[1] + s[1]]
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

  // get the piece of a position, need to ensure that the position is valid
  get(p: [number, number]): number {
    return this.matrix[p[0]][p[1]]
  }

  // get valid moves for a King
  getKingMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let piece = this.get(p)
    let team = piece & Player.MASK
    for (let d of [North, South, East, West]) {
      let r = p[0] + d[0], c = p[1] + d[1]
      if (c >= 3 && c <= 5) {
        if (team === Player.WHITE && r >= 7 || team === Player.BLACK && r <= 2) {
          if ((this.matrix[r][c] & Player.MASK) != team) {
            ret.push([r, c])
          }
        }
      }
    }
    let d = team == Player.WHITE ? North : South
    for (let r = p[0] + d[0], c = p[1] + d[1]; isPositionValid([r, c]); r += d[0], c += d[1]) {
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
    let team = this.get(p) & Player.MASK
    for (let d of [North, South, East, West]) {
      for (let t = add(p, d); isPositionValid(t); t = add(t, d)) {
        if (this.get(t) == 0) {
          ret.push(t)
        } else {
          if ((this.get(t) & Player.MASK) !== team) {
            ret.push(t)
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
    let team = this.get(p) & Player.MASK
    for (let d of [North, South, East, West]) {
      let jumped = false
      for (let t = add(p, d); isPositionValid(t); t = add(t, d)) {
        if (jumped === false) {
          if (this.get(t) === 0) {
            ret.push(t)
          } else {
            t = add(t, d)
            jumped = true
          }
        } else if ((this.get(t) & Player.MASK) !== team) {
          ret.push(t)
          break
        }
      }
    }
    return ret
  }

  // return the possible moves for a Knight
  getKnightMoves(p: [number, number]): [number, number][] {
    let can: [number, number][] = []
    let team = this.get(p) & Player.MASK
    for (let d of [North, West, South, East]) {
      let t = add(p, d)
      if (isPositionValid(t) && this.get(t) == 0) {
        let t1 = add(t, d)
        can.push(add(t1, [d[1], d[0]]))
        can.push(add(t1, [-d[1], -d[0]]))
      }
    }
    let ret: [number, number][] = []
    for (let c of can) {
      if (isPositionValid(c) && (this.get(c) & Player.MASK) !== team) {
        ret.push(c)
      }
    }
    return ret
  }

  // get all valid moves for an Advisor
  getAdvisorMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let team = this.get(p) & Player.MASK
    for (let d of [NorthEast, NorthWest, SouthEast, SouthWest]) {
      let t = add(p, d)
      if (isInPalace(t, team) && (this.get(t) & Player.MASK) !== team) {
        ret.push(t)
      }
    }
    return ret
  }

  // get all valid moves for a Bishop
  getBishopMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let team = this.get(p) & Player.MASK
    for (let d of [NorthEast, NorthWest, SouthEast, SouthWest]) {
      let t1 = add(p,d)
      if (team === Player.BLACK && t1[0] > 4 || team == Player.WHITE && t1[0] < 5) {
        continue // Bishop cannot cross the river
      }
      if (isPositionValid(t1) && this.get(t1) === 0) {
        let t2 = add(t1, d)
        if (isPositionValid(t2) && (this.get(t2) & Player.MASK) !== team) {
          ret.push(t2)
        }
      }
    }
    return ret
  }

  // get all valid moves for a Pawn
  getPawnMoves(p:[number,number]):[number, number][] {
    let ret: [number,number][] = []
    let team = this.get(p) & Player.MASK
    let direct = team === Player.WHITE ? [North] : [South]
    if (team == Player.WHITE && p[0] <= 4 || team == Player.BLACK && p[1] >=5) {
      direct.push(East)
      direct.push(West)
    }
    for (let d of direct) {
      let t = add(p, d)
      if (isPositionValid(t) && (this.get(t) & Player.MASK) != team) {
        ret.push(t)
      }
    }
    return ret
  }
}

