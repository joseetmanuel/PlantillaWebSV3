import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.sass']
})
export class AddClienteComponent implements OnInit {
  empresa: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  public tipo = '';
  test: boolean = true;
  

  profileForm = new FormGroup({
    nombreCliente: new FormControl('',[Validators.required]),
    empresa: new FormControl('',[Validators.required]),
    razonSocial: new FormControl('',[Validators.required]),
    nombreComercial: new FormControl('',[Validators.required]),
    rfcCliente: new FormControl('',[Validators.required]),
    cp: new FormControl('',[Validators.required]),
    estado: new FormControl({value: 'El estado se llenará con su CP', disabled: true},[Validators.required]),
    municipio: new FormControl('',[Validators.required]),
    tipoAsentamiento: new FormControl('',[Validators.required]),
    asentamiento: new FormControl('',[Validators.required]),
    tipoVialidad: new FormControl('',[Validators.required]),
    vialidad: new FormControl('',[Validators.required]),
  });

  matcher = new MyErrorStateMatcher();
  constructor() { }

  ngOnInit() {
  }

  tipoVivienda(val) {
    this.tipo = val
    console.log(this.tipo)
  }

  hol() {
    console.log('uhjk')
  }
  addprop1(event) {
    console.log(event);

  }
  marked = false;
  theCheckbox = false;
  toggleVisibility(e){
    this.marked= e.target.checked;
    console.log(e.target.checked)
  }
}
