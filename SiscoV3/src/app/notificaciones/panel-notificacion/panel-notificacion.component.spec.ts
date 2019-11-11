import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelNotificacionComponent } from './panel-notificacion.component';

describe('PanelNotificacionComponent', () => {
  let component: PanelNotificacionComponent;
  let fixture: ComponentFixture<PanelNotificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelNotificacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelNotificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
