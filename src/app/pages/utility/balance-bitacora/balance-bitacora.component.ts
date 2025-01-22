import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TableColumn } from '../../../../@vex/interfaces/table-column.interface';

import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import { SelectionModel } from '@angular/cdk/collections';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icFolder from '@iconify/icons-ic/twotone-folder';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../@vex/animations/stagger.animation';
import { FormControl } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icMail from '@iconify/icons-ic/twotone-mail';
import icMap from '@iconify/icons-ic/twotone-map';
import icCheck from '@iconify/icons-ic/twotone-checklist';


import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import icPrint from '@iconify/icons-ic/twotone-print';
import { NgxSpinnerService } from 'ngx-spinner';
import icMoney from '@iconify/icons-ic/monetization-on';
import { BalanceBitacoraInterface } from '../../../interfaces/balance-bitacora-data-table.interface';
import { CustomerService } from '../../../services/customer.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PaymentTypeService } from '../../../services/payment-type.service';
import { ServiceResponse } from '../../../interfaces/service-response.interface';
import { UsuarioService } from '../../../services/usuario.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { Customer } from '../../warehousingModules/customers-registry/interfaces/customer.model';

@UntilDestroy()
@Component({
  selector: 'vex-balance-bitacora',
  templateUrl: './balance-bitacora.component.html',
  styleUrls: ['./balance-bitacora.component.scss'],
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

export class BalanceBitacoraComponent implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl('boxed');

  items: BalanceBitacoraInterface[] = [{ balance: 0, newAmount: 0, source: '', balanceDate: '', user: '', notes: '' }];
  customer = Customer;
  @Input()
  columns: TableColumn<BalanceBitacoraInterface>[] = [
    { label: 'Credit', property: 'balance', type: 'text', visible: true },
    { label: 'New Amount (+/-)', property: 'newAmount', type: 'text', visible: true },
    { label: 'Source', property: 'source', type: 'text', visible: true },
    { label: 'Date', property: 'balanceDate', type: 'text', visible: true },
    { label: 'Notes', property: 'notes', type: 'text', visible: true },
    { label: 'Created By', property: 'user', type: 'text', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<BalanceBitacoraInterface> | null;

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
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icMoney = icMoney;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(@Inject(MAT_DIALOG_DATA) public customerId: string,
    private spinner: NgxSpinnerService,
    private customerService: CustomerService,
    private paymentTypeService: PaymentTypeService,
    private usuarioService: UsuarioService,
    private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.spinner.show('balanceSpinner');
    this.dataSource = new MatTableDataSource();

    this.customerService.getCustomer(this.customerId).subscribe((resp => {
      this.customer = resp.data[0];
      const items = resp.data[0].creditBalance.slice();
      for (const item of items) {
        if (this.isObjectId(item.source)) {
          this.paymentTypeService.getPaymentType(item.source).subscribe((respP: ServiceResponse) => {
            item.source = respP.data[0].name;
          });
        }
        if (this.isObjectId(item.user)) {
          this.usuarioService.getUserById(item.user).subscribe((respU: ServiceResponse) => {
            item.user = respU.data[0].name;
          });
        }
      }

      this.dataSource.data = items;


      setTimeout(() => {
        this.spinner.hide('balanceSpinner');
      }, 1000);
    }));

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cd.detectChanges();
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  isObjectId(num) {
    if (num.length !== 24) {
      return false;
    } else {
      return Boolean(num.match(/^[a-zA-Z0-9_.-]*$/i));
    }
  }
  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }
}
