import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableColumn } from '../../../../@vex/interfaces/table-column.interface';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../@vex/animations/stagger.animation';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icFolder from '@iconify/icons-ic/twotone-folder';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icMail from '@iconify/icons-ic/twotone-mail';
import icMap from '@iconify/icons-ic/twotone-map';

import { Warehouse } from './interfaces/warehouse.model';
import { ServiceResponse } from '../../../interfaces/service-response.interface';

import { WarehouseLocationService } from '../../../services/warehouse-location.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { WarehouseLocationCreateUpdateComponent } from './warehouse-location-create-update/warehouse-location-create-update.component';

@UntilDestroy()
@Component({
  selector: 'vex-warehouse-location-registry',
  templateUrl: './warehouse-location-registry.component.html',
  styleUrls: ['./warehouse-location-registry.component.scss'],
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

export class WarehouseLocationRegistryComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl('boxed');

  warehouses: Warehouse[];

  @Input()
  columns: TableColumn<Warehouse>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Warehouse Name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Street', property: 'street', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'City', property: 'city', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Phone', property: 'phoneNumber', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Created By', property: 'user', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<Warehouse> | null;
  selection = new SelectionModel<Warehouse>(true, []);
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

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private warehouseService: WarehouseLocationService
  ) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.spinner.show('warehouseSpinner');
    this.dataSource = new MatTableDataSource();
    this.warehouseService.getWarehouse()
      .subscribe((resp: ServiceResponse) => {
        this.warehouses = resp.data;
        this.dataSource.data = this.warehouses;
        this.spinner.hide('warehouseSpinner');
      });

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createWarehouse() {
    this.dialog.open(WarehouseLocationCreateUpdateComponent).afterClosed().subscribe((warehouse: Warehouse) => {
      if (warehouse) {
        this.spinner.show('warehouseSpinner');
        this.warehouseService.getWarehouse()
          .subscribe((resp: ServiceResponse) => {
            this.warehouses = resp.data;
            this.dataSource.data = this.warehouses;
            this.spinner.hide('warehouseSpinner');
          });
      }
    });
  }

  updateWarehouse(warehouse: Warehouse) {
    this.dialog.open(WarehouseLocationCreateUpdateComponent, {
      data: warehouse
    }).afterClosed().subscribe(updatedWarehouse => {
      if (updatedWarehouse) {
        const index = this.warehouses.findIndex((existingWarehouse) => existingWarehouse._id === updatedWarehouse._id);
        this.warehouses[index] = new Warehouse(updatedWarehouse);
        this.dataSource.data = this.warehouses;
      }
    });
  }

  deleteWarehouse(warehouse: Warehouse) {
    this.spinner.show('warehouseSpinner');
    this.warehouseService.deleteWarehouse(warehouse).subscribe((resp: ServiceResponse) => {

      this.warehouses.splice(this.warehouses.findIndex((existingWarehouse) => existingWarehouse._id === warehouse._id), 1);
      this.selection.deselect(warehouse);
      this.dataSource.data = this.warehouses;
      this.openSnackbar(resp.msg);
      this.spinner.hide('warehouseSpinner');

    }, (error) => this.openSnackbar(error.error.msg));
  }

  deleteWarehouses(warehouses: Warehouse[]) {
    warehouses.forEach(c => this.deleteWarehouse(c));
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
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  onLabelChange(change: MatSelectChange, row: Warehouse) {
    const index = this.warehouses.findIndex(c => c === row);
    this.warehouses[index].labels = change.value;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

}
