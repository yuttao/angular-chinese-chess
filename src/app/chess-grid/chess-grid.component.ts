import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[app-chess-grid]',
  templateUrl: './chess-grid.component.svg',
  styleUrls: ['./chess-grid.component.css']
})
export class ChessGridComponent implements OnInit {
  lines: string[] = [`M 175,25 275,125`, `M 275,25 175,125`,
    `M 175,375 275,475`, `M 275,375 175,475`]
  dashes: string[] = []

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
    let l = 11.5, d = 2.2
    let points = [[125, 175], [225, 175], [325, 175], [125, 325], [225, 325], [325, 325],[75, 125], [375, 125], [75, 375], [375, 375]]

    for (let p of points.concat([[25, 175],[25, 325]])) {
      let x = p[0] + d
      let y = p[1]
      this.dashes.push(`M ${x},${y + d + l} l 0,${-l} l ${l},0`)
      this.dashes.push(`M ${x},${y - d - l} l 0,${l} l ${l},0`)
    }
    for (let p of points.concat([[425, 175],[425, 325]])) {
      let x = p[0] - d
      let y = p[1]
      this.dashes.push(`M ${x},${y + d + l} l 0,${-l} l ${-l},0`)
      this.dashes.push(`M ${x},${y - d - l} l 0,${l} l ${-l},0`)
    }
  }

  ngOnInit(): void {
  }

}
