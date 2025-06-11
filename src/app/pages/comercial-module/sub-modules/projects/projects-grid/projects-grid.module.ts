import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsGridComponent } from './projects-grid.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ProjectsCardModule } from '../components/projects-card/projects-card.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ProjectsGridRoutingModule } from './projects-grid-routing.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageLayoutModule } from "../../../../../../@vex/components/page-layout/page-layout.module";
import { BreadcrumbsModule } from "../../../../../../@vex/components/breadcrumbs/breadcrumbs.module";
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IconModule } from '@visurel/iconify-angular';

@NgModule({
  declarations: [ProjectsGridComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ProjectsCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgxSpinnerModule,
    ProjectsGridRoutingModule,
    MatPaginatorModule,
    PageLayoutModule,
    BreadcrumbsModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    IconModule,
],
  exports: [ProjectsGridComponent]
})
export class ProjectsGridModule {
}
