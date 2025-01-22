import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WarehouseItemFull } from '../interfaces/warehouse-item-full.model';

import { environment } from '../../../../../environments/environment';
import { initPack } from 'src/static-data/tlcargo-static-data';


const this_url = environment.this_url;

@Component({
  selector: 'vex-qr-generator-multi',
  templateUrl: './qr-generator-multi.component.html',
  styleUrls: ['./qr-generator-multi.component.scss']
})

export class QrGeneratorMultiComponent implements OnInit {

  @Input()
  idQR: String = "";

  @Input()
  tlPckg: WarehouseItemFull = new WarehouseItemFull(initPack);

  urlItem = '';

  constructor() { }

  ngOnInit(): void {
    this.urlItem = `${this_url}/warehouse-item-receipt/${this.tlPckg._id}`;
  }

  onPrint() {
    window.print();
  }
}
