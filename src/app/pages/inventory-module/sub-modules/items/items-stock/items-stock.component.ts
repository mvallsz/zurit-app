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
import { ItemType } from "../../item-types/models/itemType.model";
import { InventoryService } from "src/app/services/modules/inventory-module/items/inventory.service";
import { ItemTypeService } from "src/app/services/modules/inventory-module/item-types/item-type.service";
import { TableColumn } from "src/@vex/interfaces/table-column.interface";
import { IItem, Item } from "../models/item.model";
import { STOCK_ESTADOS, ITEM_ESTADOS, MONEDAS, UNIDADES, CATEGORIAS } from "src/static-data/constants/enums";
import { itemStatus } from "src/static-data/zurit-static-data";

import { CurrencyPipe } from "@angular/common";
import { FormBuilder } from '@angular/forms';
import { AddStockDialogComponent } from "./add-stock/add-stock-dialog.component";
import { FileUploadService } from "src/app/services/file-upload.service";
import { DomSanitizer } from "@angular/platform-browser";
import { scaleIn400ms } from "src/@vex/animations/scale-in.animation";
import { fadeInRight400ms } from "src/@vex/animations/fade-in-right.animation";

import * as XLSX from "xlsx";

const fileExportName = `${environment.items_config.items_export_config.file_name_template}${new Date().toISOString().split('T')[0]}${environment.items_config.items_export_config.file_extension}`;

const itemFilters = environment.items_config.items_filters;

const itemsFilterOptions = {
  multiple: true,
  autoComplete: true,
};

interface AddStockData {
  quantity: number;
}

