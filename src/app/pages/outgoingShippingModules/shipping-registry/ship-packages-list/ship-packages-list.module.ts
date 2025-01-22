import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageLayoutModule } from '../../../../../@vex/components/page-layout/page-layout.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BreadcrumbsModule } from '../../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { IconModule } from '@visurel/iconify-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContainerModule } from '../../../../../@vex/directives/container/container.module';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PickingListWarehouseModule } from '../../shipping-guides/picking-list-warehouse/picking-list-warehouse.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShipPackagesListComponent } from './ship-packages-list.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TlCargoIdModule } from '../../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ShipPackagesListRoutingComponent } from './ship-packages-list-routing.component';
import { GuidesCreateUpdateModule } from '../../shipping-guides/guides-create-update/guides-create-update.module';
import { RegistryPackageCreateUpdateModule } from 'src/app/pages/warehousingModules/warehouse-inventory/registry-package-create-update/registry-package-create-update.module';

@NgModule({
  declarations: [ShipPackagesListComponent],
  exports: [
    ShipPackagesListComponent
  ],
  imports: [
    ShipPackagesListRoutingComponent,
    CommonModule,
    PageLayoutModule,
    FlexLayoutModule,
    BreadcrumbsModule,
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
    PickingListWarehouseModule,
    GuidesCreateUpdateModule,
    RegistryPackageCreateUpdateModule,
    MatProgressSpinnerModule,
    NgxSpinnerModule,
    TlCargoIdModule,
    ZXingScannerModule
  ]
})

export class ShipPackagesListModule {
}
