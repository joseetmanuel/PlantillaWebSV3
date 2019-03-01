import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SiscoV3Service } from '../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../excepcion/excepcion.component'

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
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service
  ) { }

  ngOnInit() {
    try {
      this._siscoV3Service.getService('common/getTipoVialidad').subscribe(
        (res: any) => {
          // console.log(res.recordsets[0]);
          if (res.err) {
            this.excepciones(res.err, 4)
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3)
          } else {
            this.tipoVialidades = res.recordsets[0];
          }
        },
        (error: any) => {
          console.log(error);
          this.excepciones(error, 2);
          this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
            duration: 2000
          });
        }
      );

      this._siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
        (res: any) => {
          if (res.err) {
            this.excepciones(res.err, 4)
          } else if (res.excepcion) {
            this.excepciones(res.excepcion, 3);
          } else {
            this.tipoAsentamientos = res.recordsets[0];
          }
        },
        (error: any) => {
          this.excepciones(error, 2)
          console.log(error);
        }
      );
    } catch (error) {
      this.excepciones(error, 1)
      console.log(error)
    }
  }

  getCp() {
    try {
      if (this.clienteEntidadForm.controls['cp'].value) {
        this.numero = 0;
        this._siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.clienteEntidadForm.controls['cp'].value
            // cpj: this.clienteEntidadForm.controls['cp'].value
          })
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4)
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3)
              } else {
                if (res.recordsets[0] < 1) {
                  this.snackBar.open('El Código Postal no es valido', 'Ok', {
                    duration: 2000
                  });
                  this.numero = 1;
                  this.valCp = true;
                  this.clienteEntidadForm.controls['cp'].setValue('');
                } else {
                  this.numero = 1;
                  this.valCp = false;
                  this.asentamientos = res.recordsets[0];
                  this.idPais = res.recordsets[0][0]['idPais'];
                  this.idEstado = res.recordsets[0][0]['idEstado'];
                  this.idMunicipio = res.recordsets[0][0]['idMunicipio'];
                  this.clienteEntidadForm.controls['estado'].setValue(
                    res.recordsets[0][0]['nombreEstado']
                  );
                  this.clienteEntidadForm.controls['municipio'].setValue(
                    res.recordsets[0][0]['nombreMunicipio']
                  );
                  this.clienteEntidadForm.get('asentamiento').enable();
                  this.clienteEntidadForm.controls['asentamiento'].setValue('');
                  // console.log(this.asentamientos);
                }
              }
            },
            (error: any) => {
              this.excepciones(error, 2)
              this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
                duration: 2000
              });
              this.numero = 1;
              console.log(error);
            }
          );
      }
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1)
      console.log(error);
    }
  }

  onKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.excepciones(error, 1);
      console.log(error);
    }
  }

  agregarClienteEntidad() {
    try {
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
            // console.log(res);
            if (res.err) {
              this.numero = 1;
              // error tipo base de datos
              this.excepciones(res.err, 4)

            } else if (res.excepcion) {
              this.numero = 1;
              // excepcion de conexion a la base de datos
              this.excepciones(res.excepcion, 3);
            } else {
              this.numero = 1;
              this.clienteEntidadForm.reset();
              this.snackBar.open('Registro exitoso.', 'Ok', {
                duration: 2000
              });
            }
          },
          (error: any) => {
            // error de no conexion al servicio
            this.excepciones(error, 2);
            //  this.excepciones()
            this.numero = 1;
            console.log(error);
          }
        );
      // console.log(data);
    } catch (error) {
      this.excepciones(error, 1);
      // error en el metodo
      console.log(error);
    }
  }

  excepciones(stack, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'add-cliente.component',
          mensajeExcepcion: '',
          stack: stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        // console.log('The dialog was closed');
      });

    } catch (err) {
      console.log(err)
    }
  }
}

