import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingPickListComponent } from './shipping-pick-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';
import { MatGridListModule } from '@angular/material/grid-list';

import { NgxBarcodeModule } from 'ngx-barcode';

@NgModule({
  declarations: [ShippingPickListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    IconModule,
    MatGridListModule,
    NgxBarcodeModule
  ]
})
export class ShippingPickListModule {
}
