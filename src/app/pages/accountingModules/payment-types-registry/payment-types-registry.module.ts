import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PaymentTypesRegistryComponent} from './payment-types-registry.component';
import {PageLayoutModule} from '../../../../@vex/components/page-layout/page-layout.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BreadcrumbsModule} from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {IconModule} from '@visurel/iconify-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ContainerModule} from '../../../../@vex/directives/container/container.module';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {PaymentTypesRegistryRoutingModule} from './payment-types-registry-routing.module';
import {PaymentTypeCreateUpdateModule} from './payment-type-create-update/payment-type-create-update.module';
import {NgxSpinnerModule} from 'ngx-spinner';

@NgModule({
  declarations: [PaymentTypesRegistryComponent],
  imports: [
    CommonModule,
    PaymentTypesRegistryRoutingModule,
    PageLayoutModule,
    FlexLayoutModule,
    BreadcrumbsModule,
    PaymentTypeCreateUpdateModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    IconModule,
    FormsModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ContainerModule,
    MatSelectModule,
    MatButtonToggleModule,
    NgxSpinnerModule,
  ]
})
export class PaymentTypesRegistryModule { }
