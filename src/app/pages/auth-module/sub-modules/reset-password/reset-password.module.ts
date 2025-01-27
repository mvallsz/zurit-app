import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IconModule } from '@visurel/iconify-angular';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgPasswordValidatorModule } from 'ng-password-validator';
import { HttpClientModule } from '@angular/common/http';
import {ResetPasswordComponent} from './reset-password.component';
import {ResetPasswordRoutingModule} from './reset-password-routing.module';

@NgModule({
  declarations: [ResetPasswordComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSnackBarModule,
    IconModule,
    NgPasswordValidatorModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    ResetPasswordRoutingModule
  ]
})
export class ResetPasswordModule { }
