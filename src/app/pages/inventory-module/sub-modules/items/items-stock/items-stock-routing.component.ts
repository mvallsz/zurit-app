import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../../../@vex/interfaces/vex-route.interface';
import { ItemsStockComponent } from './items-stock.component';

const routes: VexRoutes = [
  {
    path: '',
    component: ItemsStockComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})
export class ItemsStockRoutingComponent { }
