import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[app-chess-grid]',
  templateUrl: './chess-grid.component.svg',
  styleUrls: ['./chess-grid.component.css']
})
export class ChessGridComponent implements OnInit {
  lines: string[] = [`M 175,25 275,125`, `M 275,25 175,125`,
  `M 175,375 275,475`, `M 275,375 175,475`]
  constructor() {
    for (let i = 1; i < 9; i++) {
      let y = i * 50 + 25
      this.lines.push(`M 25,${y} 425,${y}`)
    }
    for (let i = 1; i < 8; i++) {
      let x = i * 50 + 25
      this.lines.push(`M ${x},25  ${x},225`)
      this.lines.push(`M ${x},275  ${x},475`)
    }
  }

  ngOnInit(): void {
  }

}
