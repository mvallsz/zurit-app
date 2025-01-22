import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {environment} from '../../../../../environments/environment';
import {ShippingEnt} from '../interfaces/shipping.model';


const this_url = environment.this_url;

@Component({
  selector: 'vex-qr-generator',
  templateUrl: './qr-generator-shipper.component.html',
  styleUrls: ['./qr-generator-shipper.component.scss']
})

export class QrGeneratorShipperComponent implements OnInit {

  urlItem = '';

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: ShippingEnt) { }

  ngOnInit(): void {
    this.urlItem = `${ this_url }/shipping-picking-list/${ this.defaults._id }`;
  }

  onPrint() {
    window.print();
  }
}
