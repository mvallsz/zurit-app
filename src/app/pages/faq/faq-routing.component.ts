import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../@vex/interfaces/vex-route.interface';
import { FaqComponent } from './faq.component';


const routes: VexRoutes = [
  {
    path: '',
    component: FaqComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class FaqRoutingComponent { }