@UntilDestroy()
@Component({
  selector: "zurit-items-stock",
  templateUrl: "./items-stock.component.html",
  styleUrls: ["./items-stock.component.scss"],
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})
export class ItemsStockComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl("boxed");
  itemType: ItemType;
  itemId: string;
  item: Item;
  itemTypesEstados = ITEM_ESTADOS;
  itemEstados = STOCK_ESTADOS;
  itemTypesEstadosArray: { key: string; value: any }[] = [];
  itemEstadosArray: { key: string; value: any }[] = [];
  itemClasses = itemStatus;

  itemEstadosTotales: { [key: string]: number } = {};
  STOCK_ESTADOS = STOCK_ESTADOS;
  MONEDAS = MONEDAS;
  UNIDADES = UNIDADES;
  CATEGORIAS = CATEGORIAS;

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

  public dateSearch = false;
  public dateColor = 'primary';
  spinnerDown: boolean = false;

  columns: TableColumn<IItem>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "ESTADO", property: "estado", type: "text", visible: true },
    { label: "SERIAL", property: "serial", type: "text", visible: true },
    { label: "COSTO", property: "costo", type: "text", visible: true },
    { label: "EXENTO", property: "exento", type: "text", visible: true },
    { label: "LOTE", property: "lote", type: "text", visible: false },
    { label: "FECHA DE VENCIMIENTO", property: "fecha_vencimiento", type: "text", visible: false },
    {
      label: "FECHA DE REGISTRO",
      property: "creationDate",
      type: "text",
      visible: false,
    },
    { label: "CREADO POR", property: "createdBy", type: "text", visible: false },
    { label: "Actions", property: "actions", type: "button", visible: true },
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<IItem> | null;
  selection = new SelectionModel<IItem>(true, []);
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

  imagePreviews: any[];
  imageBlob: any[];
  imageOriginal: any[];

  constructor(
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private itemsService: InventoryService,
    private itemTypeService: ItemTypeService,
    private cd: ChangeDetectorRef,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    public currencyPipe: CurrencyPipe,
    private fb: FormBuilder
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit(): void {
    this.spinner.show("itemStockSpinner");
    this.dataSource = new MatTableDataSource();
    this.itemTypesEstadosArray = Object.entries(this.itemTypesEstados).map(([key, value]) => ({ key, value }));
    this.itemEstadosArray = Object.entries(this.itemEstados).map(([key, value]) => ({ key, value }));

    this.route.params.subscribe((params) => {
      this.itemId = params["id"];
      if (this.itemId) {
        this.loadItemType(this.itemId);
        this.loadItems(this.itemId);
      } else {
        this.openSnackbar("No item ID provided");
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadItemType(itemTypeId: string) {
    this.itemTypeService.getItemTypes(itemTypeId, itemsFilterOptions).subscribe(
      async (resp: ServiceResponse) => {
        if (resp.ok) {
          this.itemType = resp.data[0];
          try {
            const imagePromises = this.itemType.imagenes.map(image => this.loadImage(`${image.replace('uploads', 'files')}`));
            const imageUrls = await Promise.all(imagePromises);
            this.imagePreviews = imageUrls.map(url => url.url_sana);
            this.imageBlob = imageUrls.map(url => url.url_blob);
            this.imageOriginal = imageUrls.map(url => url.originalPath);

          } catch (error) {
            this.openSnackbar('Error loading images');
          }
          this.cd.detectChanges();
        } else {
          this.openSnackbar("Error cargando el tipo de item");
        }
      },
      (error) => {
        this.openSnackbar("Error cargando el tipo de item");
      }
    );
  }

  loadItems(itemTypeId: string) {
    this.filter = `itemType=${itemTypeId}`;
    this.getTableData$(this.filter, true, itemsFilterOptions).subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          this.calculateTotalItemsByEstado(resp.data);
          const items: IItem[] = resp.data.map(item => {
            const currencySymbol = MONEDAS[item.moneda] || '$';
            return {
              ...item,
              costo: `${this.currencyPipe.transform(item.costo_compra, currencySymbol, 'symbol', '1.2-2')}`,
              exento: item.exento ? 'SI' : 'NO',
            };
          });
          this.dataSource.data = items;
          this.spinner.hide("itemStockSpinner");
          this.cd.detectChanges();
        } else {
          this.openSnackbar("Error loading items");
          this.spinner.hide("itemStockSpinner");
        }
      },
      (error) => {
        this.openSnackbar("Error loading items");
        this.spinner.hide("itemStockSpinner");
      }
    );
  }

  loadImage(imagePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fileUploadService.getImagePath(imagePath).subscribe((blob) => {
        const urls = { url_sana: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)), url_blob: URL.createObjectURL(blob), originalPath: imagePath };
        resolve(urls);
      }, error => {
        reject(error);
      });
    });
  }

  selectStatusClassById(statusId: string) {
    const selectedStatusArray: any[] = this.itemClasses.filter(
      (statusClass) => statusClass.id === statusId.toString()
    );
    return selectedStatusArray[0];
  }

  openImageInNewWindow(index) {
    window.open(this.imageBlob[index], '_blank');
  }

  calculateTotalItemsByEstado(items: IItem[]) {
    this.itemEstadosTotales = {};
    this.itemEstadosArray.forEach(estado => {
      this.itemEstadosTotales[estado.key] = items.filter(item => item.estado.toString() === estado.key).length;
    });
  }

  isStockLevelWarning(): boolean {
    const disponibles = this.itemEstadosTotales['1'] || 0;
    const cotizados = this.itemEstadosTotales['2'] || 0;
    const totalDisponibles = disponibles + cotizados;

    return totalDisponibles < this.itemType?.min_stock || totalDisponibles > this.itemType?.max_stock;
  }

  getStockLevelWarningMessage(): string {
    const disponibles = this.itemEstadosTotales['1'] || 0;
    const cotizados = this.itemEstadosTotales['2'] || 0;
    const totalDisponibles = disponibles + cotizados;

    if (totalDisponibles < this.itemType?.min_stock) {
      return `¡Advertencia! El stock actual (${totalDisponibles}) es menor que el stock mínimo (${this.itemType?.min_stock}).`;
    } else if (totalDisponibles > this.itemType?.max_stock) {
      return `¡Advertencia! El stock actual (${totalDisponibles}) es mayor que el stock máximo (${this.itemType?.max_stock}).`;
    }
    return '';
  }

  openAddStockDialog() {
    Swal.fire({
      icon: 'question',
      title: `¿Cuántos artículos desea agregar al Stock de ${this.itemType.nombre}?`,
      text: 'Ingrese la cantidad de artículos que desea agregar al stock, no puede agregar menos de un artículo',
      input: 'number',
      inputAttributes: {
        min: '1',
        step: '1'
      },
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        const quantity = parseInt(value, 10);
        if (isNaN(quantity) || quantity <= 0) {
          return 'Debe ingresar un número mayor a cero';
        }
        return null;
      },
      preConfirm: (value) => {
        const quantity = parseInt(value, 10);
        return quantity;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const quantity = result.value;
        const groupEntries = (document.getElementById('groupEntries') as HTMLInputElement)?.checked || false;
        this.dialog.open(AddStockDialogComponent, {
          data: { quantity: quantity, itemTypeId: this.itemId, itemCategory: this.itemType.categoria },
          width: '900px',
          height: '600px'
        }).afterClosed().subscribe(() => {
          this.loadItems(this.itemId);
        });
      }
    });
  }

  getTableData$(
    filter: string,
    spinner: boolean,
    filterOptions: any
  ) {
    if (spinner) this.spinner.show("itemStockSpinner");

    return this.itemsService.getItems(
      filter,
      filterOptions
    );
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
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
      for (const whFilter of itemFilters) {
        this.filter += `&${whFilter}=${value}`;
      }
    }

    this.getTableData$(
      this.filter,
      false,
      filterOptions
    ).subscribe((resp: ServiceResponse) => {
      this.calculateTotalItemsByEstado(resp.data);
      const items: IItem[] = resp.data.map(item => {
        const currencySymbol = MONEDAS[item.moneda] || '$';
        return {
          ...item,
          estado: this.itemEstados[item.estado].toUpperCase(),
          costo: `${this.currencyPipe.transform(item.costo_compra, currencySymbol, 'symbol', '1.2-2')}`,
          exento: item.exento ? 'SI' : 'NO',
        };
      });
      this.dataSource.data = items;
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

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }
}
