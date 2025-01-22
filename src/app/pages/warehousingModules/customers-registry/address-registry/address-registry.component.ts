import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TableColumn } from '../../../../../@vex/interfaces/table-column.interface';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../../@vex/animations/stagger.animation';

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
import icCheck from '@iconify/icons-ic/twotone-checklist';
import { addressLabels } from '../../../../../static-data/tlcargo-static-data';

import { Address } from '../interfaces/address.model';
import { Customer } from '../interfaces/customer.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';

import { AddressService } from '../../../../services/address.service';

import { AddressCreateUpdateComponent } from './address-create-update/address-create-update.component';

@UntilDestroy()
@Component({
  selector: 'vex-customer-registry',
  templateUrl: './address-registry.component.html',
  styleUrls: ['./address-registry.component.scss'],
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

export class AddressRegistryComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl('fullwidth');

  addresses: Address[];

  @Input()
  columns: TableColumn<Address>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Id', property: '_id', type: 'text', visible: false },
    { label: 'Is Default', property: 'isDefault', type: 'text', visible: true },
    { label: 'Address', property: 'address', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'City', property: 'city', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'State', property: 'state', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Zip Code', property: 'zipcode', type: 'text', visible: false, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Type', property: 'type', type: 'text', visible: true },
    { label: 'Status', property: 'status', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Customer Id', property: 'customerId', type: 'text', visible: false },
    { label: 'Labels', property: 'labels', type: 'button', visible: true },
    { label: 'Created By', property: 'user', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<Address> | null;
  selection = new SelectionModel<Address>(true, []);
  searchCtrl = new FormControl();

  labels = addressLabels;

  icPhone = icPhone;
  icMail = icMail;
  icMap = icMap;
  icEdit = icEdit;
  icCheck = icCheck;
  icSearch = icSearch;
  icDelete = icDelete;
  icAdd = icAdd;
  icFilterList = icFilterList;
  icMoreHoriz = icMoreHoriz;
  icFolder = icFolder;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Customer,
    private dialog: MatDialog,
    private addressService: AddressService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }


  ngOnInit() {

    this.dataSource = new MatTableDataSource();

    this.addressService.getAddresses(this.defaults)
      .subscribe((resp: ServiceResponse) => {
        this.addresses = resp.data;
        this.dataSource.data = this.addresses;
      });

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createAddress(customer: Customer) {
    this.dialog.open(AddressCreateUpdateComponent, {
      height: '550px',
      width: '600px',
      data: customer
    }).afterClosed().subscribe((address: Address) => {
      /**
       * Customer is the updated customer (if the user pressed Save - otherwise it's null)
       */
      if (address) {
        this.addressService.getAddresses(this.defaults)
          .subscribe((resp: ServiceResponse) => {
            this.addresses = resp.data;
            this.dataSource.data = this.addresses;
          });
      }
    });
  }

  updateAddress(customer: Customer) {
    this.dialog.open(AddressCreateUpdateComponent, {
      height: '550px',
      width: '600px',
      data: customer
    }).afterClosed().subscribe((address: Address) => {
      /**
       * Customer is the updated customer (if the user pressed Save - otherwise it's null)
       */
      if (address) {
        const index = this.addresses.findIndex((existingAddress) => existingAddress._id === address._id);
        this.addresses[index] = new Address(address);
        this.dataSource.data = this.addresses;
      }
    });
  }

  changeDefault(address: Address) {
    address.isDefault = true;
    address.customerId = this.defaults._id;

    this.addressService.setDefault(address).subscribe((resp: any) => {
      this.openSnackbar(resp.msg);
      this.addressService.getAddresses(this.defaults)
        .subscribe((respAdd: ServiceResponse) => {
          this.addresses = respAdd.data;
          this.dataSource.data = this.addresses;
          this.table.renderRows();
          this.cd.detectChanges();
        });
    });


  }

  deleteAddress(address: Address) {

    this.addressService.deleteAddress(address).subscribe((resp: any) => {

      this.addresses.splice(this.addresses.findIndex((existingAddress) => existingAddress._id === address._id), 1);
      this.selection.deselect(address);
      this.dataSource.data = this.addresses;
      this.openSnackbar(resp.msg);

    }, (error) => this.openSnackbar(error.error.msg));
  }

  deleteAddresses(addresses: Address[]) {
    addresses.forEach(c => this.deleteAddress(c));
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

  onLabelChange(change: MatSelectChange, row: Address) {
    const index = this.dataSource.data.findIndex(c => c === row);
    this.addresses[index].labels = change.value;

    this.addressService.updateAddress(this.addresses[index]).subscribe((resp: any) => {
    }, (error) => this.openSnackbar(error.error.msg));
  }
}
