import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angular2-qrcode';
import { GuideQrGeneratorComponent } from './guide-qr-generator.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HighlightModule } from '../../../../../@vex/components/highlight/highlight.module';
import { IconModule } from '@visurel/iconify-angular';
import { TlCargoIdModule } from '../../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { QrGuideModule } from '../../../utility/qr-guide/qr-guide.module';
import { NgxPrinterModule } from 'ngx-printer';



@NgModule({
  declarations: [GuideQrGeneratorComponent],
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
    QrGuideModule,
    NgxPrinterModule.forRoot({ printOpenWindow: true })
  ]
})
export class GuideQrGeneratorModule { }
