import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  Inject
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";

import { UntilDestroy } from "@ngneat/until-destroy";
import { fadeInUp400ms } from "../../../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms, stagger80ms } from "../../../../../../@vex/animations/stagger.animation";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icPrint from "@iconify/icons-ic/twotone-print";
import icAlarm from "@iconify/icons-ic/twotone-alarm-on";
import icQrCode from "@iconify/icons-ic/twotone-qr-code";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import icMenu from "@iconify/icons-ic/twotone-menu";
import icClear from "@iconify/icons-ic/twotone-clear";

import { environment } from "../../../../../../environments/environment";
import { NgxSpinnerService } from "ngx-spinner";
import { ServiceResponse } from "../../../../../interfaces/service-response.interface";
import Swal from "sweetalert2";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { TableColumn } from "src/@vex/interfaces/table-column.interface";
import { CurrencyPipe } from "@angular/common";
import { FormBuilder } from '@angular/forms';
import { FileUploadService } from "src/app/services/file-upload.service";
import { DomSanitizer } from "@angular/platform-browser";
import { scaleIn400ms } from "src/@vex/animations/scale-in.animation";
import { fadeInRight400ms } from "src/@vex/animations/fade-in-right.animation";

import * as XLSX from "xlsx";
import { Project, } from "../models/project.model";
import { Client } from "../../clients/models/client.model";
import { ItemsReq } from "../projects-create/projects-create.component";
import { ProjectService } from "src/app/services/modules/comercial-module/projects/projects.service";
import { ItemType } from "src/app/pages/inventory-module/sub-modules/item-types/models/itemType.model";
import { IItem } from "src/app/pages/inventory-module/sub-modules/items/models/item.model";
import { InventoryService } from "src/app/services/modules/inventory-module/items/inventory.service";
import { ItemTypeService } from "src/app/services/modules/inventory-module/item-types/item-type.service";
import { TIPOS_PROYECTO } from "src/static-data/constants/enums";

const fileExportName = `${environment.projects_config.projects_export_config.file_name_template}${new Date().toISOString().split('T')[0]}${environment.projects_config.projects_export_config.file_extension}`;

const projectsFilters = environment.projects_config.projects_filters;

const projectsFilterOptions = {
  multiple: true,
  autoComplete: true,
};


@UntilDestroy()
@Component({
  selector: "zurit-projects-update",
  templateUrl: "./projects-update.component.html",
  styleUrls: ["./projects-update.component.scss"],
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})
export class ProjectsUpdateComponent implements OnInit, AfterViewInit {

  selectedStatuses = [];
  layoutCtrl = new FormControl("boxed");
  project: Project;
  client: Client;
  itemsReq: ItemsReq[];

  TIPOS_PROYECTO = TIPOS_PROYECTO;


  public sinceDateCtrl = new FormControl();
  public untilDateCtrl = new FormControl();
  public dateSearch = false;
  public dateColor = 'primary';
  public spinnerDown = false;

  columns: TableColumn<ItemsReq>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: 'Nombre', property: 'nombre', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Descripción', property: 'descripcion', type: 'text', visible: true },
    { label: 'Marca', property: 'marca', type: 'text', visible: true },
    { label: 'Modelo', property: 'modelo', type: 'text', visible: true },
    { label: 'Categoria', property: 'categoria', type: 'text', visible: true },
    { label: 'Unidad', property: 'unidad', type: 'text', visible: true },
    { label: 'Cantidades', property: 'cantidad', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  itemsReqPageSize = 10;
  itemsReqPageSizeOptions: number[] = [5, 10, 20, 50];
  itemsReqDataSource: MatTableDataSource<ItemsReq> | null;
  itemsReqSelection = new SelectionModel<ItemsReq>(true, []);




  searchCtrl = new FormControl();
  filter = "";

  icMoreHoriz = icMoreHoriz;
  icEdit = icEdit;
  icDelete = icDelete;
  icSearch = icSearch;
  icAdd = icAdd;
  icFilterList = icFilterList;
  icPrint = icPrint;
  icAlarm = icAlarm;
  icQrCode = icQrCode;
  icArrowDropDown = icArrowDropDown;
  icMenu = icMenu;
  icClear = icClear;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private projectsService: ProjectService,
    private cd: ChangeDetectorRef,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    public currencyPipe: CurrencyPipe,
    private fb: FormBuilder,
    private itemsService: InventoryService,
    private itemTypeService: ItemTypeService,
  ) {
    this.selectedStatuses[0] = '1';

   }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit(): void {
    this.spinner.show("itemStockSpinner");
    this.itemsReqDataSource = new MatTableDataSource();

    this.route.params.subscribe((params) => {
      this.itemId = params["id"];
      if (this.itemId) {
        this.loadProject(this.itemId);
      } else {
        this.openSnackbar("No item ID provided");
      }
    });
  }

  ngAfterViewInit() {
    this.itemsReqDataSource.paginator = this.paginator;
    this.itemsReqDataSource.sort = this.sort;
  }

  itemId: string;

