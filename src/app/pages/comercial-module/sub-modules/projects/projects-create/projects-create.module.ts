import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SecondaryToolbarModule } from '../../../../../../@vex/components/secondary-toolbar/secondary-toolbar.module';
import { MatSelectModule } from '@angular/material/select';
import { IconModule } from '@visurel/iconify-angular';
import { BreadcrumbsModule } from '../../../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import { ContainerModule } from '../../../../../../@vex/directives/container/container.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxFileDropModule } from 'ngx-file-drop';
import { PageLayoutModule } from 'src/@vex/components/page-layout/page-layout.module';
import { ProjectsCreateComponent } from './projects-create.component';
import { ProjectsCreateRoutingModule } from './projects-create-routing.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ItemsReqModule } from "./components/items-req/items-req.module";

@NgModule({
  declarations: [ProjectsCreateComponent],
  imports: [
    CommonModule,
    ProjectsCreateRoutingModule,
    PageLayoutModule,
    MatSnackBarModule,
    MatIconModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FlexLayoutModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    SecondaryToolbarModule,
    MatSelectModule,
    IconModule,
    BreadcrumbsModule,
    ContainerModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule,
    MatFormFieldModule,
    MatGridListModule,
    MatDividerModule,
    MatSlideToggleModule,
    FormsModule,
    MatProgressSpinnerModule,
    NgxFileDropModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatTooltipModule,
    MatMenuModule,
    ItemsReqModule
],
  exports: [ProjectsCreateComponent]
})
export class ProjectsCreateModule {
}
