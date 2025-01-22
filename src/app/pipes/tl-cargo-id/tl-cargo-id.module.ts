import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TlCargoIdPipe} from './tl-cargo-id.pipe';



@NgModule({
  declarations: [TlCargoIdPipe],
  imports: [
    CommonModule
  ],
  exports: [TlCargoIdPipe]
})
export class TlCargoIdModule { }
