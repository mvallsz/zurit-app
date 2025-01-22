import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../@vex/interfaces/vex-route.interface';
import {QrGuideComponent} from './qr-guide.component';


const routes: VexRoutes = [
  {
    path: '',
    component: QrGuideComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class QrGuideRoutingComponent { }
