import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PackageReceiptRoutingModule } from './package-receipt-routing.module';
import { PackageReceiptComponent } from './package-receipt.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';
import { MatButtonModule } from '@angular/material/button';
import { TlCargoIdModule } from '../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { TlCargoIdPipe } from 'src/app/pipes/tl-cargo-id/tl-cargo-id.pipe';
import { NgxPrinterModule } from 'ngx-printer';


@NgModule({
  declarations: [PackageReceiptComponent],
  imports: [
    CommonModule,
    PackageReceiptRoutingModule,
    FlexLayoutModule,
    MatButtonModule,
    IconModule,
    TlCargoIdModule,
    NgxPrinterModule.forRoot({ printOpenWindow: true })
  ],
  providers: [TlCargoIdPipe]
})
export class PackageReceiptModule {
}
