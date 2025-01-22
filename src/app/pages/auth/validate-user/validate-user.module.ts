import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidateUserComponent } from './validate-user.component';
import { ValidateUserRoutingModule } from './validate-user-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ValidateUserComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    ValidateUserRoutingModule
  ]
})
export class ValidateUserModule { }
