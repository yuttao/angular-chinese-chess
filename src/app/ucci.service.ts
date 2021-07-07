import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

class Step {
  move!: string
  eaten!: string
}

class Data {
  fen!: string
  moves!: string[]
}

export class UcciService {
  // const variables
  row = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  col = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']

  bPiece = ['r', 'n', 'b', 'a', 'k', 'c', 'p']
  wPiece = ['R', 'N', 'B', 'A', 'K', 'C', 'P']
  aPiece = this.wPiece.concat(this.bPiece)

  // member variables
  initialState !: string
  state !: string[][]
  player: string = 'w'
  round: number = 0
  emptyStep: number = 0
  history !: Step[]

  constructor() {
    this.init('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1', []);
  }

  // The real construct function of the library
  init(fen: string, moves: string[]) {
    let parts = fen.split(' ')
    this.initialState = fen
    let lines = parts[0].split('/')
    this.state = []
    for (let i = 0; i <= 9; i++) {
      let temp: string[] = this.state[i] = []
      let line = lines[i]
      for (let k = 0; k < line.length; k++) {
        let c = line[k]
        if (c >= '1' && c <= '9') {
          for (let j = 0; j < Number(c); j++) {
            temp.push(' ')
          }
        } else {
          temp.push(c)
        }
      }
    }

    //set up the current player
    if (parts[1] === "b") {
      this.player = "b"
    } else {
      this.player = "w"
    }

    //set up the counter for empty steps and rounds
    this.emptyStep = Number(parts[4])
    this.round = Number(parts[5])

    // set the historical movements
    this.history = []

    for (let h_i = 0; h_i < moves.length; h_i++) {
      this.move(moves[h_i])
    }
  }


  //validate whether the FEN string is valid or not
  validate(fen: string): boolean {
    // split the string and make sure that it has seven parts
    let parts: string[] = fen.split(' ')
    if (parts.length !== 6) {
      throw 'invalid number of parts'
    }

    //split the chess board string and make sure that it has 10 lines
    let lines = parts[0].split('/')
    if (lines.length !== 10) {
      throw 'invalid number of lines'
    }

    // validate that the 
    for (let lines_i in lines) {
      let l: string = lines[lines_i]
      let count = 0
      for (let c of l) {
        if (c >= '1' && c <= '9') {
          count += Number(c)
        } else if (this.aPiece.indexOf(c) >= 0) {
          count++
        } else {
          throw 'invalid piece character'
        }
      }
      if (count !== 9) {
        throw 'invalid chess state string'
      }
    }

    if (Number.NaN === Number(parts[4]) || Number.NaN === Number(parts[5])) {
      throw 'invalid number of rounds'
    }

    return true
  }

  //make sure that the object created by the init function have access to
  //the functions of library by setting its prototype
  print() {
    let board = ''
    for (let r in this.state) {
      let line = ''
      for (let c in this.state[r]) {
        line += this.state[r][c]
      }
      line += ' '
      board += line + '\n'
    }
    console.log(board)
    return this
  }

  showState() {
    console.log(this.state)
    return this
  }

  //move a piece return false if not successful
  move(str: string): boolean {

    //make sure that the two positions are different
    let src = str.substring(0, 2)
    let tar = str.substring(2, 4)
    if (src === tar) {
      return false
    }

    //calculate  the position location and the target position
    let p_src = this.strToPos(src)
    let p_tar = this.strToPos(tar)

    //validate that this move is valid
    if (!this.isValidMove(p_src, p_tar)) {
      return false
    }
    let c_t = this.getByPos(p_tar)

    if (c_t === " ") {
      this.emptyStep++
    } else {
      this.emptyStep = 0
    }

    this.setByPos(p_tar, this.getByPos(p_src))
    this.setByPos(p_src, ' ')

    this.history.push({
      move: str,
      eaten: c_t
    })
    this.round = Math.round(this.history.length / 2)

    if (this.player === "b") {
      this.player = "w"
    } else {
      this.player = "b"
    }
    return true
  }

