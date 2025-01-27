import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../../@vex/interfaces/vex-route.interface';
import { ItemsInventory } from './items-inventory.component';


const routes: VexRoutes = [
  {
    path: '',
    component: ItemsInventory
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ItemsRoutingComponent { }
