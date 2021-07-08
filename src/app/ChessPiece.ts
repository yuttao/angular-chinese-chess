export class ChessPiece {
  position: string = ''
  piece: string = ''

  constructor(position: string, piece: string) {
    this.position = position
    this.piece = piece
  }
}