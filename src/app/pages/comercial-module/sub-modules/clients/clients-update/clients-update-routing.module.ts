import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { ClientsUpdateComponent } from './clients-update.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsUpdateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})
export class ClientsUpdateRoutingModule {
}
