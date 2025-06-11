import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../../../@vex/interfaces/vex-route.interface';
import { ProjectsCreateComponent } from './projects-create.component';
import { UnsavedChangesGuard } from 'src/app/guards/unsaved-changes';


const routes: VexRoutes = [
  {
    path: '',
    component: ProjectsCreateComponent,
    canDeactivate: [UnsavedChangesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ProjectsCreateRoutingModule { }
