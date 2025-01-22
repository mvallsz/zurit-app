import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TableColumn } from '../../../../@vex/interfaces/table-column.interface';
import { paymentTypeLabels } from '../../../../static-data/tlcargo-static-data';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import { SelectionModel } from '@angular/cdk/collections';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icFolder from '@iconify/icons-ic/twotone-folder';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { stagger40ms } from '../../../../@vex/animations/stagger.animation';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatSelectChange } from '@angular/material/select';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icMail from '@iconify/icons-ic/twotone-mail';
import icMap from '@iconify/icons-ic/twotone-map';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceResponse } from '../../../interfaces/service-response.interface';
import { PaymentType } from './interfaces/payment-type.model';
import { PaymentTypeService } from '../../../services/payment-type.service';
import { PaymentTypeCreateUpdateComponent } from './payment-type-create-update/payment-type-create-update.component';
import icOn from '@iconify/icons-ic/outline-toggle-on';
import icOff from '@iconify/icons-ic/outline-toggle-off';
import { NgxSpinnerService } from 'ngx-spinner';


@UntilDestroy()
@Component({
  selector: 'vex-payment-types-registry',
  templateUrl: './payment-types-registry.component.html',
  styleUrls: ['./payment-types-registry.component.scss'],
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
export class PaymentTypesRegistryComponent implements OnInit, AfterViewInit {

  layoutCtrl = new FormControl('boxed');

  paymentTypes: PaymentType[];

  @Input()
  columns: TableColumn<PaymentType>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Id', property: '_id', type: 'text', visible: false },
    { label: 'Payment Name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Status', property: 'status', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Type', property: 'type', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Labels', property: 'labels', type: 'button', visible: true },
    { label: 'Created By', property: 'user', type: 'text', visible: true },
  ];

  labels = paymentTypeLabels;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<PaymentType> | null;
  selection = new SelectionModel<PaymentType>(true, []);
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


  icOn = icOn;
  icOff = icOff;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private paymentTypeService: PaymentTypeService) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.spinner.show('paymentTypeSpinner');
    this.dataSource = new MatTableDataSource();

    this.paymentTypeService.getPaymentTypes()
      .subscribe((resp: ServiceResponse) => {
        this.paymentTypes = resp.data.filter(paymentType => (paymentType.canShow));
        this.dataSource.data = this.paymentTypes;
        this.spinner.hide('paymentTypeSpinner');
      });

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createPaymentType() {
    this.dialog.open(PaymentTypeCreateUpdateComponent, {
      width: '400px'
    }).afterClosed().subscribe((paymentType: PaymentType) => {
      if (paymentType) {
        this.spinner.show('paymentTypeSpinner');
        this.paymentTypeService.getPaymentTypes()
          .subscribe((resp: ServiceResponse) => {
            this.paymentTypes = resp.data.filter(paymentTypeF => (paymentTypeF.canShow));
            this.dataSource.data = this.paymentTypes;
            this.spinner.hide('paymentTypeSpinner');
          });
      }
    });
  }

  updatePaymentType(paymentType: PaymentType) {
    this.dialog.open(PaymentTypeCreateUpdateComponent, {
      data: paymentType,
      width: '400px'
    }).afterClosed().subscribe(updatedPaymentType => {
      if (updatedPaymentType) {
        const index = this.paymentTypes.findIndex((existingPaymentType) => existingPaymentType._id === updatedPaymentType._id);
        this.paymentTypes[index] = new PaymentType(updatedPaymentType);
        this.dataSource.data = this.paymentTypes;
      }
    });
  }

  deletePaymentType(paymentType: PaymentType) {
    this.spinner.show('paymentTypeSpinner');

    this.paymentTypeService.deletePaymentType(paymentType).subscribe((resp: ServiceResponse) => {
      this.paymentTypes.splice(this.paymentTypes.findIndex((existingPaymentType) => existingPaymentType._id === paymentType._id), 1);
      this.selection.deselect(paymentType);
      this.dataSource.data = this.paymentTypes;
      this.spinner.hide('paymentTypeSpinner');
      this.openSnackbar(resp.msg);

    }, (error) => this.openSnackbar(error.error.msg));
  }

  deletePaymentTypes(paymentTypes: PaymentType[]) {
    paymentTypes.forEach(c => this.deletePaymentType(c));
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

  onLabelChange(change: MatSelectChange, row: PaymentType) {
    const index = this.dataSource.data.findIndex(c => c === row);
    this.paymentTypes[index].labels = change.value;

    this.paymentTypeService.updatePaymentType(this.paymentTypes[index]).subscribe((resp: ServiceResponse) => {
    }, (error) => this.openSnackbar(error.error.msg));
  }
}
