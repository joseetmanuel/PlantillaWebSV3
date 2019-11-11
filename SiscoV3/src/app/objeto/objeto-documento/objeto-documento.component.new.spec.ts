import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjetoDocumentoComponent } from './objeto-documento.component';

describe('ObjetoDocumentoComponent', () => {
  let component: ObjetoDocumentoComponent;
  let fixture: ComponentFixture<ObjetoDocumentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObjetoDocumentoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjetoDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ObjetoDocumentoComponent.AllDocumentos', () => {

  });

  describe('ObjetoDocumentoComponent.AgregarArchivo', () => {

  });

  describe('ObjetoDocumentoComponent.BorrarArchivo', () => {

  });
  describe('ObjetoDocumentoComponent.DatosMessage', () => {

  });
  describe('ObjetoDocumentoComponent.ReceiveMessageDoc', () => {

  });
  describe('ObjetoDocumentoComponent.AddDoc', () => {

  });

  describe('ObjetoDocumentoComponent.DeleteDoc', () => {

  });

  describe('ObjetoDocumentoComponent.Excepciones', () => {

  });



});
