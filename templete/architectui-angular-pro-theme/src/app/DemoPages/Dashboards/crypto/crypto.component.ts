import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crypto',
  templateUrl: './crypto.component.html',
  styles: []
})
export class CryptoComponent implements OnInit {

  heading = 'Crypto Dashboard';
  subheading = 'This is an example dashboard created using build-in elements and components.';
  icon = 'pe-7s-plane icon-gradient bg-tempting-azure';

  constructor() { }

  ngOnInit() {
  }

}
