import { Component, OnInit } from '@angular/core';
import { ChessGridComponent } from '../chess-grid/chess-grid.component';
import { UcciService } from '../ucci.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.svg',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent implements OnInit {
  pieces: string[][]

  constructor(ucci: UcciService) {
    this.pieces = ucci.getList()
  }

  ngOnInit(): void {
  }

}