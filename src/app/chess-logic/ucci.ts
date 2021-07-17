// the type of the chess piece
export enum Piece {
  EMPTY = 0, // empty piece
  KING = 1, // king
  ADVISOR = 2, // advisor
  BISHOP = 3, // bishop
  ROOK = 4, // rook
  KNIGHT = 5, // knight
  CANON = 6, // canon
  PAWN = 7, // pawn
  MASK = 7 // mask
}

// the type of the player
export enum Player {
  EMPTY = 0, // empty
  WHITE = 0o10, // white player
  BLACK = 0o20, // black player
  MASK = 0o30 // mask
}

let EMPTY: number = Player.EMPTY | Piece.EMPTY

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
  if (t == Player.BLACK && p[0] >= 0 && p[0] <= 2) {
    return true
  }
  if (t == Player.WHITE && p[0] >= 7 && p[0] <= 9) {
    return true
  }
  return false
}

// add a position and a step
function add(p: [number, number], s: [number, number]): [number, number] {
  return [p[0] + s[0], p[1] + s[1]]
}

// absolution value
function diff(a: number, b: number): number {
  let d = a - b
  if (d < 0) {
    return -d
  }
  return d
}

function abs(a: [number, number], b: [number, number]): [number, number] {
  return [diff(a[0], b[0]), diff(a[1], b[1])]
}
export class Ucci {
  matrix: number[][] = []
  l2n: Map<String, number> = new Map()
  n2l: Map<number, String> = new Map()

