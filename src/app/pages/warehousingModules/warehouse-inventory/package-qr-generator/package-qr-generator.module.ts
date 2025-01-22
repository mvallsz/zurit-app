import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angular2-qrcode';
import { PackageQrGeneratorComponent } from './package-qr-generator.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HighlightModule } from '../../../../../@vex/components/highlight/highlight.module';
import { IconModule } from '@visurel/iconify-angular';
import { TlCargoIdModule } from '../../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { NgxPrinterModule } from 'ngx-printer';
import { QrGeneratorMultiModule } from '../qr-generator-multi/qr-generator-multi.module';



@NgModule({
  declarations: [PackageQrGeneratorComponent],
  imports: [
    CommonModule,
    QRCodeModule,
    FlexLayoutModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    HighlightModule,
    IconModule,
    TlCargoIdModule,
    QrGeneratorMultiModule,
    NgxPrinterModule.forRoot({ printOpenWindow: true })
  ]
})
export class PackageQrGeneratorModule { }
