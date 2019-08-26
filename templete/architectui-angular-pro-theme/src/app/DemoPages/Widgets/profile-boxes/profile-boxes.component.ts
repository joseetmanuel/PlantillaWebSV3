import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-profile-boxes',
  templateUrl: './profile-boxes.component.html',
  styles: []
})
export class ProfileBoxesComponent implements OnInit {

  heading = 'Profile Boxes';
  subheading = 'These boxes are usually for dashboard elements centered around users and profiles.';
  icon = 'pe-7s-science icon-gradient bg-happy-itmeo';

  constructor() {
  }

  ngOnInit() {
  }

}
