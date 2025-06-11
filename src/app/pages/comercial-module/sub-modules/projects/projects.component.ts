import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';

import { UntilDestroy } from '@ngneat/until-destroy';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../../@vex/animations/stagger.animation';

import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icFolder from "@iconify/icons-ic/twotone-folder";
import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icPrint from "@iconify/icons-ic/twotone-print";
import icAlarm from "@iconify/icons-ic/twotone-alarm-on";
import icQR from "@iconify/icons-ic/baseline-qr-code";
import icBox from "@iconify/icons-ic/add-box";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";

import { TableColumn } from '../../../../../@vex/interfaces/table-column.interface';
import { Project } from './models/project.model';
import { ProjectService } from '../../../../services/modules/comercial-module/projects/projects.service';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import * as XLSX from "xlsx";

const projectFilters = environment.projects_config.projects_filters; // TODO: Update this to client config
const fileExportName = `projects_${new Date().toISOString().split('T')[0]}.xlsx`; // TODO: Update this to client config


@UntilDestroy()
@Component({
  selector: 'zurit-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class ProjectsComponent implements OnInit, AfterViewInit {


  projectList: Project[] = [];
  layoutCtrl = new FormControl('boxed');

  columns: TableColumn<Project>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Cliente', property: 'client', type: 'text', visible: true },
    { label: 'Nombre', property: 'nombre', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Fecha Inicio', property: 'fecha_inicio', type: 'text', visible: true },
    { label: 'Fecha Fin', property: 'fecha_fin', type: 'text', visible: true },
    { label: 'Estado', property: 'estado', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  interval;
  totalData = 0;
  dataSource: MatTableDataSource<Project> | null;
  selection = new SelectionModel<Project>(true, []);
  searchCtrl = new FormControl();

  icPhone = icPhone;
  icMail = icMail;
  icMap = icMap;
  icEdit = icEdit;
  icSearch = icSearch;
  icDelete = icDelete;
  icAdd = icAdd;
  icFilterList = icFilterList;
  icMoreHoriz = icMoreHoriz;
  icFolder = icFolder;
  icPrint = icPrint;
  icAlarm = icAlarm;
  icQR = icQR;
  icBox = icBox;
  icArrowDropDown = icArrowDropDown;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

  public dateSearch = false;
  public dateColor = 'primary';
  spinnerDown: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private projectService: ProjectService,
    private cd: ChangeDetectorRef
  ) { }

  get visibleColumns() {
    return this.columns
      .filter(column => column.visible)
      .map(column => column.property);
  }

  ngOnInit() {
    this.spinner.show("projectsSpinner");
    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.getTableData$(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.filter,
            true,
            filterOptions
          ).pipe(catchError(() => {
            this.spinner.hide("projectsSpinner");
            this.openSnackbar("There was an error loading the data");
            return [];
          }));
        }),
        map((tlData: ServiceResponse) => {
          this.totalData = tlData.total;
          return tlData.data;
        })
      )
      .subscribe((tlData) => {
        this.spinner.hide("projectsSpinner");
        this.projectList = tlData;
        this.dataSource = new MatTableDataSource(this.projectList);
        this.sort.sort({ id: "creationDate", start: "desc" } as MatSortable);
        this.dataSource.sort = this.sort;
      });
  }

    getTableData$(
      pageNumber: Number,
      pageSize: Number,
      filter: string,
      spinner: boolean,
      filterOptions: any
    ) {
      if (spinner) this.spinner.show("projectsSpinner");

      return this.projectService.getProjectsPag(
        pageNumber,
        pageSize,
        filter,
        filterOptions
      );
    }

    onFilterChange(value: string) {
      if (!this.dataSource) {
        return;
      }

      this.spinner.show("projectsSpinner");

      const filterOptions = {
        multiple: true,
        autoComplete: true,
      };

      value = value.trim();
      value = value.toLowerCase();

      if (value === "") {
        if (this.dateSearch) {
          if (this.sinceDateCtrl.value && this.untilDateCtrl.value) {
            this.filter = `&sinceDate=${this.sinceDateCtrl.value}&untilDate=${this.untilDateCtrl.value}`;
          } else {
            this.openSnackbar("Please select a date range");
          }

        } else {
          this.searchCtrl.setValue("");
          this.filter = "";
        }
      } else {
        for (const whFilter of projectFilters) {
          this.filter += `&${whFilter}=${value}`;
        }
      }

      this.getTableData$(
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.filter,
        false,
        filterOptions
      ).subscribe((resp: ServiceResponse) => {
        this.totalData = resp.total;
        this.projectList = resp.data;
        this.dataSource.data = this.projectList;
        this.spinner.hide("clientsSpinner");
      });
    }

  showDate() {
    this.dateSearch = !this.dateSearch;
    this.dateColor = this.dateSearch ? 'accent' : 'primary';
    if (!this.dateSearch) {
      this.sinceDateCtrl.setValue("");
      this.untilDateCtrl.setValue("");
    } else {
      this.searchCtrl.setValue("");
    }
  }

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;

    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let projectsToExport: Project[];
        projectsToExport = new Array();
        if (resp.data.length > 0) {
          for (const project of resp.data) {
            projectsToExport.push(new Project(project));
          }
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            JSON.parse(JSON.stringify(projectsToExport))
          );
          const book: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(book, worksheet, "Sheet1");

          XLSX.writeFile(book, fileExportName);
          this.spinnerDown = false;
        } else {
          this.openSnackbar("There is nothing to download -.-");
          this.spinnerDown = false;
        }
      }
    );
  }

  createProject() {
    // Implement create project logic
  }

  updateProject(project: Project) {
    // Implement update project logic
  }

  deleteProject(project: Project) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el proyecto ${project.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.disableProject(project._id).subscribe(
          (response: ServiceResponse) => {
            if (response.ok) {
              this.openSnackbar('Proyecto eliminado correctamente');
              this.ngAfterViewInit(); // Refresh the data
            } else {
              this.openSnackbar('Error al eliminar el proyecto');
            }
          },
          (error) => {
            this.openSnackbar('Error al eliminar el proyecto');
          }
        );
      }
    });
  }

  deleteProjects(arg0: Project[]) {
    throw new Error('Method not implemented.');
  }

  notifyCustomers(arg0: Project[]) {
    throw new Error('Method not implemented.');
  }


  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }
}
