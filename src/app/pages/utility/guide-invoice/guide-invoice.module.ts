import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuideInvoiceComponent } from './guide-invoice.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';
import { MatGridListModule } from '@angular/material/grid-list';

import { NgxBarcodeModule } from 'ngx-barcode';
import { GuideInvoiceRoutingModule } from './guide-invoice-routing.module';
import { TlCargoIdPipe } from '../../../pipes/tl-cargo-id/tl-cargo-id.pipe';
import { TlCargoIdModule } from '../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { NgxPrinterModule } from 'ngx-printer';

@NgModule({
  declarations: [GuideInvoiceComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    IconModule,
    MatGridListModule,
    NgxBarcodeModule,
    GuideInvoiceRoutingModule,
    TlCargoIdModule,
    NgxPrinterModule.forRoot({ printOpenWindow: true })
  ]
})
export class GuideInvoiceModule {
}
