import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsOperadorComponent } from './ins-operador.component';

describe('InsOperadorComponent', () => {
  let component: InsOperadorComponent;
  let fixture: ComponentFixture<InsOperadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsOperadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsOperadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
