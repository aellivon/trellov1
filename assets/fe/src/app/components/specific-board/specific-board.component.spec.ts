import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificBoardComponent } from './specific-board.component';

describe('SpecificBoardComponent', () => {
  let component: SpecificBoardComponent;
  let fixture: ComponentFixture<SpecificBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
