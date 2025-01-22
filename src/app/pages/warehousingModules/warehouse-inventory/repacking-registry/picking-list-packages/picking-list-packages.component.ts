import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger40ms } from 'src/@vex/animations/stagger.animation';
import { WarehouseItemFull } from '../../interfaces/warehouse-item-full.model';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

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
import { MatDialog } from '@angular/material/dialog';
import { WarehouseItemService } from 'src/app/services/warehouse-item.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'vex-picking-list-packages',
  templateUrl: './picking-list-packages.component.html',
  styleUrls: ['./picking-list-packages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

export class PickingListPackagesComponent implements OnInit {

  layoutCtrl = new FormControl('boxed');
  packages: WarehouseItemFull[];

  @Input() customerId: string;
  @Input() packageStatus: string;
  @Input() customerPackageArray: WarehouseItemFull[];

  columns: TableColumn<WarehouseItemFull>[] = [
    { label: 'Id', property: '_id', type: 'text', visible: true },
    { label: 'Short Desc', property: 'shortDesc', type: 'text', visible: true },
    { label: 'Volume', property: 'volume', type: 'text', visible: true },
    { label: 'Vlb', property: 'vlb', type: 'text', visible: true },
    { label: 'Weight', property: 'weight', type: 'text', visible: true },
    { label: 'Package Type', property: 'package', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Reception Date', property: 'receptionDate', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Received by', property: 'user', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },

  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<WarehouseItemFull> | null;

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
    private warehouseService: WarehouseItemService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService) {

  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
  }

  ngOnChanges() {

    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.customerPackageArray;

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.spinner.hide('plPackageSpinner');
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
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