  loadProject(projectId: string) {
    this.projectsService.getProjectById(projectId).subscribe(
      async (resp: ServiceResponse) => {
        if (resp.ok) {
          this.project = resp.data;
          this.client = this.project.client;
          this.itemsReq = this.project.items_solicitados as ItemsReq[];
          this.itemsReqDataSource.data = this.itemsReq;
          this.spinner.hide("itemStockSpinner");
          this.cd.detectChanges();
        } else {
          this.openSnackbar("Error cargando el proyecto");
          this.spinner.hide("itemStockSpinner");
        }
      },
      (error) => {
        this.openSnackbar("Error cargando el proyecto");
        this.spinner.hide("itemStockSpinner");
      }
    );
  }

  getTableData$(
    filter: string,
    spinner: boolean,
    filterOptions: any
  ) {
    if (spinner) this.spinner.show("itemStockSpinner");
    return this.projectsService.getProjects(
      filter,
      filterOptions
    );
  }

  onFilterChange(value: string) {
    if (!this.itemsReqDataSource) {
      return;
    }

    this.spinner.show("itemStockSpinner");

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
      for (const whFilter of projectsFilters) {
        this.filter += `&${whFilter}=${value}`;
      }
    }

    this.getTableData$(
      this.filter,
      false,
      filterOptions
    ).subscribe((resp: ServiceResponse) => {
      this.itemsReq = resp.data;
      this.itemsReqDataSource.data = this.itemsReq;
      this.spinner.hide("itemStockSpinner");
    });
  }


  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;

    this.getTableData$(this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let itemsToExport: Project[];
        itemsToExport = new Array();
        if (resp.data.length > 0) {
          for (const item of resp.data) {
            itemsToExport.push(new Project(item));
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

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  isAllSelected() {
    const numSelected = this.itemsReqSelection.selected.length;
    const numRows = this.itemsReqDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.itemsReqSelection.clear() :
      this.itemsReqDataSource.data.forEach(row => this.itemsReqSelection.select(row));
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  // =================================================================
  // ========================= BUSINESS LOGIC ========================
  // =================================================================

  /**
   * This method is responsible for associating the required items with the current stock in the inventory.
   * @param itemReq The item required to be associated with the stock.
   */
  associateItemWithStock(itemReq: ItemsReq) {
    // 1. Find the ItemType that matches the ItemReq
    this.itemTypeService.getItemTypes(`nombre=${itemReq.nombre}&marca=${itemReq.marca}&modelo=${itemReq.modelo}&categoria=${itemReq.categoria}`, projectsFilterOptions).subscribe(
      (itemTypeResp: ServiceResponse) => {
        if (itemTypeResp.ok) {
          const itemType: ItemType = itemTypeResp.data[0];
          if (itemType) {
            // 2. Find the Item that matches the ItemType and has estado = 1 and the sum of all items with estado = 1 is equal or greater than the quantity required in ItemReq
            this.itemsService.getItems(`itemType=${itemType._id}&estado=1`, projectsFilterOptions).subscribe(
              (itemResp: ServiceResponse) => {
                if (itemResp.ok) {
                  const items: IItem[] = itemResp.data;
                  let totalStock = itemResp.total;
                  if (totalStock >= itemReq.cantidad) {
                    // 3. If there is stock, show a table where the user can select one or more items and associate them with a commercial document
                    this.openAssociateItemDialog(items, itemReq);
                  } else {
                    // 4. If there is no stock, add the ItemReq to the ItemTypes with estado 4, so the commercial user knows that it is necessary to finish the item registration.
                    this.addItemReqToItemTypes(itemType, itemReq);
                  }
                } else {
                  this.openSnackbar("Error buscando el item");
                }
              }
            );
          } else {
            this.openSnackbar("No se encontró el tipo de item");
          }
        } else {
          this.openSnackbar("Error buscando el tipo de item");
        }
      }
    );
  }

  /**
   * This method is responsible for opening the dialog to associate the item with a commercial document.
   * @param items The items to be associated with the commercial document.
   * @param itemReq The item required to be associated with the stock.
   */
  openAssociateItemDialog(items: IItem[], itemReq: ItemsReq) {
    // this.dialog.open(AssociateItemDialogComponent, {
    //   data: { items: items, itemReq: itemReq },
    //   width: '900px',
    //   height: '600px'
    // }).afterClosed().subscribe(() => {
    //   this.loadItems(this.itemId);
    // });
  }

  /**
   * This method is responsible for adding the ItemReq to the ItemTypes with estado 4, so the commercial user knows that it is necessary to finish the item registration.
   * @param itemType The item type to be updated.
   * @param itemReq The item required to be added to the item type.
   */
  addItemReqToItemTypes(itemType: ItemType, itemReq: ItemsReq) {
    itemType.estado = 4;
    this.itemTypeService.updateItemType(itemType._id, itemType).subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          this.openSnackbar("Se agregó el item a los tipos de item con estado incompleto");
        } else {
          this.openSnackbar("Error agregando el item a los tipos de item con estado incompleto");
        }
      }
    );
  }
}
