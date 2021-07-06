import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ChessBoardComponent } from './chess-board/chess-board.component';
import { ChessPieceComponent } from './chess-piece/chess-piece.component';
import { UcciService } from './ucci.service';

@NgModule({
  declarations: [
    AppComponent,
    ChessBoardComponent,
    ChessPieceComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    UcciService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
