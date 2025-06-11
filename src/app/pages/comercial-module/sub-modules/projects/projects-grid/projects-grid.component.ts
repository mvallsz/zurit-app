import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Link } from '../../../../../../@vex/interfaces/link.interface';
import { scaleIn400ms } from '../../../../../../@vex/animations/scale-in.animation';
import { fadeInRight400ms } from '../../../../../../@vex/animations/fade-in-right.animation';
import { MatDialog } from '@angular/material/dialog';
import { trackById } from '../../../../../../@vex/utils/track-by';
import { fadeInUp400ms } from '../../../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../../../@vex/animations/stagger.animation';
import { scaleFadeIn400ms } from '../../../../../../@vex/animations/scale-fade-in.animation';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from 'src/app/services/modules/comercial-module/projects/projects.service';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';
import * as XLSX from "xlsx";
import { MatTableDataSource } from '@angular/material/table';


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

const projectFilters = environment.projects_config.projects_filters; // TODO: Update this to client config
const fileExportName = `projects_${new Date().toISOString().split('T')[0]}.xlsx`; // TODO: Update this to client config

@Component({
  selector: 'zurit-projects-grid',
  templateUrl: 'projects-grid.component.html',
  styleUrls: ['./projects-grid.component.scss'],
  animations: [
    scaleIn400ms,
    fadeInRight400ms,
    stagger40ms,
    fadeInUp400ms,
    scaleFadeIn400ms
  ]
})
export class ProjectsGridComponent implements OnInit {

  projectList: Project[] = [];
  dataSource: MatTableDataSource<Project> | null;

  layoutCtrl = new FormControl('boxed');

  pageSize = 12;
  pageSizeOptions: number[] = [12, 24, 48];
  filter = "";
  totalData = 0;
  searchCtrl = new FormControl();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

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

  public dateSearch = false;
  public dateColor = 'primary';
  spinnerDown: boolean = false;

  trackById = trackById;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private projectService: ProjectService,
    private cd: ChangeDetectorRef
  ) {}

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
              this.pageSize,
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
        if (!this.projectList) {
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

    openSnackbar(message: string) {
      this.snackBar.open(message, 'OK', {
        duration: 5000,
        horizontalPosition: 'right'
      });
    }

  openProject(id?: Project['_id']) {
    this.router.navigate(['/app/proyectos/registro'], { queryParams: { project: id } });

  }

  toggleStar(id: Project['_id']) {
    const project = this.projectList.find((c) => c._id === id);

    if (project) {
      project.starred = !project.starred;
    }

    this.projectService.updateProject(id, project).subscribe((resp) => {
      if (!resp.ok) {
        this.openSnackbar('Error updating project');
       }
    });
  }
}
