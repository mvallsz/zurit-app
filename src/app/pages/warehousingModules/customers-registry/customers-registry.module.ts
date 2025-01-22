import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CustomersRegistryRoutingModule } from "./customers-registry-routing.component";
import { CustomersRegistryComponent } from "./customers-registry.component";
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
import { CustomerCreateUpdateModule } from "./customer-create-update/customer-create-update.module";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { NgxSpinnerModule } from "ngx-spinner";
import { BalanceBitacoraModule } from "../../utility/balance-bitacora/balance-bitacora.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  declarations: [CustomersRegistryComponent],
  imports: [
    CommonModule,
    CustomersRegistryRoutingModule,
    PageLayoutModule,
    FlexLayoutModule,
    BreadcrumbsModule,
    CustomerCreateUpdateModule,
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
    MatAutocompleteModule,
    NgxSpinnerModule,
    BalanceBitacoraModule,
    MatProgressSpinnerModule,
  ],
})
export class CustomersRegistryModule {}
