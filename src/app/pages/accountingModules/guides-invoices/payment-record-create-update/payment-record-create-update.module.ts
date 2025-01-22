import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PaymentRecordCreateUpdateComponent} from './payment-record-create-update.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDialogModule} from '@angular/material/dialog';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {SecondaryToolbarModule} from '../../../../../@vex/components/secondary-toolbar/secondary-toolbar.module';
import {MatSelectModule} from '@angular/material/select';
import {IconModule} from '@visurel/iconify-angular';
import {BreadcrumbsModule} from '../../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import {ContainerModule} from '../../../../../@vex/directives/container/container.module';
import {MatDividerModule} from '@angular/material/divider';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {PickingListPackageModule} from '../../../outgoingShippingModules/shipping-guides/picking-list-package/picking-list-package.module';
import {AddressCardModule} from '../../../utility/address-card/address-card.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TlCargoIdModule} from '../../../../pipes/tl-cargo-id/tl-cargo-id.module';
import {TlCargoIdPipe} from '../../../../pipes/tl-cargo-id/tl-cargo-id.pipe';
import {PaymentBitacoraModule} from '../../../utility/payment-bitacora/payment-bitacora.module';



@NgModule({
  declarations: [PaymentRecordCreateUpdateComponent],
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
        TlCargoIdModule,
        PaymentBitacoraModule
    ]
})
export class PaymentRecordCreateUpdateModule { }
