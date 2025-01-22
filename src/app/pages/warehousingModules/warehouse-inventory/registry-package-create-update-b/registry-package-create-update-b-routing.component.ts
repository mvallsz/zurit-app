import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink'; import { VexRoutes } from '../../../../../@vex/interfaces/vex-route.interface';
import { RegistryPackageCreateUpdateBComponent } from './registry-package-create-update-b.component';


const routes: VexRoutes = [
  {
    path: '',
    component: RegistryPackageCreateUpdateBComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class RegistryPackageCreateUpdateBRoutingComponent { }
