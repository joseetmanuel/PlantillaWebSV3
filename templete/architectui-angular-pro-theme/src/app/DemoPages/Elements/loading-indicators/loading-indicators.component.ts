import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-loading-indicators',
  templateUrl: './loading-indicators.component.html',
  styles: []
})
export class LoadingIndicatorsComponent implements OnInit {

  heading = 'Loading Indicators';
  subheading = 'Use these loading indicators in combination with other elements to show current app status to users.';
  icon = 'pe-7s-moon icon-gradient bg-amy-crisp';

  ngOnInit() {
  }

}
