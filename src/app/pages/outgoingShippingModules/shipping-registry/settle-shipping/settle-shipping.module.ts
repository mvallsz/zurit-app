import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettleShippingComponent } from './settle-shipping.component';
import { PageLayoutModule } from 'src/@vex/components/page-layout/page-layout.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContainerModule } from '../../../../../@vex/directives/container/container.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PickingListPackageModule } from '../../shipping-guides/picking-list-package/picking-list-package.module';
import { PickingListWarehouseModule } from '../../shipping-guides/picking-list-warehouse/picking-list-warehouse.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatSelectModule } from '@angular/material/select';
import { IconModule } from '@visurel/iconify-angular';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
    WidgetQuickValueCenterModule
} from '../../../../../@vex/components/widgets/widget-quick-value-center/widget-quick-value-center.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TempShippingManifestModule } from './temp-shipping-manifest/temp-shipping-manifest.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDividerModule } from '@angular/material/divider';
import {
    WidgetQuickLineChartModule
} from '../../../../../@vex/components/widgets/widget-quick-line-chart/widget-quick-line-chart.module';
import { ChartModule } from '../../../../../@vex/components/chart/chart.module';
import { WidgetAssistantModule } from '../../../../../@vex/components/widgets/widget-assistant/widget-assistant.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TlCargoIdModule } from '../../../../pipes/tl-cargo-id/tl-cargo-id.module';
import { SettleShippingRoutingComponent } from './settle-shipping-routing.component';
import { BreadcrumbsModule } from 'src/@vex/components/breadcrumbs/breadcrumbs.module';
import { ShippingBitacoraModule } from 'src/app/pages/utility/shipping-bitacora/shipping-bitacora.module';



@NgModule({
    declarations: [SettleShippingComponent],
    imports: [
        SettleShippingRoutingComponent,
        CommonModule,
        PageLayoutModule,
        FlexLayoutModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
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
        NgxSpinnerModule,
        MatCheckboxModule,
        WidgetQuickValueCenterModule,
        MatFormFieldModule,
        MatInputModule,
        NgxMatSelectSearchModule,
        TempShippingManifestModule,
        MatDividerModule,
        WidgetQuickLineChartModule,
        ChartModule,
        WidgetAssistantModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        TlCargoIdModule,
        BreadcrumbsModule,
        ShippingBitacoraModule
    ]
})
export class SettleShippingModule { }
