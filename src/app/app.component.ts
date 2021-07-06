import { Component } from '@angular/core';
import { UcciService } from './ucci.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular-chinese-chess';
  constructor(private ucciService: UcciService) { }

  printUcci(){
    for (let [key, val] of this.ucciService.getPieceMap()) {
      console.log(key, "->", val)
    }
   // this.ucciService.print()
  }
}
