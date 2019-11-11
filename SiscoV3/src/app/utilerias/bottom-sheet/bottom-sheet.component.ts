import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.sass']
})
export class BottomSheetComponent implements OnInit {
  public items: any[]

  constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { items: any[] } ) {
    this.items = data.items;
  }

  ngOnInit() {
  }

  openLink(item: any): void {
    this.bottomSheetRef.dismiss(item);
    
  }

}
