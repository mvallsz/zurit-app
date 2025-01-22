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
import { GuidesCreateUpdateModule } from '../../shipping-guides/guides-create-update/guides-create-update.module';
import { PickingListPackageModule } from '../../shipping-guides/picking-list-package/picking-list-package.module';
import { PickingListWarehouseModule } from '../../shipping-guides/picking-list-warehouse/picking-list-warehouse.module';
import { AddressCardModule } from '../../../utility/address-card/address-card.module';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PickingListGuideComponent} from './picking-list-guide.component';
import {NgxSpinnerModule} from 'ngx-spinner';

@NgModule({
  declarations: [PickingListGuideComponent],
  exports: [
    PickingListGuideComponent
  ],
  imports: [
    CommonModule,
    PageLayoutModule,
    FlexLayoutModule,
    BreadcrumbsModule,
    GuidesCreateUpdateModule,
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
    PickingListPackageModule,
    PickingListWarehouseModule,
    AddressCardModule,
    MatProgressSpinnerModule,
    NgxSpinnerModule
  ]
})

export class PickingListGuideModule {
}
