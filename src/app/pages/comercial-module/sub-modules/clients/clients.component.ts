import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import { MatSnackBar } from "@angular/material/snack-bar";

import { UntilDestroy } from "@ngneat/until-destroy";

import { TableColumn } from "../../../../../@vex/interfaces/table-column.interface";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../../@vex/animations/stagger.animation";

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

import { environment } from "../../../../../environments/environment";
import { NgxSpinnerService } from "ngx-spinner";

import { ServiceResponse } from "../../../../interfaces/service-response.interface";

import Swal from "sweetalert2";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import * as XLSX from "xlsx";
import { Client } from "./models/client.model";
import { ClientsService } from "src/app/services/modules/comercial-module/clients/clients.service";

const clientFilters = environment.items_config.items_filters; // TODO: Update this to client config
const fileExportName = `clients_${new Date().toISOString().split('T')[0]}.xlsx`; // TODO: Update this to client config

@UntilDestroy()
@Component({
  selector: "zurit-clients",
  templateUrl: "./clients.component.html",
  styleUrls: ["./clients.component.scss"],
  animations: [fadeInUp400ms, stagger40ms],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: "standard",
      } as MatFormFieldDefaultOptions,
    },
  ],
})
export class ClientsComponent implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl("boxed");
  clientList: Client[];

  columns: TableColumn<Client>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "CODIGO", property: "codigo", type: "text", visible: true },
    { label: "NOMBRE", property: "nombre", type: "text", visible: true },
    { label: "RIF", property: "rif", type: "text", visible: true },
    { label: "TELEFONO", property: "telefono", type: "text", visible: true },
    { label: "EMAIL", property: "email", type: "text", visible: true },
    { label: "Actions", property: "actions", type: "button", visible: true }
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  interval;
  totalData = 0;
  dataSource: MatTableDataSource<Client> | null;
  selection = new SelectionModel<Client>(true, []);
  searchCtrl = new FormControl();

  urlItem = "";

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
    private clientsService: ClientsService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.spinner.show("clientsSpinner");
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
            this.spinner.hide("clientsSpinner");
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
        this.spinner.hide("clientsSpinner");
        this.clientList = tlData;
        this.dataSource = new MatTableDataSource(this.clientList);
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
    if (spinner) this.spinner.show("clientsSpinner");

    return this.clientsService.getClientsPag(
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

    this.spinner.show("clientsSpinner");

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
      for (const whFilter of clientFilters) {
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
      this.clientList = resp.data;
      this.dataSource.data = this.clientList;
      this.spinner.hide("clientsSpinner");
    });
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;

    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let clientsToExport: Client[];
        clientsToExport = new Array();
        if (resp.data.length > 0) {
          for (const client of resp.data) {
            clientsToExport.push(new Client(client));
          }
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            JSON.parse(JSON.stringify(clientsToExport))
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

  notifyCustomers(clientList: Client[]) {
    Swal.fire({
      title: `Notify customers`,
      text: `Do you wish to continue?`,
      showDenyButton: true,
      confirmButtonText: "Yes!",
      denyButtonText: `No!`,
      width: "500px",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.selection.clear();
      }
    });

  }

  updateClient(client: Client) {
    this.router.navigate(['/app/clients/registro/' + client._id]); // TODO: Update route
  }

  deleteClient(client: Client) {
    this.clientsService.disableClient(client._id).subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          this.openSnackbar("Client deleted successfully");
          this.ngAfterViewInit();
        } else {
          this.openSnackbar("There was an error deleting the client");
        }
      });
  }

  deleteClients(clients: Client[]) {
    Swal.fire({
      title: `Are you sure you want to delete the selected clients?`,
      text: `This action cannot be undone`,
      showDenyButton: true,
      confirmButtonText: "Yes!",
      denyButtonText: `No!`,
      width: "500px",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        clients.forEach((client) => {
          this.deleteClient(client);
        });
        this.selection.clear();
      }
    });
  }
}
