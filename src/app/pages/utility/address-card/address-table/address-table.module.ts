import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressTableComponent } from './address-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import {PageLayoutModule} from '../../../../../@vex/components/page-layout/page-layout.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BreadcrumbsModule} from '../../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {IconModule} from '@visurel/iconify-angular';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ContainerModule} from '../../../../../@vex/directives/container/container.module';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule({
  declarations: [AddressTableComponent],
  exports: [ AddressTableComponent],
  imports: [
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
    MatTooltipModule,
    ContainerModule,
    MatButtonToggleModule
  ]
})
export class AddressTableModule { }
