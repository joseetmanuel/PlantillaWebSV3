import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPartidasComponent } from './auth-partidas.component';

describe('AuthPartidasComponent', () => {
  let component: AuthPartidasComponent;
  let fixture: ComponentFixture<AuthPartidasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthPartidasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPartidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
