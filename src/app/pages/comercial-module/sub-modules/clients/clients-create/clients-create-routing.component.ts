import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink'; import { VexRoutes } from '../../../../../../@vex/interfaces/vex-route.interface';
import { ClientsCreateComponent } from './clients-create.component';


const routes: VexRoutes = [
  {
    path: '',
    component: ClientsCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ClientsCreateRoutingComponent { }
