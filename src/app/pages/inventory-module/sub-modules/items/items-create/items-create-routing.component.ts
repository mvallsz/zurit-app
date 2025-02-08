import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink'; import { VexRoutes } from '../../../../../../@vex/interfaces/vex-route.interface';
import { ItemsCreateComponent } from './items-create.component';


const routes: VexRoutes = [
  {
    path: '',
    component: ItemsCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ItemsCreateRoutingComponent { }
