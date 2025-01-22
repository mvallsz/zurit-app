import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuidePickListComponent } from './guide-pick-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';
import { MatGridListModule } from '@angular/material/grid-list';

import { NgxBarcodeModule } from 'ngx-barcode';
import { GuidePickListRoutingModule } from './guide-pick-list-routing.module';
import { TlCargoIdModule } from '../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { NgxPrinterModule } from 'ngx-printer';

@NgModule({
  declarations: [GuidePickListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    IconModule,
    MatGridListModule,
    NgxBarcodeModule,
    GuidePickListRoutingModule,
    TlCargoIdModule,
    NgxPrinterModule.forRoot({ printOpenWindow: true })

  ]
})
export class GuidePickListModule {
}
