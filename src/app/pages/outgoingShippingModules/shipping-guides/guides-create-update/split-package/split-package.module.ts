import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { IconModule } from '@visurel/iconify-angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ContainerModule } from 'src/@vex/directives/container/container.module';
import { SplitPackageComponent } from './split-package.component';
import { TempPackageRegistryModule } from "../../../../warehousingModules/warehouse-inventory/registry-package-create-update/temp-package-registry/temp-package-registry.module";



@NgModule({
  declarations: [SplitPackageComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatIconModule,
    MatTableModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
    FlexLayoutModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    IconModule,
    ContainerModule,
    MatDividerModule,
    NgxMatSelectSearchModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    TempPackageRegistryModule
  ]
})
export class SplitPackageModule { }
