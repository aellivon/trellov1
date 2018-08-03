import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenValidationComponent } from './token-validation.component';

describe('TokenValidationComponent', () => {
  let component: TokenValidationComponent;
  let fixture: ComponentFixture<TokenValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
