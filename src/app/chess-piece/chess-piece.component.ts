import { Component, OnInit, Input } from '@angular/core';
import { UcciService } from '../ucci.service';

@Component({
  selector: '[app-chess-piece]',
  templateUrl: './chess-piece.component.svg',
  styleUrls: ['./chess-piece.component.css']
})
export class ChessPieceComponent implements OnInit {
  @Input() piece: string = 'k';
  @Input() position: string = 'a0'
  @Input() highlight: boolean = false

  constructor(ucci: UcciService) {
  }

  getColor(): string {
    if (this.piece >= 'a' && this.piece <= 'z') {
      return 'rgb(5, 8, 202)'
    } else {
      return '#9b0606'
    }
  }

  ngOnInit(): void {
  }

  getTranslate(): string {
    var dx = this.position.charCodeAt(0) - 'a'.charCodeAt(0)
    var dy = this.position.charCodeAt(1) - '0'.charCodeAt(0)
    return `translate(${dx * 50} ${dy * 50})`
  }

  getHoverTranslate(): string {
    var dx = this.position.charCodeAt(0) - 'a'.charCodeAt(0)
    var dy = this.position.charCodeAt(1) - '0'.charCodeAt(0)
    return `translate(${dx * 50} ${dy * 50 + 5})`
  }
  onClick() {
    this.highlight = !this.highlight
  }
}
