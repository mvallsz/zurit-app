import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuidesCreateUpdateComponent } from './guides-create-update.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SecondaryToolbarModule } from '../../../../../@vex/components/secondary-toolbar/secondary-toolbar.module';
import { MatSelectModule } from '@angular/material/select';
import { IconModule } from '@visurel/iconify-angular';
import { BreadcrumbsModule } from '../../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import { ContainerModule } from '../../../../../@vex/directives/container/container.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PickingListPackageModule } from '../picking-list-package/picking-list-package.module';
import { AddressCardModule } from '../../../utility/address-card/address-card.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { TempRepackingRegistryModule } from './temp-repacking-registry/temp-repacking-registry.module';
@NgModule({
  declarations: [GuidesCreateUpdateComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatIconModule,
    MatTableModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatDialogModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FlexLayoutModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    SecondaryToolbarModule,
    MatSelectModule,
    IconModule,
    BreadcrumbsModule,
    ContainerModule,
    MatDividerModule,
    NgxMatSelectSearchModule,
    PickingListPackageModule,
    AddressCardModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    TempRepackingRegistryModule
  ]
})
export class GuidesCreateUpdateModule {

}
