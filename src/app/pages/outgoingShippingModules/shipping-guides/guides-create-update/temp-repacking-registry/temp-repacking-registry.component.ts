import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TableColumn } from '../../../../../../@vex/interfaces/table-column.interface';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import { SelectionModel } from '@angular/cdk/collections';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icFolder from '@iconify/icons-ic/twotone-folder';
import { fadeInUp400ms } from '../../../../../../@vex/animations/fade-in-up.animation';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { stagger40ms } from '../../../../../../@vex/animations/stagger.animation';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icMail from '@iconify/icons-ic/twotone-mail';
import icMap from '@iconify/icons-ic/twotone-map';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WarehouseItemFull } from '../../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { CarrierService } from '../../../../../services/carrier.service';
import { Carrier } from '../../../../adminModules/curriers-registry/interfaces/carrier.model';
import { initCarrier } from '../../../../../../static-data/tlcargo-static-data';
import { TlPackagesModel } from '../../interfaces/tl-packages.model';

@UntilDestroy()
@Component({
  selector: 'vex-temp-repacking-registry',
  templateUrl: './temp-repacking-registry.component.html',
  styleUrls: ['./temp-repacking-registry.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    fadeInUp400ms,
    stagger40ms
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'standard'
      } as MatFormFieldDefaultOptions
    }
  ]
})

export class TempRepackingRegistryComponent implements AfterViewInit, OnChanges {

  OnResetParent(tlPackages: TlPackagesModel): void {
    this.dataSource.data = tlPackages.packageSelected;
    this.selection.clear();
    this.cd.detectChanges();
  }

  carriers: Carrier[] = [new Carrier(initCarrier)];
  layoutCtrl = new FormControl('boxed');

  @Input() customerPackageArray: WarehouseItemFull[];

  columns: TableColumn<WarehouseItemFull>[] = [
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Id', property: 'tlCargoId', type: 'text', visible: true },
    { label: 'Short Desc', property: 'shortDesc', type: 'text', visible: true },
    { label: 'Volume', property: 'volume', type: 'text', visible: true },
    { label: 'Vlb', property: 'vlb', type: 'text', visible: true },
    { label: 'Weight', property: 'weight', type: 'text', visible: true },
    { label: 'Package Type', property: 'package', type: 'text', visible: true, cssClasses: ['text-xs'] },
    { label: 'Invoice', property: 'invoiceUrl', type: 'text', visible: true, cssClasses: ['text-xs'] },
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<WarehouseItemFull> | null;
  selection = new SelectionModel<WarehouseItemFull>(true, []);
  searchCtrl = new FormControl();

  @Output() packagesSelected: EventEmitter<WarehouseItemFull[]> = new EventEmitter<WarehouseItemFull[]>();

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

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private carrierService: CarrierService,
    private cd: ChangeDetectorRef) {
    carrierService.getCarriers().subscribe((resp) => {
      this.carriers = resp.data;
    });

  }

  filterCarrier(_id): string {
    const carrierToShow = this.carriers.filter(carrier => (carrier._id === _id));
    if (carrierToShow.length > 0) {
      return carrierToShow[0].name;
    } else {
      return '';
    }
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.customerPackageArray;

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));

    this.cd.detectChanges();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      this.packagesSelected.emit(this.selection.selected);
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.packagesSelected.emit(this.selection.selected);
    }
  }

  deletePackage(row) {
    this.customerPackageArray.splice(this.customerPackageArray.indexOf(row), 1);
    this.dataSource.data = this.customerPackageArray;
    this.packagesSelected.emit(this.customerPackageArray);
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

  viewFull(warehouseItem: WarehouseItemFull) { }
}
