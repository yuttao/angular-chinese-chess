import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chess-piece',
  templateUrl: './chess-piece.component.svg',
  styleUrls: ['./chess-piece.component.css']
})
export class ChessPieceComponent implements OnInit {
  @Input() player !: string;
  @Input() piece : string = 'k';

  constructor() {
  }

  getColor(): string {
    if (this.piece >= 'a' && this.piece <= 'z') {
      return 'rgb(0,0,255)'
    } else {
      return 'rgb(255,0,0)'
    }
  }

  ngOnInit(): void {
  }

}
