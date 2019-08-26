import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-chart-boxes1',
  templateUrl: './chart-boxes1.component.html',
  styles: []
})
export class ChartBoxes1Component implements OnInit {

  heading = 'Chart Boxes';
  subheading = 'These boxes can be used to show numbers and data in a breautiful user friendly way.';
  icon = 'pe-7s-star icon-gradient bg-ripe-malin';

  constructor() {
  }

  ngOnInit() {
  }

}
