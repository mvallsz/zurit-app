import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrGuideComponent } from './qr-guide.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { QRCodeModule } from 'angular2-qrcode';
import { TlCargoIdModule } from '../../../pipes/tl-cargo-id/tl-cargo-id.module';



@NgModule({
  declarations: [QrGuideComponent],
  exports: [
    QrGuideComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    QRCodeModule,
    TlCargoIdModule
  ]
})
export class QrGuideModule { }
