import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../../@vex/interfaces/vex-route.interface';
import { ShipPackagesListComponent } from './ship-packages-list.component';


const routes: VexRoutes = [
  {
    path: '',
    component: ShipPackagesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ShipPackagesListRoutingComponent { }
