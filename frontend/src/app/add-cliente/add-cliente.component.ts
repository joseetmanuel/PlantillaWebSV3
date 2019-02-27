import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormBuilder
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SiscoV3Service } from '../services/siscov3.service';
import { error } from 'util';
import { MatSnackBar } from '@angular/material';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.sass'],
  providers: [SiscoV3Service]
})
export class AddClienteComponent implements OnInit {
  public empresa;
  public tipo = 2;
  public municipios;
  public tipoVialidades;
  public tipoAsentamientos;
  public asentamientos;
  public idPais;
  public idEstado;
  public idMunicipio;
  public numero = 1;
  public valCp = false;
  @ViewChild('cp') cp;
  @ViewChild('municipio') municipio;

  clienteEntidadForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('1'),
    tipoPersona: new FormControl('1', [Validators.required]),
    razonSocial: new FormControl('', [Validators.required]),
    nombreComercial: new FormControl('', [Validators.required]),
    rfcCliente: new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13)
    ]),
    personaContacto: new FormControl('', []),
    telefono: new FormControl('', []),
    email: new FormControl('', [Validators.email, Validators.required]),
    cp: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(5)
    ]),
    estado: new FormControl({ value: '', disabled: true }, [
      Validators.required
    ]),
    municipio: new FormControl(
      { value: 'Se llenará con su CP', disabled: true },
      [Validators.required]
    ),
    tipoAsentamiento: new FormControl('', [Validators.required]),
    asentamiento: new FormControl({ value: 'Asentamiento', disabled: true }, [
      Validators.required
    ]),
    tipoVialidad: new FormControl('', [Validators.required]),
    vialidad: new FormControl('', [Validators.required]),
    numeroExterior: new FormControl('', []),
    numeroInterior: new FormControl('', [])
  });

  matcher = new MyErrorStateMatcher();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service
  ) {}

  ngOnInit() {
    this._siscoV3Service.getService('common/getTipoVialidad').subscribe(
      (res: any) => {
        console.log(res.recordsets[0]);
        this.tipoVialidades = res.recordsets[0];
      },
      (error: any) => {
        console.log(error);
      }
    );

    this._siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
      (res: any) => {
        this.tipoAsentamientos = res.recordsets[0];
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  tipoVivienda(numero) {
    try {
      this.tipo = numero;
      if (numero === 0) {
        this.clienteEntidadForm.controls['numeroExterior'].setValue('');
        this.clienteEntidadForm.controls['numeroInterior'].setValue('');
      }
      if (numero === 1) {
        this.clienteEntidadForm.controls['mz'].setValue('');
        this.clienteEntidadForm.controls['lt'].setValue('');
      }
    } catch (err) {
      // aqui va la excepcion
    }
  }

  getCp() {
    if (this.clienteEntidadForm.controls['cp'].value) {
      this.numero = 0;
      this._siscoV3Service
        .postService('common/postCpAutocomplete', {
          cp: this.clienteEntidadForm.controls['cp'].value
        })
        .subscribe(
          (resp: any) => {
            if (resp.recordsets[0] < 1) {
              this.snackBar.open('El Código Postal no es valido', 'Ok', {
                duration: 2000
              });
              this.numero = 1;
              this.valCp = true;
              this.clienteEntidadForm.controls['cp'].setValue('');
            } else {
              this.numero = 1;
              this.valCp = false;
              this.asentamientos = resp.recordsets[0];
              this.idPais = resp.recordsets[0][0]['idPais'];
              this.idEstado = resp.recordsets[0][0]['idEstado'];
              this.idMunicipio = resp.recordsets[0][0]['idMunicipio'];
              this.clienteEntidadForm.controls['estado'].setValue(
                resp.recordsets[0][0]['nombreEstado']
              );
              this.clienteEntidadForm.controls['municipio'].setValue(
                resp.recordsets[0][0]['nombreMunicipio']
              );
              this.clienteEntidadForm.get('asentamiento').enable();
              this.clienteEntidadForm.controls['asentamiento'].setValue('');
              console.log(this.asentamientos);
            }
          },
          (error: any) => {
            console.log(error);
          }
        );
    }
  }

  onKeydown(event) {
    if (event.key === 'Enter') {
      this.cp.nativeElement.blur();
    }
  }

  agregarClienteEntidad() {
    this.numero = 0;

    const data = {
      nombre: this.clienteEntidadForm.controls['nombre'].value,
      idUsuario: this.clienteEntidadForm.controls['idUsuario'].value,
      idPais: this.idPais,
      idEstado: this.idEstado,
      idMunicipio: this.idMunicipio,
      codigoPostal: this.clienteEntidadForm.controls['cp'].value,
      idTipoAsentamiento: this.clienteEntidadForm.controls['tipoAsentamiento']
        .value,
      asentamiento: this.clienteEntidadForm.controls['asentamiento'].value,
      idTipoVialidad: this.clienteEntidadForm.controls['tipoVialidad'].value,
      vialidad: this.clienteEntidadForm.controls['vialidad'].value,
      numeroExterior: this.clienteEntidadForm.controls['numeroExterior'].value,
      numeroInterior: this.clienteEntidadForm.controls['numeroInterior'].value,

      rfcClienteEntidad: this.clienteEntidadForm.controls['rfcCliente'].value,
      razonSocial: this.clienteEntidadForm.controls['razonSocial'].value,
      nombreComercial: this.clienteEntidadForm.controls['nombreComercial']
        .value,
      idTipoPersona: this.clienteEntidadForm.controls['tipoPersona'].value,
      personaContacto: this.clienteEntidadForm.controls['personaContacto']
        .value,
      telefono: this.clienteEntidadForm.controls['telefono'].value,
      email: this.clienteEntidadForm.controls['email'].value
    };

    this._siscoV3Service
      .postService('cliente/postInsertaClienteEntidad', data)
      .subscribe(
        (res: any) => {
          console.log(res);
          this.numero = 1;
          this.clienteEntidadForm.reset();
        },
        (error: any) => {
          this.snackBar.open('Ocurrio un Error!', 'Ok', {
            duration: 2000
          });
          this.numero = 1;
          console.log(error);
        }
      );
    console.log(data);
  }
}
