import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../@vex/interfaces/vex-route.interface';
import {PaymentTypesRegistryComponent} from './payment-types-registry.component';


const routes: VexRoutes = [
  {
    path: '',
    component: PaymentTypesRegistryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class PaymentTypesRegistryRoutingModule { }
