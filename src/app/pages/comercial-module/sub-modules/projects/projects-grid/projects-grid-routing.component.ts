import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuicklinkModule } from 'ngx-quicklink';
import { VexRoutes } from '../../../../../../@vex/interfaces/vex-route.interface';
import { UnsavedChangesGuard } from 'src/app/guards/unsaved-changes';
import { ProjectsGridComponent } from './projects-grid.component';


const routes: VexRoutes = [
  {
    path: '',
    component: ProjectsGridComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, QuicklinkModule]
})

export class ProjectsGridRoutingModule { }
