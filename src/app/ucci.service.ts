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
  matrix !: string[][]
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
    this.matrix = []
    for (let i = 0; i <= 9; i++) {
      let temp: string[] = this.matrix[i] = []
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
  public print() {
    let board = ''
    for (let r in this.matrix) {
      let line = ''
      for (let c in this.matrix[r]) {
        line += this.matrix[r][c]
      }
      line += ' '
      board += line + '\n'
    }
    console.log(board)
    return this
  }

  public showState() {
    console.log(this.matrix)
    return this
  }

  //move a piece return false if not successful
  public move(str: string): boolean {

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

  filterValidMove(ps: [number, number], pe: [number, number]): boolean {
    if (!this.isValidMove(ps, pe)) {
      return false
    }
    let t = this.matrix[pe[0]][pe[1]]
    this.matrix[pe[0]][pe[1]] = this.matrix[ps[0]][ps[1]]
    this.matrix[ps[0]][ps[1]] = ' '
    let ret = true
    if (this.findKingTreat()) {
      ret = false;
    }
    this.matrix[ps[0]][ps[1]] = this.matrix[pe[0]][pe[1]]
    this.matrix[pe[0]][pe[1]] = t
    if (ret) {
      return ret
    } else {
      throw "king under threat"
    }
  }

  isPositionValid(p: [number, number]): boolean {
    if (p[0] < 0 || p[0] > 9 || p[1] < 0 || p[0] > 8) {
      return false;
    }
    return this.matrix[p[0]][p[1]] === ' '
  }

  getTeamPieces(team: string): [number, number][] {
    let ret: [number, number][] = []
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 8; j++) {
        let c = this.matrix[i][j]
        if (c !== ' ' && this.getTeam(c) == team) {
          ret.push([i, j])
        }
      }
    }
    return ret
  }

  findKingTreat(): boolean {
    let pos: [number, number] = [-1, -1]
    let row: number[]
    if (this.player == 'w') {
      row = [7, 8, 9]
    } else {
      row = [0, 1, 2]
    }
    for (let i of row) {
      for (let j of [3, 4, 5]) {
        let c = this.matrix[i][j]
        if (c === 'k' || c === 'K') {
          pos = [i, j]
          break
        }
      }
    }
    if (pos[1] === -1) {
      return false
    }
    let team :string = this.player === 'w' ? 'b' : 'w'
    for (let pe of this.getTeamPieces(team)) {
      try {
        this.isValidMove(pe, pos)
        return true
      }
      catch {
        continue
      }
    }
    return false
  }

  //validate that a move is valid.
  isValidMove(ps: [number, number], pe: [number, number]): boolean {

    //The represented
    let c_s = this.getByPos(ps)

    //The chosen piece must exist
    if (c_s === ' ') {
      throw 'no chosen piece'
    }
    let c_t = this.getByPos(pe)

    //make sure that it does not eat a piece on the same team
    if (this.getTeam(c_s) === this.getTeam(c_t)) {
      throw 'cannot eat piece on the same side'
    }

    switch (c_s.toUpperCase()) {
      case 'A':
        return this.isAdvisorMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
      case 'B':
        return this.isBishopMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
      case 'C':
        return this.isCannonMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
      case 'K':
        return this.isKingMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
      case 'N':
        return this.isKnightMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
      case 'P':
        return this.isPawnMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
      case 'R':
        return this.isRookMoveValid(ps[0], ps[1], c_s, pe[0], pe[1], c_t)
    }
    return true
  }

  getAllValidMoves(): [number, number][] {
    let ret: [number, number][] = []

    return ret
  }

  getValidMoves(p: [number, number]): [number, number][] {
    let ret: [number, number][] = []

    return ret
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
    if (this.matrix[(ax + bx) / 2][(ay + by) / 2] !== ' ') {
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
      if (this.matrix[ax][ay + offset] !== ' ') {
        throw 'knight is blocked'
      }
    } else if (Math.abs(ax - bx) === 2 && Math.abs(ay - by) === 1) {
      offset = bx > ax ? 1 : -1
      if (this.matrix[ax + offset][ay] !== ' ') {
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
        if (this.matrix[ax][k] !== ' ') {
          n++
        }
      }
      return n
    } else if (ay === by) {
      i = ax < bx ? ax : bx
      j = ax > bx ? ax : bx
      for (k = i + 1; k < j; k++) {
        if (this.matrix[k][ay] !== ' ') {
          n++
        }
      }
      return n
    }
    return -1
  }

  getByPos(pos: [number, number]): string {
    return this.matrix[pos[0]][pos[1]]
  }

  getByStr(s: string): string {
    let pos = this.strToPos(s)
    return this.getByPos(pos)
  }

  setByPos(pos: number[], value: string): UcciService {
    this.matrix[pos[0]][pos[1]] = value
    return this
  }

  strToPos(string: string): [number, number] {
    if (string.length !== 2) {
      return [-1, -1]
    }
    let c = string[0]
    let r = string[1]
    if (c < 'a' || c > 'i') {
      return [-1, -1]
    }
    if (r < '0' || r > '9') {
      return [-1, -1]
    }
    return [r.charCodeAt(0) - '0'.charCodeAt(0), c.charCodeAt(0) - 'a'.charCodeAt(0)]
  }

  posToStr(pos: [number, number]): string {
    return "" + this.col[pos[1]] + this.col[pos[0]]
  }

  getPieces(): [string, string][] {
    let pieceList: [string, string][] = []
    for (let r in this.matrix) {
      for (let c in this.matrix[r]) {
        let key: string = '' + this.col[c] + this.row[r]
        if (this.matrix[r][c] !== ' ') {
          pieceList.push([key, this.matrix[r][c]])
        }
      }
    }
    return pieceList
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
        temp.push(this.matrix[i][j])
      }
    }
    return matrix
  }

  getPossibleMoves(str: string): string[] {
    let p_s = this.strToPos(str)
    let list: string[] = []
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        try {
          this.filterValidMove(p_s, [r, c])
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

  isCurrentPlayer(position: string): boolean {
    return this.player === this.getTeam(this.getByStr(position))
  }

  isWhitePiece(p: string): boolean {
    return p >= 'A' && p <= 'Z'
  }

  isBlackPiece(p: string): boolean {
    return p >= 'a' && p <= 'z'
  }

  save(): Data {
    let data = new Data()
    for (let i = 0; i < this.history.length; i++) {
      data.moves.push(this.history[i].move)
    }
    return data
  }

  revoke(): undefined | UcciService {
    let history = this.history
    if (history.length == 0) {
      return undefined
    }
    history.splice(history.length - 1, 1)
    return this
  }
}
