import { Component, OnInit } from '@angular/core';
import { ChessPieceComponent } from '../chess-piece/chess-piece.component';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
