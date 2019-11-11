import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelGestoriaComponent } from './sel-gestoria.component';

describe('SelGestoriaComponent', () => {
  let component: SelGestoriaComponent;
  let fixture: ComponentFixture<SelGestoriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelGestoriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelGestoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