  //validate that a move is valid.
  isValidMove(p_s: number[], p_t: number[]): boolean {

    //The represented
    let c_s = this.getByPos(p_s)

    //The chosen piece must exist
    if (c_s === ' ') {
      throw 'no chosen piece'
    }
    let c_t = this.getByPos(p_t)

    //make sure that it does not eat a piece on the same team
    if (this.getTeam(c_s) === this.getTeam(c_t)) {
      throw 'cannot eat piece on the same side'
    }

    switch (c_s.toUpperCase()) {
      case 'A':
        return this.isAdvisorMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
      case 'B':
        return this.isBishopMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
      case 'C':
        return this.isCannonMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
      case 'K':
        return this.isKingMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
      case 'N':
        return this.isKnightMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
      case 'P':
        return this.isPawnMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
      case 'R':
        return this.isRookMoveValid(p_s[0], p_s[1], c_s, p_t[0], p_t[1], c_t)
    }
    return true
  }

  isAdvisorMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    if (by < 3 || by > 5 || ac === 'A' && bx <= 6 || ac === 'a' && bx >= 3) {
      throw 'advisors cannot leave designated area'
    }
    if (Math.abs(ax - bx) !== 1 || Math.abs(ay - by) !== 1) {
      throw 'advisors must move on diagonal step'
    }
    return true
  }

  isBishopMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    //make sure that the bishop stays in right side of the river
    if (ac === 'B' && bx < 5 || ac === 'b' && bx > 4) {
      throw "bishops can never cross the river"
    }
    if (Math.abs(ax - bx) !== 2 || Math.abs(ay - by) !== 2) {
      throw "bishops must move 2 diagonal step at a time"
    }
    //make sure the position is right
    if (this.state[(ax + bx) / 2][(ay + by) / 2] !== ' ') {
      throw "the bishop is blocked"
    }
    return true
  }

  isCannonMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    let count = this.countObstacle(ax, ay, bx, by)
    if (count < 0) {
      throw 'cannons must move in a straight line'
    }
    if (count === 0 && bc !== ' ') {
      throw 'cannons must eat with a piece in between'
    }
    if (count === 1 && bc === ' ') {
      throw 'nothing for the cannon to eat'
    }
    if (count > 1) {
      throw 'two much pieces in between'
    }
    return true
  }

  isKingMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    if (bc.toUpperCase() === 'K') {
      let count = this.countObstacle(ax, ay, bx, by)
      if (count < 0) {
        throw 'kings are not on the same line'
      } else if (count > 0) {
        throw 'kings are blocked'
      }
    } else if (by < 3 || by > 5 || ac === 'K' && bx < 7 || ac === 'k' && bx > 2) {
      throw 'kings cannot leave designated area'
    } else if (Math.abs(ax - bx) + Math.abs(ay - by) !== 1) {
      throw 'kings can only move one step at a time'
    }
    return true
  }

  isKnightMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    let offset = 0
    if (Math.abs(ax - bx) === 1 && Math.abs(ay - by) === 2) {
      offset = by > ay ? 1 : -1
      if (this.state[ax][ay + offset] !== ' ') {
        throw 'knight is blocked'
      }
    } else if (Math.abs(ax - bx) === 2 && Math.abs(ay - by) === 1) {
      offset = bx > ax ? 1 : -1
      if (this.state[ax + offset][ay] !== ' ') {
        throw 'knight is blocked'
      }
    } else {
      throw 'knight must follow its pattern'
    }
    return true
  }

  isPawnMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    if (Math.abs(ax - bx) + Math.abs(ay - by) !== 1) {
      throw 'pawns can only move one step at a time'
    }
    if (ax - bx === 0 && (ac === 'P' && ax > 4 || ac === 'p' && ax < 5)) {
      throw 'pawns can only move horizontally after crossing the river'
    }
    if (ac === 'P' && ax - bx === -1 || ac === 'p' && ax - bx === 1) {
      throw 'pawns can never move backward'
    }
    return true
  }

  isRookMoveValid(ax: number, ay: number, ac: string, bx: number, by: number, bc: string): boolean {
    let count = this.countObstacle(ax, ay, bx, by)
    if (count < 0) {
      throw 'rooks must move in a straight line'
    } else if (count > 0) {
      throw 'the path of the rook is blocked'
    }
    return true
  }

  //count how many pieces lies between two positions
  countObstacle(ax: number, ay: number, bx: number, by: number): number {
    let i, j, k, n: number = 0
    if (ax === bx) {
      i = ay < by ? ay : by
      j = ay > by ? ay : by
      for (k = i + 1; k < j; k++) {
        if (this.state[ax][k] !== ' ') {
          n++
        }
      }
      return n
    } else if (ay === by) {
      i = ax < bx ? ax : bx
      j = ax > bx ? ax : bx
      for (k = i + 1; k < j; k++) {
        if (this.state[k][ay] !== ' ') {
          n++
        }
      }
      return n
    }
    return -1
  }

  getByPos(pos: number[]): string {
    return this.state[pos[0]][pos[1]]
  }

  getByStr(s: string): string {
    let pos = this.strToPos(s)
    return this.getByPos(pos)
  }

  setByPos(pos: number[], value: string): UcciService {
    this.state[pos[0]][pos[1]] = value
    return this
  }

  strToPos(string: string): number[] {
    if (string.length !== 2) {
      return []
    }
    let c = string[0]
    let r = string[1]
    if (this.col.indexOf(c) < 0) {
      return []
    }
    if (r < '0' || r > '9') {
      return []
    }
    return [this.row.indexOf(r), this.col.indexOf(c)]
  }

  posToStr(pos: number[]): string {
    return "" + this.col[pos[1]] + this.col[pos[0]]
  }

  getList() :string[][] {
    let pieceMap = []
    for (let r in this.state) {
      for (let c in this.state[r]) {
        let key: string = '' + this.col[c] + this.row[r]
        if (this.state[r][c] !== ' ') {
          pieceMap.push([key, this.state[r][c]])
        }
      }
    }
    return pieceMap
  }

  getMatrix(team: string): string[][] {
    let matrix: string[][] = []
    let whiteTeam: boolean = (team === "w")
    let xs = whiteTeam ? 0 : 9
    let xe = whiteTeam ? 10 : -1
    let ys = whiteTeam ? 0 : 8
    let ye = whiteTeam ? 9 : -1
    let inc = whiteTeam ? 1 : -1

    for (let i = xs; i != xe; i += inc) {
      let temp: string[] = []
      matrix.push(temp)
      for (let j = ys; j != ye; j += inc) {
        temp.push(this.state[i][j])
      }
    }
    return matrix
  }

  getPossibleMoves(str: string): string[] {
    let p_s = this.strToPos(str)
    let list = []
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        try {
          this.isValidMove(p_s, [r, c])
          list.push('' + this.col[c] + this.row[r])
        } catch (e) {
          continue
        }
      }
    }
    return list
  }

  isSameTeam(a: string, b: string): boolean {
    let c_a = this.getByStr(a)
    let c_b = this.getByStr(b)
    return this.getTeam(c_a) === this.getTeam(c_b)
  }

  getTeam(p: string): string | undefined {
    if (this.isWhitePiece(p)) {
      return 'w'
    } else if (this.isBlackPiece(p)) {
      return 'b'
    } else {
      return undefined
    }
  }

  isCurrentPlayer(play: string): boolean {
    return this.player === this.getTeam(this.getByStr(play))
  }

  isWhitePiece(p: string): boolean {
    return this.wPiece.indexOf(p) >= 0
  }

  isBlackPiece(p: string): boolean {
    return this.bPiece.indexOf(p) >= 0
  }

  save(): Data {
    let data = new Data()
    for (let i = 0; i < this.history.length; i++) {
      data.moves.push(this.history[i].move)
    }
    return data
  }

  revoke(): UcciService {
    let history = this.history
    history.splice(history.length - 1, 1)
    return this
  }
}