  // initialize the maps
  constructor() {
    this.l2n.set(' ', Piece.EMPTY | Player.EMPTY)
    this.l2n.set('K', Piece.KING | Player.WHITE)
    this.l2n.set('A', Piece.ADVISOR | Player.WHITE)
    this.l2n.set('B', Piece.BISHOP | Player.WHITE)
    this.l2n.set('R', Piece.ROOK | Player.WHITE)
    this.l2n.set('N', Piece.KNIGHT | Player.WHITE)
    this.l2n.set('C', Piece.CANON | Player.WHITE)
    this.l2n.set('P', Piece.PAWN | Player.WHITE)
    this.l2n.set('k', Piece.KING | Player.BLACK)
    this.l2n.set('a', Piece.ADVISOR | Player.BLACK)
    this.l2n.set('b', Piece.BISHOP | Player.BLACK)
    this.l2n.set('r', Piece.ROOK | Player.BLACK)
    this.l2n.set('n', Piece.KNIGHT | Player.BLACK)
    this.l2n.set('c', Piece.CANON | Player.BLACK)
    this.l2n.set('p', Piece.PAWN | Player.BLACK)
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
        if ((this.matrix[i][j] & Player.MASK) == p) {
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
      let t = add(p, d)
      if (isInPalace(t, team) && (this.get(t) & Player.MASK) != team) {
        ret.push(t)
      }
    }
    let d = team == Player.WHITE ? North : South
    for (let t = add(p, d); isPositionValid(t); t = add(t, d)) {
      let code = this.get(t)
      if (code != EMPTY) {
        if ((code & Piece.MASK) == Piece.KING) {
          ret.push(t)
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
        if (this.get(t) == EMPTY) {
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
        if (jumped == false) {
          if (this.get(t) == EMPTY) {
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
      if (isPositionValid(t) && this.get(t) == EMPTY) {
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
      let t1 = add(p, d)
      if (team == Player.BLACK && t1[0] > 4 || team == Player.WHITE && t1[0] < 5) {
        continue // Bishop cannot cross the river
      }
      if (isPositionValid(t1) && this.get(t1) == EMPTY) {
        let t2 = add(t1, d)
        if (isPositionValid(t2) && (this.get(t2) & Player.MASK) !== team) {
          ret.push(t2)
        }
      }
    }
    return ret
  }

  // get all valid moves for a Pawn
  getPawnMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []
    let team = this.get(p) & Player.MASK
    let direct = team == Player.WHITE ? [North] : [South]
    if (team == Player.WHITE && p[0] <= 4 || team == Player.BLACK && p[0] >= 5) {
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

  // get moves for a piece
  getMoves(p: [number, number]): [number, number][] {
    switch (this.get(p) & Piece.MASK) {
      case Piece.KING:
        return this.getKingMoves(p)
      case Piece.ADVISOR:
        return this.getAdvisorMoves(p)
      case Piece.BISHOP:
        return this.getBishopMoves(p)
      case Piece.CANON:
        return this.getCanonMoves(p)
      case Piece.KNIGHT:
        return this.getKingMoves(p)
      case Piece.ROOK:
        return this.getRookMoves(p)
      case Piece.PAWN:
        return this.getPawnMoves(p)
      default: return []
    }
  }

  // provide an AdvisorMove and test if it is valid
  isAdvisorMoveValid(a: [number, number], b: [number, number]): boolean {
    let t = this.get(a) & Player.MASK
    return isInPalace(b, t) && Math.abs(a[0] - b[0]) == 1 && Math.abs(a[1] - b[1]) == 1
  }

  // check if a bishop move is valid
  isBishopMoveValid(a: [number, number], b: [number, number]): boolean {
    let t = this.get(a) & Player.MASK
    if (t == Player.BLACK && b[0] > 4 || t == Player.WHITE && b[0] < 5) {
      return false
    }
    let d = abs(a, b)
    if (d[0] != 2 || d[1] != 2) {
      return false
    }
    if (this.get([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]) != EMPTY) {
      return false
    }
    return true
  }

  // check if a canon move is valid
  isCannonMoveValid(a: [number, number], b: [number, number]): boolean {
    let count = this.countObstacle(a, b)
    let c = this.get(b)
    return count == 0 && c == EMPTY|| count == 1 && c != EMPTY
  }

  // check if a King move is valid
  isKingMoveValid(a: [number, number], b: [number, number]): boolean {
    if ((this.get(b) & Piece.MASK) == Piece.KING) {
      return this.countObstacle(a, b) == 0
    }
    let t = this.get(a) & Player.MASK
    return isInPalace(b, t) && diff(a[0], b[0]) + diff(a[1], b[1]) == 1
  }

  // check if a knight move is valid
  isKnightMoveValid(a: [number, number], b: [number, number]): boolean {
    let d = abs(a, b)
    if (d[0] === 1 && d[1] === 2) {
      let dy = b[1] > a[1] ? 1 : -1
      if (this.matrix[a[0]][dy + a[1]] != EMPTY) {
        return false
      }
    } else if (d[0] === 2 && d[1] === 1) {
      let dx = b[0] > a[1] ? 1 : -1
      if (this.matrix[a[0] + dx][a[1]] != EMPTY) {
        return false
      }
    } else {
      return false
    }
    return true
  }

  // check if a Pawn move is valid
  isPawnMoveValid(a: [number, number], b: [number, number]): boolean {
    let d = abs(a, b)
    if (d[0] + d[1] !== 1) {
      return false
    }
    let t = this.get(a) & Player.MASK
    if (t == Player.WHITE) {
      if (a[0] == b[0] && a[0] > 4 || a[0] - b[0] == -1) {
        return false
      }
    } else {
      if (a[0] == b[0] && a[0] < 5 || a[0] - b[0] == 1) {
        return false
      }
    }
    return true
  }

  // check if a Rook move is valid
  isRookMoveValid(a: [number, number], b: [number, number]): boolean {
    return this.countObstacle(a, b) == 0
  }

  //count how many pieces lies between two positions
  countObstacle(a: [number, number], b: [number, number]): number {
    let ax = a[0], bx = b[0], ay = a[1], by = b[1]
    let i, j, k, n: number = 0
    if (ax === bx) {
      i = ay < by ? ay : by
      j = ay > by ? ay : by
      for (k = i + 1; k < j; k++) {
        if (this.matrix[ax][k] != EMPTY) {
          n++
        }
      }
      return n
    } else if (ay === by) {
      i = ax < bx ? ax : bx
      j = ax > bx ? ax : bx
      for (k = i + 1; k < j; k++) {
        if (this.matrix[k][ay] != EMPTY) {
          n++
        }
      }
      return n
    }
    return -1
  }

  isMoveValid(a: [number, number], b: [number, number]): boolean {
    let ta = this.get(a) & Player.MASK
    let tb = this.get(b) & Player.MASK
    if (ta == tb) {
      return false
    }
    let pa = this.get(a) & Piece.MASK
    switch (pa) {
      case Piece.ADVISOR:
        return this.isAdvisorMoveValid(a, b)
      case Piece.BISHOP:
        return this.isBishopMoveValid(a, b)
      case Piece.CANON:
        return this.isCannonMoveValid(a, b)
      case Piece.KING:
        return this.isKingMoveValid(a, b)
      case Piece.KING:
        return this.isKnightMoveValid(a, b)
      case Piece.PAWN:
        return this.isPawnMoveValid(a, b)
      case Piece.ROOK:
        return this.isRookMoveValid(a, b)
      default:
        return false
    }
  }
}

