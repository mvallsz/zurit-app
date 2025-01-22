import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WarehouseItemFull } from '../interfaces/warehouse-item-full.model';

import { environment } from '../../../../../environments/environment';

const this_url = environment.this_url;

@Component({
  selector: 'vex-qr-generator',
  templateUrl: './qr-generator.component.html',
  styleUrls: ['./qr-generator.component.scss']
})

export class QrGeneratorComponent implements OnInit {

  urlItem = '';

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: WarehouseItemFull) { }

  ngOnInit(): void {
    this.urlItem = `${this_url}/warehouse-item-receipt/${this.defaults._id}`;
  }

  onPrint() {
    window.print();
  }
}
