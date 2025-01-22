import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { TableColumn } from "../../../../../@vex/interfaces/table-column.interface";
import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import { SelectionModel } from "@angular/cdk/collections";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icFolder from "@iconify/icons-ic/twotone-folder";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import { stagger40ms } from "../../../../../@vex/animations/stagger.animation";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSelectChange } from "@angular/material/select";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";

import icQR from "@iconify/icons-ic/baseline-qr-code";

import { MatSnackBar } from "@angular/material/snack-bar";
import { WarehouseItem } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item.model";
import { WarehouseItemService } from "../../../../services/warehouse-item.service";
import { GuidesService } from "../../../../services/guides.service";
import {
  packageStatus,
  packageTypeLabels,
} from "../../../../../static-data/tlcargo-static-data";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import Swal from "sweetalert2";
import { WarehouseItemFull } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { QrGeneratorComponent } from "../../../warehousingModules/warehouse-inventory/qr-generator/qr-generator.component";
import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { GuidesEntPop } from "../interfaces/guides-ent-pop.model";

import { NgxSpinnerService } from "ngx-spinner";
import { PackageReceiptComponent } from "../../../utility/package-receipt/package-receipt.component";
import icDownload from "@iconify/icons-ic/twotone-cloud-download";

@UntilDestroy()
@Component({
  selector: "vex-picking-list-warehouse",
  templateUrl: "./picking-list-warehouse.component.html",
  styleUrls: ["./picking-list-warehouse.component.scss"],
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
export class PickingListWarehouseComponent implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl("boxed");
  packages: WarehouseItemFull[];

  columns: TableColumn<WarehouseItemFull>[] = [
    { label: "Actions", property: "actions", type: "button", visible: true },
    { label: "Id", property: "tlCargoId", type: "text", visible: true },
    { label: "Piece", property: "guideCounter", type: "text", visible: true },
    { label: "Status", property: "status", type: "button", visible: true },
    { label: "Short Desc", property: "shortDesc", type: "text", visible: true },
    { label: "Volume", property: "volume", type: "text", visible: true },
    { label: "Weight", property: "weight", type: "text", visible: true },
    {
      label: "Reception Date",
      property: "receptionDate",
      type: "text",
      visible: true,
      cssClasses: ["text-secondary", "font-medium"],
    },
    {
      label: "Received by",
      property: "user",
      type: "text",
      visible: true,
      cssClasses: ["text-secondary", "font-medium"],
    },
  ];

  status = packageStatus;
  statusToShow = packageStatus;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<WarehouseItem> | null;
  selection = new SelectionModel<WarehouseItem>(true, []);
  searchCtrl = new FormControl();
  guide = new GuidesEntPop({});
  icPhone = icPhone;
  icMail = icMail;
  icMap = icMap;
  icEdit = icEdit;
  icSearch = icSearch;
  icDelete = icDelete;
  icAdd = icAdd;
  icArrowDropDown = icArrowDropDown;
  icFilterList = icFilterList;
  icMoreHoriz = icMoreHoriz;
  icFolder = icFolder;
  icQR = icQR;
  icDoc = icDownload;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public guideId: string,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private guidesService: GuidesService,
    private warehouseService: WarehouseItemService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.spinner.show("pckListSpinner");

    this.guidesService.getPackagesByGuideId(this.guideId).subscribe((resp) => {
      this.packages = resp.data[0].packageList;
      for (let i = 0; i < resp.data[0].packageList.length; i++) {
        this.packages[i].guideCounter = i + 1 + "/" + this.packages.length;
      }
      this.guide = resp.data[0];
      this.dataSource.data = resp.data[0].packageList;
      this.spinner.hide("pckListSpinner");
    });
    this.dataSource.paginator = this.paginator;
    this.sort.sort({ id: "receptionDate", start: "desc" } as MatSortable);
    this.dataSource.sort = this.sort;
    this.searchCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
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
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
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

  openQRStick(pac: WarehouseItem) {
    this.warehouseService
      .getWarehouseItemFullById(pac._id.toString())
      .subscribe(
        (resp: ServiceResponse) => {
          const pacFull = new WarehouseItemFull(resp.data[0]);
          this.dialog.open(QrGeneratorComponent, {
            data: pacFull,
            height: "500px",
            width: "700px",
          });
        },
        (error) => this.openSnackbar(error.error.msg)
      );
  }

  openInvoice(pac: WarehouseItem) {
    this.warehouseService
      .getWarehouseItemFullById(pac._id.toString())
      .subscribe(
        (resp: ServiceResponse) => {
          const pacFull = new WarehouseItemFull(resp.data[0]);
          this.dialog.open(PackageReceiptComponent, {
            data: pacFull,
            height: "800px",
            width: "1000px",
          });
        },
        (error) => this.openSnackbar(error.error.msg)
      );
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  onStatusChange(change: MatSelectChange, row: WarehouseItem) {
    if (+row.status < 4) {
      const index = this.dataSource.data.findIndex((c) => c === row);
      this.packages[index].status = change.value.id;

      this.warehouseService.updateWarehouseItem(this.packages[index]).subscribe(
        (resp: any) => {
          this.guidesService.getGuideStatusPackages(this.guideId).subscribe(
            (resp2: any) => {
              let cambioStatusGuide = true;
              for (const warehouseItem of resp2.data.packageList) {
                if (warehouseItem.status !== "3") {
                  cambioStatusGuide = false;
                  break;
                }
              }
              if (cambioStatusGuide) {
                resp2.data.status = "3";
                this.guidesService.updateGuide(resp2.data).subscribe(
                  (resp3: any) => {
                    this.openSnackbar("Guide status change");
                  },
                  (error) => this.openSnackbar(error.error.msg)
                );
              }
            },
            (error) => this.openSnackbar(error.error.msg)
          );
        },
        (error) => this.openSnackbar(error.error.msg)
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot change the status of the package once it becomes status IN TRANSIT",
      });
    }
  }
}
