import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ClienteService } from './add-cliente.service';
import { EmpresaService } from './empresa.service';
import { CommonService } from './common.service';

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
  public tipo = '';
  public municipios;
  public tipoVialidades;
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
    correoElectronico: new FormControl('', []),
    cp: new FormControl('', [Validators.required]),
    estado: new FormControl({ value: 'El estado se llenará con su CP', disabled: true }, [Validators.required]),
    municipio: new FormControl({ value: 'El municipio se llenará con su CP', disabled: true }, [Validators.required]),
    tipoAsentamiento: new FormControl('', [Validators.required]),
    asentamiento: new FormControl('', [Validators.required]),
    tipoVialidad: new FormControl('', [Validators.required]),
    vialidad: new FormControl('', [Validators.required]),

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

    this._commonService.getTipoVialidad().subscribe(res=>{
      this.tipoVialidades = res['recordsets'][0];
    },error=>{
      console.log(error)
    })
  }

  tipoVivienda(val) {
    this.tipo = val
    console.log(this.tipo)
  }

  guardarCliente() {
    let usuario = this.clienteForm.value;
    this._clienteService.postInsertaCliente(usuario).subscribe(res => {
      console.log(res['recordsets'])
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
          if(resp['recordsets'][0] < 1){
            console.log('bonita')
          }
          else{
            this.municipios  = resp['recordsets'][0];
            this.clienteEntidadForm.controls['estado'].setValue(resp['recordsets'][0][0]['nombreEstado'])
            this.clienteEntidadForm.controls['municipio'].setValue(resp['recordsets'][0][0]['nombreMunicipio'])
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
    console.log(this.clienteEntidadForm.valueChanges)
  }

}
