import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { ValidateUserComponent } from './validate-user.component';


const routes: Routes = [
  {
    path: '',
    component: ValidateUserComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ValidateUserRoutingModule { }
