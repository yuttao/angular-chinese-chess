import { Component, OnInit } from '@angular/core';
import { UcciService } from '../ucci.service';
import { ChessPiece } from '../ChessPiece';
import { unescapeIdentifier } from '@angular/compiler';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.svg',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent implements OnInit {
  pieces: Map<string, ChessPiece> = new Map()
  dest: string[] = []
  start!: ChessPiece | undefined;

  constructor(private ucciService: UcciService) {
  }

  ngOnInit(): void {
    this.getPieces()
  }

  getPieces() {
    this.pieces = new Map()
    for (let p of this.ucciService.getPieces()) {
      this.pieces.set(p[0], new ChessPiece(p[0], p[1]))
    }
  }

  getExclude(): Set<string> {
    let exclude: Set<string> = new Set()
    for (let p of this.dest) {
      exclude.add(p)
    }
    if (this.start !== undefined) {
      exclude.add(this.start.position)
    }
    return exclude
  }

  getMovable(): ChessPiece[] {
    let ret: ChessPiece[] = []
    let exclude = this.getExclude()
    for (let p of this.pieces) {
      if (exclude.has(p[0])) {
        continue
      }
      if (this.ucciService.isCurrentPlayer(p[0])) {
        ret.push(p[1])
      }
    }
    return ret
  }

  getOpponent() {
    let ret: ChessPiece[] = []
    let exclude = this.getExclude()
    for (let p of this.pieces) {
      if (exclude.has(p[0])) {
        continue
      }
      if (!this.ucciService.isCurrentPlayer(p[0])) {
        ret.push(p[1])
      }
    }
    return ret
  }

  getEmpty(): string[] {
    let ret: string[] = []
    for (let p of this.dest) {
      if (!this.pieces.has(p)) {
        ret.push(p)
      }
    }
    return ret
  }

  getHighLight(): ChessPiece[] {
    let ret: ChessPiece[] = []
    for (let p of this.pieces) {
      if (this.dest.indexOf(p[0]) >= 0) {
        ret.push(p[1])
      }
    }
    return ret
  }

  onSelectPiece(piece: string) {
    this.dest = this.ucciService.getPossibleMoves(piece)
    this.start = new ChessPiece(piece, this.ucciService.getByStr(piece))
  }

  onMovePiece(piece: string) {
    if (this.start?.position !== piece) {
      this.ucciService.move(this.start?.position + piece)
      this.getPieces()
    }
    this.dest = []
    this.start = undefined
  }
}
