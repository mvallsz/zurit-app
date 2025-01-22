import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angular2-qrcode';
import {QrGeneratorShipperComponent} from './qr-generator-shipper.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HighlightModule } from '../../../../../@vex/components/highlight/highlight.module';
import { IconModule } from '@visurel/iconify-angular';



@NgModule({
  declarations: [QrGeneratorShipperComponent],
  imports: [
    CommonModule,
    QRCodeModule,
    FlexLayoutModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    HighlightModule,
    IconModule
  ]
})
export class QrGeneratorShipperModule { }
