import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SiscoV3Service } from '../../services/siscov3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component';
import { ActivatedRoute, Router } from '@angular/router';


/*
Cacha los posibles errores del fomControl
*/
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
  selector: 'app-ins-cliente',
  templateUrl: './ins-cliente.component.html',
  styleUrls: ['./ins-cliente.component.sass'],
  providers: [SiscoV3Service]
})
export class AddClienteComponent implements OnInit {
  idCliente;
  rfcClienteEntidad;
  clienteEntidad;
  datos;
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


  /*
  Hace las validaciones para que los datos que inserten del cliente sean correctos
  */
  clienteForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('1')
  });

  /*
  Hace las validaciones para que los datos que inserten del Cliente Entidad sean correctos
  */
  clienteEntidadForm = new FormGroup({
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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _siscoV3Service: SiscoV3Service
  ) {
    try {
      /*
      Obtiene el idClinte o rfcClienteEntidad por los parametros
      */
      this.activatedRoute.params.subscribe(parametros => {
        this.numero = 0;
        this.idCliente = parametros.idCliente;
        this.rfcClienteEntidad = parametros.rfcClienteEntidad;


        /*
        Si solo llega el idCliente por los parametros entonces se va a insertar un nuevo dato Fiscal. De lo contrario si llega el
        rfcClienteEntidad los datos de ese rfc serán actualizados.
        */
        if (parametros.idCliente) {
          this.numero = 0;
          _siscoV3Service
            .getService('cliente/getClientePorId?idCliente=' + this.idCliente)
            .subscribe(
              (res: any) => {
                if (res.err) {
                  this.numero = 1;
                  this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                  this.numero = 1;
                  this.excepciones(res.excepcion, 3);
                } else {
                  this.numero = 1;
                  this.datos = res.recordsets[0][0];
                }
              },
              (error: any) => {
                this.numero = 1;
                this.excepciones(error, 2);
              }
            );
        }
        if (parametros.rfcClienteEntidad) {
          this.numero = 0;
          _siscoV3Service
            .getService(
              'cliente/getClienteEntidadConDireccion?rfcClienteEntidad=' +
                this.rfcClienteEntidad
            )
            .subscribe(
              (res: any) => {
                if (res.err) {
                  this.numero = 1;
                  this.excepciones(res.err, 4);
                } else if (res.excepcion) {
                  this.numero = 1;
                  this.excepciones(res.excepcion, 3);
                } else {
                  this.datos = res.recordsets[0][0];
                  const num = this.datos.idTipoPersona;
                  this.clienteForm.controls['nombre'].setValue(
                    this.datos.nombre
                  );
                  this.clienteEntidadForm.controls['tipoPersona'].setValue(
                    num.toString()
                  );
                  this.clienteEntidadForm.controls['razonSocial'].setValue(
                    this.datos.razonSocial
                  );
                  this.clienteEntidadForm.controls['nombreComercial'].setValue(
                    this.datos.nombreComercial
                  );
                  this.clienteEntidadForm.controls['rfcCliente'].setValue(
                    this.datos.rfcClienteEntidad
                  );
                  this.clienteEntidadForm.controls['personaContacto'].setValue(
                    this.datos.personaContacto
                  );
                  this.clienteEntidadForm.controls['telefono'].setValue(
                    this.datos.telefono
                  );
                  this.clienteEntidadForm.controls['email'].setValue(
                    this.datos.email
                  );
                  this.clienteEntidadForm.controls['cp'].setValue(
                    this.datos.codigoPostal
                  );
                  this.clienteEntidadForm.controls['tipoAsentamiento'].setValue(
                    this.datos.idTipoAsentamiento
                  );

                  this.clienteEntidadForm.controls['tipoVialidad'].setValue(
                    this.datos.idTipoVialidad
                  );
                  this.clienteEntidadForm.controls['vialidad'].setValue(
                    this.datos.vialidad
                  );
                  this.clienteEntidadForm.controls['numeroExterior'].setValue(
                    this.datos.numeroExterior
                  );
                  this.clienteEntidadForm.controls['numeroInterior'].setValue(
                    this.datos.numeroInterior
                  );
                  this.getCp();
                  this.clienteEntidadForm.controls['asentamiento'].setValue(
                    this.datos.asentamiento
                  );
                  this.numero = 1;
                }
              },
              (error: any) => {
                this.numero = 1;
                this.excepciones(error, 2);
              }
            );
        }
      });
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /*
  Cargamos los datos iniciales de la aplicacion que son el tipoVialidad y tipoAsentamiento
  */
  ngOnInit() {
    try {
      this.numero = 0;
      this._siscoV3Service.getService('common/getTipoVialidad').subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.tipoVialidades = res.recordsets[0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
          this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
            duration: 2000
          });
        }
      );
      this.numero = 0;
      this._siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
        (res: any) => {
          if (res.err) {
            this.numero = 1;
            this.excepciones(res.err, 4);
          } else if (res.excepcion) {
            this.numero = 1;
            this.excepciones(res.excepcion, 3);
          } else {
            this.numero = 1;
            this.tipoAsentamientos = res.recordsets[0];
          }
        },
        (error: any) => {
          this.numero = 1;
          this.excepciones(error, 2);
        }
      );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /*
  Este metodo se encarga de buscar el código postal, junto con su estado, municipio y asentamiento
  */
  getCp() {
    try {
      if (this.clienteEntidadForm.controls['cp'].value) {
        this.numero = 0;
        this._siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.clienteEntidadForm.controls['cp'].value
          })
          .subscribe(
            (res: any) => {
              if (res.err) {
                this.numero = 1;
                this.excepciones(res.err, 4);
              } else if (res.excepcion) {
                this.numero = 1;
                this.excepciones(res.excepcion, 3);
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
                  if (!this.datos.asentamiento) {
                    this.clienteEntidadForm.controls['asentamiento'].setValue(
                      ''
                    );
                  }
                }
              }
            },
            (error: any) => {
              this.excepciones(error, 2);
              this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
                duration: 2000
              });
              this.numero = 1;
            }
          );
      }
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1);
    }
  }

  /*
  Cuando le den enter en el capo de código Postal ejecutará el metodo getCp().
  */
  onKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /*
  Agrega un nuevo dato fiscal
  */
  agregarClienteEntidad() {
    try {
      this.numero = 0;
      const data = {
        idCliente: this.datos.idCliente,
        idPais: this.idPais,
        idEstado: this.idEstado,
        idMunicipio: this.idMunicipio,
        codigoPostal: this.clienteEntidadForm.controls['cp'].value,
        idTipoAsentamiento: this.clienteEntidadForm.controls['tipoAsentamiento']
          .value,
        asentamiento: this.clienteEntidadForm.controls['asentamiento'].value,
        idTipoVialidad: this.clienteEntidadForm.controls['tipoVialidad'].value,
        vialidad: this.clienteEntidadForm.controls['vialidad'].value,
        numeroExterior: this.clienteEntidadForm.controls['numeroExterior']
          .value,
        numeroInterior: this.clienteEntidadForm.controls['numeroInterior']
          .value,
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
            if (res.err) {
              this.numero = 1;
              // error tipo base de datos
              this.excepciones(res.err, 4);
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
            this.numero = 1;
          }
        );
    } catch (error) {
      this.excepciones(error, 1);
      // error en el metodo
    }
  }


  /**
   Agrega un nuevo Cliente
   */
  agregarCliente() {
    try {
      this.numero = 0;
      const data = {
        nombre: this.clienteForm.controls['nombre'].value,
        idUsuario: this.clienteForm.controls['idUsuario'].value
      };
      this._siscoV3Service
        .postService('cliente/postInsertaCliente', data)
        .subscribe(
          (res: any) => {
            if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              this.excepciones(res.excepcion, 3);
            } else {
              this.numero = 1;
              this.router.navigateByUrl(
                '/upd-cliente/' + res.recordsets[1][0].idCliente
              );
            }
          },
          (error: any) => {
            this.numero = 1;
            this.excepciones(error, 2);
          }
        );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }


  /*
  Modifica los datos de un dato fiscal
  */
  modificarClienteEntidad() {
    try {
      this.numero = 0;
      const data = {
        idCliente: this.datos.idCliente,
        idDireccion: this.datos.idDireccion,
        idPais: this.idPais,
        idEstado: this.idEstado,
        idMunicipio: this.idMunicipio,
        codigoPostal: this.clienteEntidadForm.controls['cp'].value,
        idTipoAsentamiento: this.clienteEntidadForm.controls['tipoAsentamiento']
          .value,
        asentamiento: this.clienteEntidadForm.controls['asentamiento'].value,
        idTipoVialidad: this.clienteEntidadForm.controls['tipoVialidad'].value,
        vialidad: this.clienteEntidadForm.controls['vialidad'].value,
        numeroExterior: this.clienteEntidadForm.controls['numeroExterior']
          .value,
        numeroInterior: this.clienteEntidadForm.controls['numeroInterior']
          .value,
        rfcClienteEntidad: this.clienteEntidadForm.controls['rfcCliente'].value,
        razonSocial: this.clienteEntidadForm.controls['razonSocial'].value,
        nombreComercial: this.clienteEntidadForm.controls['nombreComercial']
          .value,
        idTipoPersona: this.clienteEntidadForm.controls['tipoPersona'].value,
        idLogo: this.datos.idLogo,
        personaContacto: this.clienteEntidadForm.controls['personaContacto']
          .value,
        telefono: this.clienteEntidadForm.controls['telefono'].value,
        email: this.clienteEntidadForm.controls['email'].value
      };
      this._siscoV3Service
        .putService('cliente/putActualizaDireccionClienteEntidad', data)
        .subscribe(
          (res: any) => {
            if (res.err) {
              this.numero = 1;
              this.excepciones(res.err, 4);
            } else if (res.excepcion) {
              this.numero = 1;
              this.excepciones(res.excepcion, 3);
            } else {
              this.numero = 1;
              this.snackBar.open('Actualizado con exitoso.', 'Ok', {
                duration: 2000
              });
            }
          },
          (error: any) => {
            this.excepciones(error, 2);
            this.numero = 1;
          }
        );
    } catch (error) {
      this.excepciones(error, 1);
    }
  }

  /*
  En caso de que algun metodo, consulta a la base de datos o conexión con el servidor falle, se abrira el dialog de excepciones
  */
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

      dialogRef.afterClosed().subscribe((result: any) => {});
    } catch (error) {
      console.error(error);
    }
  }
}
