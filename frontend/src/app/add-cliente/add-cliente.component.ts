import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ClienteService } from './add-cliente.service';
import { EmpresaService } from './empresa.service';
import { CommonService } from './common.service';
import { error } from 'util';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.sass'],
  providers: [ClienteService, EmpresaService, CommonService]
})
export class AddClienteComponent implements OnInit {
  public empresa;
  public tipo = 2;
  public municipios;
  public tipoVialidades;
  public tipoAsentamientos;
  public asentamientos;
  public idCliente = 0;
  public idPais;
  public idEstado;
  public idMunicipio;
  public numero = 1;
  @ViewChild('cp') cp;
  @ViewChild('municipio') municipio;

  clienteForm = this.fb.group({
    nombre: new FormControl('', [Validators.required]),
    rfcEmpresa: new FormControl('', [Validators.required]),
    idUsuario: new FormControl(1)
  });

  clienteEntidadForm = new FormGroup({
    tipoPersona: new FormControl('', []),
    razonSocial: new FormControl('', [Validators.required]),
    nombreComercial: new FormControl('', [Validators.required]),
    rfcCliente: new FormControl('', [Validators.required]),
    personaContacto: new FormControl('', []),
    telefono: new FormControl('', []),
    email: new FormControl('', [Validators.email]),
    cp: new FormControl('', [Validators.required]),
    estado: new FormControl({ value: 'El estado se llenará con su CP', disabled: true }, [Validators.required]),
    municipio: new FormControl({ value: 'El municipio se llenará con su CP', disabled: true }, [Validators.required]),
    tipoAsentamiento: new FormControl('', [Validators.required]),
    asentamiento: new FormControl({ value: 'Asentamiento', disabled: true }, [Validators.required]),
    tipoVialidad: new FormControl('', [Validators.required]),
    vialidad: new FormControl('', [Validators.required]),
    numeroExterior: new FormControl('',[]),
    numeroInterior: new FormControl('',[]),
    mz: new FormControl('',[]),
    lt: new FormControl('',[])
  })

  matcher = new MyErrorStateMatcher();

  constructor(private fb: FormBuilder,
    private _clienteService: ClienteService,
    private _empresaService: EmpresaService,
    private _commonService: CommonService) {
  }

  ngOnInit() {
    this._empresaService.getEmpresas().subscribe(res => {
      this.empresa = res['recordsets'][0];
    }, error => {
      console.log(error)
    })

    this._commonService.getTipoVialidad().subscribe(res => {
      this.tipoVialidades = res['recordsets'][0];
    }, error => {
      console.log(error)
    })

    this._commonService.getTipoAsentamiento().subscribe(res => {
      this.tipoAsentamientos = res['recordsets'][0];
    }, error => {
      console.log(error)
    })
  }

  tipoVivienda(numero) {
    this.tipo = numero
    if(numero == 0){
      this.clienteEntidadForm.controls['numeroExterior'].setValue('');
      this.clienteEntidadForm.controls['numeroInterior'].setValue('');
    }
    if(numero == 1){
      this.clienteEntidadForm.controls['mz'].setValue('');
      this.clienteEntidadForm.controls['lt'].setValue('');
    }
  }

  guardarCliente() {
    let usuario = this.clienteForm.value;
    this._clienteService.postInsertaCliente(usuario).subscribe(res => {
      console.log(res['recordsets'])
      this.idCliente = res['recordsets'][1][0]['idCliente'];
      console.log(this.idCliente)
    }, error => {
      console.log(error);
    })
  }


  getCp() {
    if (this.clienteEntidadForm.controls['cp'].value) {
      let data = {
        cp: this.clienteEntidadForm.controls['cp'].value
      }
      this._commonService.postCpAutocomplete(data).subscribe(
        resp => {
          if (resp['recordsets'][0] < 1) {
            console.log('bonita')
          }
          else {
            this.asentamientos = resp['recordsets'][0]
            this.idPais = resp['recordsets'][0][0]['idPais'];
            this.idEstado =  resp['recordsets'][0][0]['idEstado'];
            this.idMunicipio =  resp['recordsets'][0][0]['idMunicipio'];
            this.clienteEntidadForm.controls['estado'].setValue(resp['recordsets'][0][0]['nombreEstado'])
            this.clienteEntidadForm.controls['municipio'].setValue(resp['recordsets'][0][0]['nombreMunicipio'])
            this.clienteEntidadForm.get('asentamiento').enable();
            this.clienteEntidadForm.controls['asentamiento'].setValue('')
            console.log(this.asentamientos)
          }
        }, error => {
          console.log(error)
        })
    }
  }

  onKeydown(event) {
    if (event.key === "Enter") {
      this.cp.nativeElement.blur();
    }
  }

  otro() {
    let data = {
      idPais:this.idPais,
      idEstado:this.idEstado,
      idMunicipio:this.idMunicipio,
      codigoPostal:this.clienteEntidadForm.controls['cp'].value,
      idTipoAsentamiento:this.clienteEntidadForm.controls['tipoAsentamiento'].value,
      asentamiento:this.clienteEntidadForm.controls['asentamiento'].value,
      idTipoVialidad:this.clienteEntidadForm.controls['tipoVialidad'].value,
      vialidad:this.clienteEntidadForm.controls['vialidad'].value,
      numeroOMz:this.tipo,
      numeroExterior:this.clienteEntidadForm.controls['numeroExterior'].value,
      numeroInterior:this.clienteEntidadForm.controls['numeroInterior'].value,
      mz:this.clienteEntidadForm.controls['mz'].value,
      lt:this.clienteEntidadForm.controls['lt'].value,
      idCliente: this.idCliente,
      rfcClienteEntidad:this.clienteEntidadForm.controls['rfcCliente'].value,
      razonSocial:this.clienteEntidadForm.controls['razonSocial'].value,
      nombreComercial:this.clienteEntidadForm.controls['nombreComercial'].value,
      idTipoPersona:this.clienteEntidadForm.controls['tipoPersona'].value,
      personaContacto:this.clienteEntidadForm.controls['personaContacto'].value,
      telefono:this.clienteEntidadForm.controls['telefono'].value,
      email:this.clienteEntidadForm.controls['email'].value
    }
    this._clienteService.postInsertaClienteEntidad(data).subscribe(res=>{
      console.log(res)
    },error=>{
      console.log(error)
    })
    console.log(data)
  }

}
