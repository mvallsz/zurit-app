import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingBitacoraComponent } from './shipping-bitacora.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';
import { MatGridListModule } from '@angular/material/grid-list';


import { NgxBarcodeModule } from 'ngx-barcode';
import { QRCodeModule } from 'angular2-qrcode';
import { NgxPrinterModule } from 'ngx-printer';

@NgModule({
  declarations: [ShippingBitacoraComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    IconModule,
    MatGridListModule,
    NgxBarcodeModule,
    QRCodeModule,
    NgxPrinterModule.forRoot({ printOpenWindow: true })
  ]
})
export class ShippingBitacoraModule {
}
