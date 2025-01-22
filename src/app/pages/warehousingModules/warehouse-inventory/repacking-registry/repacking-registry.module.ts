import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepackingRegistryComponent } from './repacking-registry.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { IconModule } from '@visurel/iconify-angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BreadcrumbsModule } from 'src/@vex/components/breadcrumbs/breadcrumbs.module';
import { SecondaryToolbarModule } from 'src/@vex/components/secondary-toolbar/secondary-toolbar.module';
import { ContainerModule } from 'src/@vex/directives/container/container.module';
import { PickingListPackagesModule } from './picking-list-packages/picking-list-packages.module';



@NgModule({
  declarations: [RepackingRegistryComponent],
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
    PickingListPackagesModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ]
})
export class RepackingRegistryModule { }
