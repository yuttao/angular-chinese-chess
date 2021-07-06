import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChessGridComponent } from './chess-grid.component';

describe('ChessGridComponent', () => {
  let component: ChessGridComponent;
  let fixture: ComponentFixture<ChessGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChessGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChessGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
