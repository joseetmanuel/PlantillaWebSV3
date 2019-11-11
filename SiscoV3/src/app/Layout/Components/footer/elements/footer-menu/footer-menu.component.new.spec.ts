import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStoreModule, MockAction } from '@reibo/ngrx-mock-test';
import { initialState } from 'src/app/store/reducers/contrato.reducers';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.states';
import { FooterMenuComponent } from './footer-menu.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from 'src/app/utilerias/pipes';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FooterMenuComponent', () => {
   let component: FooterMenuComponent;
   let fixture: ComponentFixture<FooterMenuComponent>;
   let store: Store<AppState>;
   const clases: Array<string> = ['Automovil', 'Papeleria', 'Mock'];
   const contratos: Array<any> = [
      {
         numeroContrato: '1',
         idCliente: 35,
         rfcEmpresa: 'DIC0503123MD3',
         idClase: 'Automovil',
         nombre: 'PEMEX',
         descripcion: 'DES',
         fechaInicio: '2019-03-21T00:00:00.000Z',
         fechaFin: '2019-03-24T00:00:00.000Z',
         incluyeMantenimiento: true,
         activo: true,
      },
      {
         numeroContrato: '3',
         idCliente: 35,
         rfcEmpresa: 'DIC0503123MD3',
         idClase: 'Automovil',
         nombre: 'otro',
         descripcion: 'des',
         fechaInicio: '2019-04-01T00:00:00.000Z',
         fechaFin: '2019-04-19T00:00:00.000Z',
         incluyeMantenimiento: false,
         activo: true,
      },
      {
         numeroContrato: '4',
         idCliente: 35,
         rfcEmpresa: 'DIC0503123MD3',
         idClase: 'Mock',
         nombre: 'otro',
         descripcion: 'des',
         fechaInicio: '2019-04-01T00:00:00.000Z',
         fechaFin: '2019-04-19T00:00:00.000Z',
         incluyeMantenimiento: false,
         activo: true,
      },
      {
         numeroContrato: '5',
         idCliente: 35,
         rfcEmpresa: 'DIC0503123MD3',
         idClase: 'Mock',
         nombre: 'otro',
         descripcion: 'des',
         fechaInicio: '2019-04-01T00:00:00.000Z',
         fechaFin: '2019-04-19T00:00:00.000Z',
         incluyeMantenimiento: false,
         activo: true,
      },
      {
         numeroContrato: '6',
         idCliente: 35,
         rfcEmpresa: 'DIC0503123MD3',
         idClase: 'Mock',
         nombre: 'otro',
         descripcion: 'des',
         fechaInicio: '2019-04-01T00:00:00.000Z',
         fechaFin: '2019-04-19T00:00:00.000Z',
         incluyeMantenimiento: false,
         activo: true,
      }
   ];

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            NgbModule,
            FormsModule,
            MockStoreModule.forRoot('negocio', initialState),
            HttpClientTestingModule
         ],
         declarations: [
            FilterPipe,
            FooterMenuComponent
         ],
         providers: []
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(FooterMenuComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      store = TestBed.get(Store);
   });

   it('Debería crear una instancia del componente', () => {
      expect(component).toBeTruthy();
   });

   it('Debería de recuperar las clases seteadas desde un store', () => {
      store.dispatch(new MockAction({ contratos, clases }));
      fixture.detectChanges();
      expect(component.clases.length).toBe(clases.length);
   });

   it('Debería de recuperar las clases renderizadas', () => {
      store.dispatch(new MockAction({ contratos, clases }));
      fixture.detectChanges();
      const elements: NodeList = fixture.nativeElement.querySelectorAll('#seleccionarClase option');
      expect(component.clases.length).toBe(elements.length);
   });

   it('Debería cambiar la clase seleccionada', () => {
      const clase = 'Mock';
      store.dispatch(new MockAction({ contratos, clases }));
      fixture.detectChanges();
      component.SeleccionaContratosPorClase(clase);
      fixture.detectChanges();
      expect(component.contratosClase.length).toBe(contratos.filter(f => f.idClase === clase).length);
   });
});
