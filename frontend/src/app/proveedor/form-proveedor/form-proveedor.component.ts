import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
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
import { ExcepcionComponent } from '../../utilerias/excepcion/excepcion.component'
import { IProveedor } from '../interfaces';
import { ITEM_STORAGE } from '../home-proveedor/enums';

@Component({
  selector: 'app-form-proveedor',
  templateUrl: './form-proveedor.component.html',
  styleUrls: ['./form-proveedor.component.sass']
})

export class FormProveedorComponent implements OnInit {

  @Input('newProveedor') newProveedor: boolean;
  @Input('rfcProveedor') rfcProveedor: boolean;
  @Output() formProveedorEvent = new EventEmitter<any>();
  @ViewChild('codigoPostal') cp;
  @ViewChild('municipio') municipio;

  public newProveedorForm = new FormGroup({
    idUsuario: new FormControl('1'),
    idTipoPersona: new FormControl('1', [Validators.required]),
    razonSocial: new FormControl('', [Validators.required]),
    nombreComercial: new FormControl('', [Validators.required]),
    rfcProveedor: new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13)
    ]),
    personaContacto: new FormControl('', []),
    telefono: new FormControl('', []),
    email: new FormControl('', [Validators.email, Validators.required]),
    codigoPostal: new FormControl('', [
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
    idTipoAsentamiento: new FormControl('', [Validators.required]),
    asentamiento: new FormControl({ value: '', disabled: true }, [
      Validators.required
    ]),
    idClase: new FormControl('1', [Validators.required]),
    idTipoVialidad: new FormControl('', [Validators.required]),
    vialidad: new FormControl('', [Validators.required]),
    numeroExterior: new FormControl('', []),
    numeroInterior: new FormControl('', [])
  });

  public rfcProveedorEntidad: string;
  public datosProveedor: IProveedor;
  public empresa;
  public tipo = 2;
  public municipios;
  public tipoVialidades;
  public tipoAsentamientos;
  public asentamiento:string;


  public numero: number = 1;
  public clases: any[];
  public valCp = false;
  public asentamientos;
  public idPais;
  public idEstado;
  public idMunicipio;

  constructor(private _siscoV3Service: SiscoV3Service, public dialog: MatDialog,
    private snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.numero = 0;

    if (!this.newProveedor) {
      /** Si es para actualizar el proveedor, obtenemos los datos el proveedor del localstorage */
      const datosProveedor:IProveedor = JSON.parse(localStorage.getItem(ITEM_STORAGE.ITEM_DATOS_PROVEEDOR))
      this.addDatosFormProveedor(datosProveedor);
    }

    this.getTipoVialidad();
    this.getTipoAsentamiento();
  }

  getTipoVialidad(){
    this._siscoV3Service.getService('common/getTipoVialidad').subscribe(
      (res: any) => {
        // console.log(res.recordsets[0]);
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4)
        } else if (res.excepcion) {
          this.numero = 1;
          this.excepciones(res.excepcion, 3)
        } else {
          this.numero = 1;
          this.tipoVialidades = res.recordsets[0];
        }
      },
      (error: any) => {
        this.numero = 1;
        console.log(error);
        this.excepciones(error, 2);
        this.snackBar.open('Error al Conectar con el servidor.', 'Ok', {
          duration: 2000
        });
      }
    );
  }

  getTipoAsentamiento(){
    this._siscoV3Service.getService('common/getTipoAsentamiento').subscribe(
      (res: any) => {
        if (res.err) {
          this.numero = 1;
          this.excepciones(res.err, 4)
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
        this.excepciones(error, 2)
      }
    );
  }

  addDatosFormProveedor(datosProveedor: IProveedor){
    this.idPais = datosProveedor.idPais;
    this.idEstado = datosProveedor.idEstado;
    this.idMunicipio = datosProveedor.idMunicipio;
    this.asentamiento = datosProveedor.asentamiento;
    this.newProveedorForm.controls['nombreComercial'].setValue(datosProveedor.nombreComercial);
    this.newProveedorForm.controls['razonSocial'].setValue(datosProveedor.razonSocial);
    this.newProveedorForm.controls['idTipoPersona'].setValue(datosProveedor.idTipoPersona);
    this.newProveedorForm.controls['rfcProveedor'].setValue(datosProveedor.rfcProveedor);
    this.newProveedorForm.controls['personaContacto'].setValue(datosProveedor.personaContacto);
    this.newProveedorForm.controls['idClase'].setValue(datosProveedor.idClase);
    this.newProveedorForm.controls['telefono'].setValue(datosProveedor.telefono);
    this.newProveedorForm.controls['email'].setValue(datosProveedor.email);
    this.newProveedorForm.controls['codigoPostal'].setValue(datosProveedor.codigoPostal);
    this.newProveedorForm.controls['estado'].setValue(datosProveedor.idEstado);
    this.newProveedorForm.controls['municipio'].setValue(datosProveedor.municipio);
    this.newProveedorForm.controls['idTipoAsentamiento'].setValue(datosProveedor.idTipoAsentamiento);
    this.newProveedorForm.controls['asentamiento'].setValue(datosProveedor.asentamiento);
    this.newProveedorForm.controls['idTipoVialidad'].setValue(datosProveedor.idTipoVialidad);
    this.newProveedorForm.controls['vialidad'].setValue(datosProveedor.vialidad);
    this.newProveedorForm.controls['numeroExterior'].setValue(datosProveedor.numeroExterior);
    this.newProveedorForm.controls['numeroInterior'].setValue(datosProveedor.numeroInterior);
  }
 

  getCp() {
    try {
      if (this.newProveedorForm.controls['codigoPostal'].value) {
        this.numero = 0;
        this._siscoV3Service
          .postService('common/postCpAutocomplete', {
            cp: this.newProveedorForm.controls['codigoPostal'].value
            // cpj: this.newProveedorForm.controls['cp'].value
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
                  this.newProveedorForm.controls['codigoPostal'].setValue('');
                } else {
                  this.numero = 1;
                  this.valCp = false;
                  this.asentamientos = res.recordsets[0];
                  this.idPais = res.recordsets[0][0]['idPais'];
                  this.idEstado = res.recordsets[0][0]['idEstado'];
                  this.idMunicipio = res.recordsets[0][0]['idMunicipio'];
                  this.newProveedorForm.controls['estado'].setValue(
                    res.recordsets[0][0]['nombreEstado']
                  );
                  this.newProveedorForm.controls['municipio'].setValue(
                    res.recordsets[0][0]['nombreMunicipio']
                  );
                  this.newProveedorForm.get('asentamiento').enable();
                  if (!this.datosProveedor) {
                    this.newProveedorForm.controls['asentamiento'].setValue('');
                  }
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
            }
          );
      }
    } catch (error) {
      this.numero = 1;
      this.excepciones(error, 1)
    }
  }

  onKeydown(event) {
    try {
      if (event.key === 'Enter') {
        this.cp.nativeElement.blur();
      }
    } catch (error) {
      this.excepciones(error, 1);
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

  agregarProveedor() {
    const dataProveedor: IProveedor = this.newProveedorForm.value;
    dataProveedor.idPais = this.idPais
    dataProveedor.idEstado = this.idEstado
    dataProveedor.idMunicipio = this.idMunicipio;
    dataProveedor.asentamiento = dataProveedor.asentamiento ? dataProveedor.asentamiento : this.asentamiento;
    this.formProveedorEvent.emit({ data: dataProveedor });
  }

}
