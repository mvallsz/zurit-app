import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';

import { TableColumn } from '../../../../@vex/interfaces/table-column.interface';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../@vex/animations/stagger.animation';

import { NgxSpinnerService } from 'ngx-spinner';
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

import { Carrier } from './interfaces/carrier.model';
import { CarrierCreateUpdateComponent } from './carrier-create-update/carrier-create-update.component';

import { CarrierService } from '../../../services/carrier.service';
import { ServiceResponse } from '../../../interfaces/service-response.interface';

@UntilDestroy()
@Component({
  selector: 'vex-carriers-registry-component',
  templateUrl: './carriers-registry.component.html',
  styleUrls: ['./carriers-registry.component.scss'],
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

export class CarriersRegistryComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl('boxed');
  carriers: Carrier[];

  @Input()
  columns: TableColumn<Carrier>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Carrier Id', property: '_id', type: 'text', visible: false },
    { label: 'Carrier Name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Carrier Type', property: 'carrierType', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Carrier Rate', property: 'carrierRate', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Street', property: 'street', type: 'text', visible: false, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'City', property: 'city', type: 'text', visible: false, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Zip Code', property: 'zipcode', type: 'text', visible: false, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Phone', property: 'phoneNumber', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Email', property: 'email', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Created By', property: 'user', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<Carrier> | null;
  selection = new SelectionModel<Carrier>(true, []);
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
    private carrierService: CarrierService,
    private snackBar: MatSnackBar) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.spinner.show('carrierSpinner');
    this.dataSource = new MatTableDataSource();

    this.carrierService.getCarriers()
      .subscribe((resp: ServiceResponse) => {
        this.carriers = resp.data;
        this.dataSource.data = resp.data;
        this.spinner.hide('carrierSpinner');
      });


    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createCarrier() {
    this.dialog.open(CarrierCreateUpdateComponent).afterClosed().subscribe((carrier: Carrier) => {

      if (carrier) {
        this.spinner.show('carrierSpinner');
        this.carrierService.getCarriers()
          .subscribe((resp) => {
            this.carriers = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide('carrierSpinner');
          });
      }
    });
  }

  updateCarrier(carrier: Carrier) {
    this.dialog.open(CarrierCreateUpdateComponent, {
      data: carrier
    }).afterClosed().subscribe(updatedCarrier => {
      if (updatedCarrier) {
        this.spinner.show('carrierSpinner');
        this.carrierService.getCarriers()
          .subscribe((resp) => {
            this.carriers = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide('carrierSpinner');
          });
      }
    });
  }

  deleteCarrier(carrier: Carrier) {

    this.carrierService.deleteCarriers(carrier).subscribe((resp: ServiceResponse) => {
      this.carriers.splice(this.carriers.findIndex((existingCarrier) => existingCarrier._id === carrier._id), 1);
      this.selection.deselect(carrier);
      this.dataSource.data = this.carriers;
      this.openSnackbar(resp.msg);
    }, (error) => this.openSnackbar(error.error.msg));


  }

  deleteCarriers(carriers: Carrier[]) {
    /**
     * Here we are updating our local array.
     * You would probably make an HTTP request here.
     */
    carriers.forEach(c => this.deleteCarrier(c));
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
}
