import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: '[app-chess-piece]',
  templateUrl: './chess-piece.component.svg',
  styleUrls: ['./chess-piece.component.css']
})
export class ChessPieceComponent implements OnInit {
  // inputs
  @Input() piece: string = ' ';
  @Input() position: string = 'a0'
  @Input() highlight: boolean = false

  // output event
  @Output() pieceClickedEvent = new EventEmitter<string>();

  constructor() {
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

  getHighlightPath(): string[] {
    var dx = 7
    var len = 12
    return [
     `M ${dx},${dx+len} l 0,${-len} l ${len},0`,
     `M ${50 -dx},${dx+len} l 0,${-len} l ${-len},0`,
     `M ${dx},${50-dx-len} l 0,${len} l ${len},0`,
     `M ${50 -dx},${50-dx-len} l 0,${len} l ${-len},0`]
  }

  onClick() {
    this.pieceClickedEvent.emit(this.position)
  }
}
