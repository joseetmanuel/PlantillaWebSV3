import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjetoCargaMasivaComponent } from './objeto-carga-masiva.component';

describe('ObjetoCargaMasivaComponent', () => {
  let component: ObjetoCargaMasivaComponent;
  let fixture: ComponentFixture<ObjetoCargaMasivaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjetoCargaMasivaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjetoCargaMasivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
