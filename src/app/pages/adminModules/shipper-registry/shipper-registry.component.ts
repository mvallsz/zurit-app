import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
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
import { customersLabels } from '../../../../static-data/tlcargo-static-data';

import { ShipperService } from '../../../services/shipper.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { ServiceResponse } from '../../../interfaces/service-response.interface';
import { Shipper } from './interfaces/shipper.model';

import { ShipperCreateUpdateComponent } from './shipper-create-update/shipper-create-update.component';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'vex-shipper-registry',
  templateUrl: './shipper-registry.component.html',
  styleUrls: ['./shipper-registry.component.scss'],
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
export class ShipperRegistryComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl('boxed');

  shippers: Shipper[];

  @Input()
  columns: TableColumn<Shipper>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Id', property: '_id', type: 'text', visible: false },
    { label: 'Shipper Name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'TlCargo Id', property: 'tlCargoName', type: 'text', visible: true },
    { label: 'Email', property: 'email', type: 'text', visible: true },
    { label: 'Phone', property: 'phoneNumber', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Labels', property: 'labels', type: 'button', visible: true },
    { label: 'Created By', property: 'createdBy', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
  ];

  labels = customersLabels;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<Shipper> | null;
  selection = new SelectionModel<Shipper>(true, []);
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
    private shipperService: ShipperService,
    private snackBar: MatSnackBar) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }


  ngOnInit() {

    this.dataSource = new MatTableDataSource();
    this.spinner.show('shipperSpinner');
    this.shipperService.getShippers()
      .subscribe((resp: ServiceResponse) => {
        this.shippers = resp.data;
        this.dataSource.data = this.shippers;
        this.spinner.hide('shipperSpinner');

      });

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createShipper() {
    this.dialog.open(ShipperCreateUpdateComponent, {
      height: '450px',
      width: '600px'
    }).afterClosed().subscribe((shipper: Shipper) => {
      if (shipper) {
        this.spinner.show('shipperSpinner');
        this.shipperService.getShippers()
          .subscribe((resp: ServiceResponse) => {
            this.shippers = resp.data;
            this.dataSource.data = this.shippers;
            this.spinner.hide('shipperSpinner');
          });
      }
    });
  }

  updateShipper(shipper: Shipper) {
    this.dialog.open(ShipperCreateUpdateComponent, {
      height: '450px',
      width: '600px',
      data: shipper
    }).afterClosed().subscribe(updatedShipper => {
      if (updatedShipper) {
        const index = this.shippers.findIndex((existingShipper) => existingShipper._id === updatedShipper._id);
        this.shippers[index] = new Shipper(updatedShipper);
        this.dataSource.data = this.shippers;
      }
    });
  }

  deleteShipper(shipper: Shipper) {

    Swal.fire(
      {
        title: 'Delete Shipper',
        text: 'Do you want to delete the shipper and the customer or just the shipper status to the customer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete Shipper and Customer',
        cancelButtonText: 'Delete Shipper Only'
      }).then(
        (result) => {
          if (result.isConfirmed) {
            this.spinner.show('shipperSpinner');
            this.shipperService.deleteShipper(shipper).subscribe((resp: ServiceResponse) => {
              this.shippers.splice(this.shippers.findIndex((existingCarrier) => existingCarrier._id === shipper._id), 1);
              this.selection.deselect(shipper);
              this.dataSource.data = this.shippers;
              this.spinner.hide('shipperSpinner');
              this.openSnackbar(resp.msg);
            }, (error) => this.openSnackbar(error.error.msg));
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.spinner.show('shipperSpinner');
            shipper.isShipper = false;
            this.shipperService.updateShipper(shipper).subscribe((resp: ServiceResponse) => {
              this.shippers.splice(this.shippers.findIndex((existingCarrier) => existingCarrier._id === shipper._id), 1);
              this.selection.deselect(shipper);
              this.dataSource.data = this.shippers;
              this.spinner.hide('shipperSpinner');
              this.openSnackbar(resp.msg);
            }, (error) => this.openSnackbar(error.error.msg));
          }
        });



  }

  deleteShippers(shippers: Shipper[]) {
    shippers.forEach(c => this.deleteShipper(c));
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

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

  onLabelChange(change: MatSelectChange, row: Shipper) {
    const index = this.dataSource.data.findIndex(c => c === row);
    this.shippers[index].labels = change.value;

    this.shipperService.updateShipper(this.shippers[index]).subscribe((resp: ServiceResponse) => {
    }, (error) => this.openSnackbar(error.error.msg));
  }
}
