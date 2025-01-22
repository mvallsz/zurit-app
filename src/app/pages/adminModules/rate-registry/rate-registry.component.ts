import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';


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
import icOn from '@iconify/icons-ic/outline-toggle-on';
import icOff from '@iconify/icons-ic/outline-toggle-off';
import icCheck from '@iconify/icons-ic/twotone-checklist';

import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Rate } from './interfaces/rate.model';
import { RateService } from '../../../services/rate.service';
import { ServiceResponse } from '../../../interfaces/service-response.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { RateCreateUpdateComponent } from './rate-create-update/rate-create-update.component';


@UntilDestroy()
@Component({
  selector: 'vex-rate-registry-component',
  templateUrl: './rate-registry.component.html',
  styleUrls: ['./rate-registry.component.scss'],
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
export class RateRegistryComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl('boxed');

  rates: Rate[];

  @Input()
  columns: TableColumn<Rate>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Rate Id', property: '_id', type: 'text', visible: false },
    { label: 'Is Default', property: 'isDefault', type: 'text', visible: true },
    { label: 'Rate Name', property: 'name', type: 'text', visible: true },
    { label: 'Rate', property: 'rate', type: 'text', visible: true },
    { label: 'Rate Type', property: 'type', type: 'text', visible: true },
    { label: 'Rate Status', property: 'status', type: 'text', visible: true },
    { label: 'City rate', property: 'city', type: 'text', visible: true },
    { label: 'Created By', property: 'user', type: 'text', visible: true },
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<Rate> | null;
  selection = new SelectionModel<Rate>(true, []);
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
  icCheck = icCheck;

  icOn = icOn;
  icOff = icOff;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private rateService: RateService,
    private snackBar: MatSnackBar) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.spinner.show('rateSpinner');
    this.dataSource = new MatTableDataSource();

    this.rateService.getRates()
      .subscribe((resp: ServiceResponse) => {
        this.rates = resp.data;
        this.dataSource.data = resp.data;
        this.spinner.hide('rateSpinner');

      });


    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createRate() {
    this.dialog.open(RateCreateUpdateComponent).afterClosed().subscribe((rate: Rate) => {

      if (rate) {
        this.spinner.show('rateSpinner');

        this.rateService.getRates()
          .subscribe((resp: ServiceResponse) => {
            this.rates = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide('rateSpinner');

          });
      }
    });
  }

  updateRate(rate: Rate) {
    this.dialog.open(RateCreateUpdateComponent, {
      data: rate
    }).afterClosed().subscribe(updatedRate => {

      if (updatedRate) {
        const index = this.rates.findIndex((existingRate) => existingRate._id === updatedRate._id);
        this.rates[index] = new Rate(updatedRate);
        this.dataSource.data = this.rates;
      }
    });
  }

  deleteRate(rate: Rate) {
    this.spinner.show('rateSpinner');
    this.rateService.deleteRates(rate).subscribe((resp: any) => {
      this.rates.splice(this.rates.findIndex((existingRate) => existingRate._id === rate._id), 1);
      this.selection.deselect(rate);
      this.dataSource.data = this.rates;
      this.spinner.hide('rateSpinner');

      this.openSnackbar(resp.msg);
    }, (error) => this.openSnackbar(error.error.msg));


  }

  deleteRates(rates: Rate[]) {
    rates.forEach(c => this.deleteRate(c));
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

  changeDefault(rate: Rate) {
    rate.isDefault = true;

    this.rateService.setDefault(rate).subscribe((resp: any) => {
      this.openSnackbar(resp.msg);
      this.rateService.getRates()
        .subscribe((respCarga) => {
          this.rates = respCarga.data;
          this.dataSource.data = respCarga.data;
        });
    });

    /*
    *
              this.table.renderRows();
              this.cd.detectChanges();
    *
    * */
  }
}
