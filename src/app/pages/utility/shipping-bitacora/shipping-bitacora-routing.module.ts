import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { ShippingBitacoraComponent } from './shipping-bitacora.component';
import { VexRoutes } from '../../../../@vex/interfaces/vex-route.interface';

const routes: VexRoutes = [
  {
    path: '',
    component: ShippingBitacoraComponent,
    data: {
      toolbarShadowEnabled: true,
      containerEnabled: true
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})
export class ShippingBitacoraRoutingModule {
}
