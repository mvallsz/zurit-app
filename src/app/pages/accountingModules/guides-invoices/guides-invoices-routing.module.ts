import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../@vex/interfaces/vex-route.interface';
import {GuidesInvoicesComponent} from './guides-invoices.component';


const routes: VexRoutes = [
  {
    path: '',
    component: GuidesInvoicesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class GuidesInvoicesRoutingModule { }
