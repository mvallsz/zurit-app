import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Error401RoutingModule } from './error-401-routing.module';
import { Error401Component } from './error-401.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IconModule } from '@visurel/iconify-angular';


@NgModule({
  declarations: [Error401Component],
  imports: [
    CommonModule,
    Error401RoutingModule,
    FlexLayoutModule,
    IconModule
  ]
})
export class Error401Module {
}
