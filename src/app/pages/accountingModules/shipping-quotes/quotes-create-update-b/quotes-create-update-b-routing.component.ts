import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink'; import { VexRoutes } from '../../../../../@vex/interfaces/vex-route.interface';
import { QuotesCreateUpdateBComponent } from './quotes-create-update-b.component';


const routes: VexRoutes = [
  {
    path: '',
    component: QuotesCreateUpdateBComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class QuotesCreateUpdateBRoutingComponent { }
