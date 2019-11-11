import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelSolicitudesComponent } from './sel-solicitudes.component';

describe('SelSolicitudesComponent', () => {
  let component: SelSolicitudesComponent;
  let fixture: ComponentFixture<SelSolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelSolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
