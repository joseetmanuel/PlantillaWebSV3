import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClonarPartidaComponent } from './clonar-partida.component';

describe('ClonarPartidaComponent', () => {
  let component: ClonarPartidaComponent;
  let fixture: ComponentFixture<ClonarPartidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClonarPartidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClonarPartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
