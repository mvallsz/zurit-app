import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { TableColumn } from "../../../../../@vex/interfaces/table-column.interface";
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from "@angular/forms";
import { UntilDestroy } from "@ngneat/until-destroy";
import { MatSelectChange } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";

import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../../@vex/animations/stagger.animation";

import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icCheck from "@iconify/icons-ic/twotone-checklist";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import icPrint from "@iconify/icons-ic/twotone-print";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import icAlarm from "@iconify/icons-ic/twotone-alarm-on";

import { NgxSpinnerService } from "ngx-spinner";
import { MailService } from "../../../../services/mail.service";
import { UsuarioService } from "src/app/services/modules/admin-module/user.service";


import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { User } from "./models/users.model";
import { userStatus } from "src/static-data/zurit-static-data";

import { UsersCreateUpdateComponent } from "./users-create-update/users-create-update.component";

import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const this_url = environment.this_url;
const userFilters = environment.users_config.users_filters;

@UntilDestroy()
@Component({
  selector: 'zurit-users-registry',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
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
export class UsersComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl("boxed");
  urlItem = "";
  urlItem2 = "";
  users: User[];

  @Input()
  columns: TableColumn<User>[] = [
    { label: "Checkbox", property: "checkbox", type: "checkbox", visible: true },
    { label: "Acciones", property: "actions", type: "button", visible: true },
    { label: "Nombre", property: "name", type: "text", visible: true },
    { label: "Email", property: "email", type: "text", visible: true },
    { label: "Telefono", property: "phone", type: "text", visible: true },
    { label: "Rol", property: "role", type: "text", visible: true },
    { label: "Estado", property: "status", type: "button", visible: true },
    { label: "Creado el", property: "creationDate", type: "text", visible: false },
    { label: "Creado por", property: "createdBy", type: "text", visible: true },
  ];

  status = userStatus;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  totalData = 0;

  dataSource: MatTableDataSource<User> | null;
  selection = new SelectionModel<User>(true, []);
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
  icCheck = icCheck;
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icList = icListAlt;
  icAlarm = icAlarm;

  public spinnerDown = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private mailService: MailService,
    private usersService: UsuarioService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.spinner.show("userSpinner");
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
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((tlData: ServiceResponse) => {
          if (tlData == null) return [];
          this.totalData = tlData.total;
          return tlData.data;
        })
      )
      .subscribe((tlData) => {
        this.spinner.hide("userSpinner");
        this.users = tlData;
        this.dataSource = new MatTableDataSource(this.users);
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
    if (filter) this.spinner.show("userSpinner");
    return this.usersService.getUsers(
      pageNumber,
      pageSize,
      filter,
      filterOptions
    );
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
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

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }

    this.spinner.show("userSpinner");

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    value = value.trim();
    value = value.toLowerCase();

    if (value === "") {
      this.searchCtrl.setValue("");
      this.filter = "";
    } else {
      this.filter = "";
      for (const userFilter of userFilters) {
        this.filter += `&${userFilter}=${value}`;
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
      this.users = resp.data;
      this.dataSource.data = this.users;
      this.spinner.hide("userSpinner");
    });
  }

  name = `TLCargo_users${Date.now().toPrecision()}.xlsx`;

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;
    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        this.spinner.hide("userSpinner")
        if (resp.data.length > 0) {

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            JSON.parse(JSON.stringify(resp.data))
          );

          const book: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(book, worksheet, "Sheet1");

          XLSX.writeFile(book, this.name);
          this.spinnerDown = false;

        } else {
          this.openSnackbar("There is nothing to download -.-");
          this.spinnerDown = false;
        }
      }
    );
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => {
        let result = (status.id === statusId.toString());
        return result;
      }
    );
    return selectedStatusArray[0];
  }

  onStatusChange(change: MatSelectChange, row: User) {
    let canChangeStatus = true;
    const index = this.dataSource.data.findIndex((c) => c === row);
    if (canChangeStatus) {
      this.users[index].status = change.value.id;
      const userToUpdate = new User(this.users[index]);
      this.usersService.updateUser(userToUpdate).subscribe(
        (resp: ServiceResponse) => { },
        (error) => this.openSnackbar(error.error.msg)
      );
    } else {
      this.users[index].status = row.status;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot change the status of the User",
      });
    }

  }

  createUser() {
    this.dialog.open(UsersCreateUpdateComponent, {
      height: '600px',
      width: '800px'
    }).afterClosed().subscribe((user: User) => {
      if (user) {
        this.users.push(user);
        this.totalData++;
        this.paginator.pageSize++;
        this.dataSource.data = this.users;
      }
    });
  }

  updateUser(user: User) {
    this.dialog.open(UsersCreateUpdateComponent, {
      height: '600px',
      width: '800px',
      data: user
    }).afterClosed().subscribe((userUpdated: User) => {
      if (userUpdated) {
        this.users[this.users.indexOf(user)] = userUpdated;
        this.dataSource.data = this.users;
      }
    });
  }

  deleteUser(user: User) {
    this.spinner.show('userSpinner');
    this.usersService.deleteUser(user).subscribe((resp: ServiceResponse) => {

      this.users.splice(this.users.findIndex((existingUser) => existingUser._id === user._id), 1);
      this.selection.deselect(user);
      this.totalData--;
      this.dataSource.data = this.users;
      this.spinner.hide('userSpinner');
      this.openSnackbar(resp.msg);

    }, (error) => {

      this.spinner.hide('userSpinner');
      this.openSnackbar(error.error.msg)

    });

  }

  deleteUsers(users: User[]) {
    users.forEach((c) => this.deleteUser(c));
  }

  sendNotification(user: User) { }

}
function observableOf(arg0: null): any {
  throw new Error("Function not implemented.");
}

