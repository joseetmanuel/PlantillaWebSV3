import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsObjetoSustitutoComponent } from './ins-objeto-sustituto.component';

describe('InsObjetoSustitutoComponent', () => {
  let component: InsObjetoSustitutoComponent;
  let fixture: ComponentFixture<InsObjetoSustitutoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsObjetoSustitutoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsObjetoSustitutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
