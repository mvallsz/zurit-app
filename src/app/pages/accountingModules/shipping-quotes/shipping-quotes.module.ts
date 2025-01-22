import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ShippingQuotesRoutingComponent } from "./shipping-quotes-routing.component";
import { ShippingQuotesComponent } from "./shipping-quotes.component";
import { PageLayoutModule } from "../../../../@vex/components/page-layout/page-layout.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { BreadcrumbsModule } from "../../../../@vex/components/breadcrumbs/breadcrumbs.module";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { IconModule } from "@visurel/iconify-angular";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ContainerModule } from "../../../../@vex/directives/container/container.module";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { PickingListPackageModule } from "./picking-list-package/picking-list-package.module";
import { PickingListWarehouseModule } from "./picking-list-warehouse/picking-list-warehouse.module";
import { AddressCardModule } from "../../utility/address-card/address-card.module";

import { NgxSpinnerModule } from "ngx-spinner";
import { PaymentRecordCreateUpdateModule } from "../../accountingModules/guides-invoices/payment-record-create-update/payment-record-create-update.module";
import { TlCargoIdModule } from "../../../pipes/tl-cargo-id/tl-cargo-id.module";
import { TlCargoIdPipe } from "src/app/pipes/tl-cargo-id/tl-cargo-id.pipe";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { GuidesCreateUpdateComponent } from "../../outgoingShippingModules/shipping-guides/guides-create-update/guides-create-update.component";
import { GuidesCreateUpdateModule } from "../../outgoingShippingModules/shipping-guides/guides-create-update/guides-create-update.module";

@NgModule({
  declarations: [ShippingQuotesComponent],
  imports: [
    CommonModule,
    ShippingQuotesRoutingComponent,
    PageLayoutModule,
    FlexLayoutModule,
    BreadcrumbsModule,
    GuidesCreateUpdateModule,
    PaymentRecordCreateUpdateModule,
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
    NgxSpinnerModule,
    TlCargoIdModule,
    MatProgressSpinnerModule,
  ],
  providers: [TlCargoIdPipe],
})
export class ShippingQuotesModule { }
