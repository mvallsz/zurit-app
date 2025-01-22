import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { GuidesEntPop } from "../../shipping-guides/interfaces/guides-ent-pop.model";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { TableColumn } from "../../../../../@vex/interfaces/table-column.interface";
import {
  guidesLabels,
  guideStatus,
} from "../../../../../static-data/tlcargo-static-data";
import { GuidesCreateUpdateComponent } from "../../shipping-guides/guides-create-update/guides-create-update.component";

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
import icBoxi from "@iconify/icons-ic/twotone-inbox";
import icBoxo from "@iconify/icons-ic/twotone-outbox";
import icCheck from "@iconify/icons-ic/twotone-checklist";
import icQR from "@iconify/icons-ic/twotone-qr-code";

import { MatSnackBar } from "@angular/material/snack-bar";
import { GuidesService } from "../../../../services/guides.service";
import { GuidesEnt } from "../../shipping-guides/interfaces/guides-ent.model";
import { PickingListWarehouseComponent } from "../../shipping-guides/picking-list-warehouse/picking-list-warehouse.component";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import { GuideInvoiceComponent } from "../../../utility/guide-invoice/guide-invoice.component";
import Swal from "sweetalert2";
import { WarehouseItemService } from "../../../../services/warehouse-item.service";
import icPrint from "@iconify/icons-ic/twotone-print";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import { GuidePickListComponent } from "../../../utility/guide-pick-list/guide-pick-list.component";
import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { NgxSpinnerService } from "ngx-spinner";
import { HttpErrorResponse } from "@angular/common/http";
import { ShippingEnt } from "../interfaces/shipping.model";
import { GuideQrGeneratorComponent } from "../../shipping-guides/guide-qr-generator/guide-qr-generator.component";

@UntilDestroy()
@Component({
  selector: "vex-picking-list-guide",
  templateUrl: "./picking-list-guide.component.html",
  styleUrls: ["./picking-list-guide.component.scss"],
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
export class PickingListGuideComponent implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl("boxed");

  guides: GuidesEntPop[];

  @Input()
  columns: TableColumn<GuidesEntPop>[] = [
    { label: "Actions", property: "actions", type: "button", visible: true },
    { label: "Guide Id", property: "tlCargoId", type: "text", visible: true },
    { label: "Status", property: "status", type: "button", visible: true },
    {
      label: "Package List",
      property: "packageList",
      type: "button",
      visible: true,
    },
    { label: "Weight", property: "finalWeight", type: "text", visible: true },
    { label: "Volume", property: "finalVolume", type: "text", visible: true },
    { label: "Customer", property: "customer", type: "text", visible: true },
    { label: "Created By", property: "user", type: "text", visible: true },
  ];

  status = guideStatus;
  statusToShow = guideStatus;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<GuidesEntPop> | null;
  selection = new SelectionModel<GuidesEntPop>(true, []);
  searchCtrl = new FormControl();

  labels = guidesLabels;

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
  icBoxo = icBoxo;
  icBoxi = icBoxi;
  icCheck = icCheck;
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icList = icListAlt;
  icQR = icQR;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public ship: ShippingEnt,
    private dialog: MatDialog,
    private guidesService: GuidesService,
    private warehouseItemService: WarehouseItemService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.spinner.show("guidesSpinner");

    this.dataSource = new MatTableDataSource();

    this.guidesService
      .getPopGuideByShippingId(this.ship._id.toString())
      .subscribe(
        (resp: any) => {
          this.spinner.hide("guidesSpinner");
          if (resp !== null) {
            this.guides = resp.data.filter((guide) => !guide.quote);
            this.dataSource.data = this.guides;
          }
        },
        (error: HttpErrorResponse) => {
          this.guides = [];
          console.log(error.status);
        }
      );

    this.searchCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.sort({ id: "creationDate", start: "desc" } as MatSortable);
    this.dataSource.sort = this.sort;
    this.cd.detectChanges();
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  showPicList(list: any) {
    this.dialog
      .open(PickingListWarehouseComponent, {
        height: "500px",
        data: list,
      })
      .afterClosed()
      .subscribe(() => {
        this.guidesService
          .getPopGuideByShippingId(this.ship._id.toString())
          .subscribe((resp: ServiceResponse) => {
            this.guides = resp.data;
            this.dataSource.data = resp.data;
          });
      });
  }

  openQRStick(guide: GuidesEntPop) {
    const piezas = new Array(guide.packageList.length);
    for (let i = 0; i < guide.packageList.length; i++) {
      piezas[i] = i + 1;
    }
    this.dialog.open(GuideQrGeneratorComponent, {
      data: {
        guide,
        piezas,
      },
      height: "600px",
      width: "700px",
    });
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

  openInvoice(guide: GuidesEntPop) {
    this.dialog.open(GuideInvoiceComponent, {
      data: { guide, tlpackage: null },
      height: "800px",
      width: "1000px",
    });
  }

  openPickList(guide: GuidesEntPop) {
    this.dialog.open(GuidePickListComponent, {
      data: guide,
      height: "800px",
      width: "1000px",
    });
  }
}
