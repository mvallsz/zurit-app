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
import { Item } from "./models/item.model";
import { InventoryService } from "src/app/services/modules/inventory-module/items/inventory.service";

import { itemStatus } from "src/static-data/zurit-static-data";
import { CATEGORIAS, ITEM_ESTADOS } from '../../../../../static-data/constants/enums';
import { ItemType } from "../item-types/models/itemType.model";
import { ItemTypeService } from "src/app/services/modules/inventory-module/item-types/item-type.service";

const itemFilters = environment.items_config.items_filters;
const fileExportName = `${environment.items_config.items_export_config.file_name_template}${new Date().toISOString().split('T')[0]}${environment.items_config.items_export_config.file_extension}`;


@UntilDestroy()
@Component({
  selector: "zurit-items-inventory",
  templateUrl: "./items-inventory.component.html",
  styleUrls: ["./items-inventory.component.scss"],
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
export class ItemsInventory implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl("boxed");
  itemList: ItemType[];
  itemClasses = itemStatus;

  estadoItems: { key: string, value: any }[] = [];

  columns: TableColumn<ItemType>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "STOCK", property: "stock", type: "button", visible: true },
    { label: "CATEGORIA", property: "categoria", type: "text", visible: true },
    { label: "NOMBRE", property: "nombre", type: "text", visible: true },
    { label: "MARCA", property: "marca", type: "text", visible: true },
    { label: "MODELO", property: "modelo", type: "text", visible: false },
    { label: "COSTO", property: "costo", type: "text", visible: false },
    { label: "PROVEEDOR", property: "proveedor", type: "text", visible: true },
    { label: "ESTADO", property: "estado", type: "text", visible: true },
    { label: "FECHA DE REGISTRO", property: "creationDate", type: "text", visible: false },
    { label: "CREADO POR", property: "createdBy", type: "text", visible: false },
    { label: "Actions", property: "actions", type: "button", visible: true }
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  interval;
  totalData = 0;
  dataSource: MatTableDataSource<ItemType> | null;
  selection = new SelectionModel<ItemType>(true, []);
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
    private itemsService: InventoryService,
    private itemTypeService: ItemTypeService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.spinner.show("itemsSpinner");
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
            this.spinner.hide("itemsSpinner");
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
        this.spinner.hide("itemsSpinner");
        this.itemList = tlData;
        this.dataSource = new MatTableDataSource(this.itemList);
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
    if (spinner) this.spinner.show("itemsSpinner");

    return this.itemTypeService.getItemTypesPag(
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

    this.spinner.show("itemsSpinner");

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
      for (const whFilter of itemFilters) {
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
      this.itemList = resp.data;
      this.dataSource.data = this.itemList;
      this.spinner.hide("pckSpinner");
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

  selectStatusClassById(statusId: string) {
    const selectedStatusArray: any[] = this.itemClasses.filter(
      (statusClass) => statusClass.id === statusId.toString()
    );
    return selectedStatusArray[0];
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  getCategoriaByKey(categoriaKey: string) {
    return CATEGORIAS[categoriaKey];
  }

  getEstadoByKey(estadoKey: string) {
    return ITEM_ESTADOS[estadoKey];
  }

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;

    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let itemsToExport: Item[];
        itemsToExport = new Array();
        if (resp.data.length > 0) {
          for (const item of resp.data) {
            itemsToExport.push(new Item(item));
          }
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            JSON.parse(JSON.stringify(itemsToExport))
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

  openBarCodeStick(item: Item) {
    //TODO
  }

  notifyCustomers(itemList: ItemType[]) {
    Swal.fire({
      title: `Only in warehouse packages can be notified`,
      text: `Also the packages that have not been repacked or divided will be notified. Do you wish to continue?`,
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

  updateItemType(itemType: ItemType) {
    this.router.navigate(['/app/items/registro/' + itemType._id]);
  }

  seeStockItemType(itemType: ItemType) {
    this.router.navigate(['/app/items/stock/' + itemType._id]);
  }

  deleteItemType(itemType: ItemType) {
    this.itemTypeService.disableItemType(itemType._id).subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          this.openSnackbar("Item type deleted successfully");
          this.ngAfterViewInit();
        } else {
          this.openSnackbar("There was an error deleting the item type");
        }
      });
  }

  deleteItemTypes(itemTypes: ItemType[]) {
    Swal.fire({
      title: `Are you sure you want to delete the selected item types?`,
      text: `This action cannot be undone`,
      showDenyButton: true,
      confirmButtonText: "Yes!",
      denyButtonText: `No!`,
      width: "500px",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        itemTypes.forEach((itemType) => {
          this.deleteItemType(itemType);
        });
        this.selection.clear();
      }
    });
  }


}
