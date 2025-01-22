import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRegisterRoutingModule } from './customer-register-routing.module';
import { CustomerRegisterComponent } from './customer-register.component';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';



@NgModule({
  declarations: [CustomerRegisterComponent],
  imports: [
    CommonModule,
    CustomerRegisterRoutingModule,
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
    MatRadioModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    NgxMatSelectSearchModule
    
    
  ]
})
export class CustomerRegisterModule {
}
