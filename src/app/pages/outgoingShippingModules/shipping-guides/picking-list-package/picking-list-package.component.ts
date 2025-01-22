import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TableColumn } from '../../../../../@vex/interfaces/table-column.interface';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import { SelectionModel } from '@angular/cdk/collections';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icFolder from '@iconify/icons-ic/twotone-folder';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { stagger40ms } from '../../../../../@vex/animations/stagger.animation';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatSelectChange } from '@angular/material/select';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icMail from '@iconify/icons-ic/twotone-mail';
import icMap from '@iconify/icons-ic/twotone-map';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WarehouseItem } from '../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item.model';
import { WarehouseItemService } from '../../../../services/warehouse-item.service';
import { WarehouseItemFull } from '../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { LoadingService } from '../../../../services/loading.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TlPackagesModel } from '../interfaces/tl-packages.model';
import Swal from "sweetalert2";
import { PaymentRecordCreateUpdateComponent } from 'src/app/pages/accountingModules/guides-invoices/payment-record-create-update/payment-record-create-update.component';
import { SplitPackageComponent } from '../guides-create-update/split-package/split-package.component';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';
import { Customer } from 'src/app/pages/warehousingModules/customers-registry/interfaces/customer.model';
import { PackageReceiptComponent } from 'src/app/pages/utility/package-receipt/package-receipt.component';
import icPrint from "@iconify/icons-ic/twotone-print";
import { RepackingRegistryComponent } from 'src/app/pages/warehousingModules/warehouse-inventory/repacking-registry/repacking-registry.component';

@UntilDestroy()
@Component({
  selector: 'vex-picking-list-package',
  templateUrl: './picking-list-package.component.html',
  styleUrls: ['./picking-list-package.component.scss'],
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

export class PickingListPackageComponent implements OnInit, AfterViewInit, OnChanges {

  OnResetParent(tlPackages: TlPackagesModel): void {
    this.dataSource.data = tlPackages.customerPackages;
    this.selection.clear();
    this.dataSource.data.forEach(row => {
      if (tlPackages.packageSelected.includes(row)) {
        this.selection.select(row);
      }
    });
    this.cd.detectChanges();
  }

  layoutCtrl = new FormControl('boxed');
  packages: WarehouseItemFull[];

  @Input() customerId: string;
  @Input() packageStatus: string;
  @Input() selectedPackageArray: WarehouseItemFull[];
  @Input() customerPackageArray: WarehouseItemFull[];

  columns: TableColumn<WarehouseItemFull>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: "Actions", property: "actions", type: "button", visible: true },
    { label: 'Id', property: 'tlCargoId', type: 'text', visible: true },
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
  selection = new SelectionModel<WarehouseItemFull>(true, []);
  searchCtrl = new FormControl();

  @Output() packagesSelected: EventEmitter<WarehouseItemFull[]> = new EventEmitter<WarehouseItemFull[]>();

  icPhone = icPhone;
  icMail = icMail;
  icMap = icMap;
  icPrint = icPrint;
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
    this.dataSource.data = this.customerPackageArray.filter(row => (!row.rePackage));

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.selectedPackageArray) {
      this.selectedPackageArray.forEach(row => {
        this.selection.toggle(row);
        this.selection.select(row);
      });
    }
    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));

    this.spinner.hide('plPackageSpinner');
    this.cd.detectChanges();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    this.dataSource.data = this.customerPackageArray;
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.data = this.dataSource.data.filter(row => this.filtroAvanzado(row, value));
    //   this.dataSource.filter = value;
  }

  filtroAvanzado(whPackge: WarehouseItemFull, value: string) {
    const tlcargoId = `TL-${whPackge._id.toString().substring(0, 5)}${whPackge._id.toString().substring(whPackge._id.toString().toString().length - 5)}`;

    // tslint:disable-next-line:max-line-length
    return tlcargoId.toLowerCase().includes(value) || whPackge.shortDesc.toLowerCase().includes(value) || whPackge.customer.email.toLowerCase().includes(value) || whPackge.customer.name.toLowerCase().includes(value) || whPackge.customer.tlCargoName.toLowerCase().includes(value);
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

  updatePackageList(event, row) {

    if (event) {
      this.selection.toggle(row);
      this.packagesSelected.emit(this.selection.selected);
    }
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

  openReceipt(pac: WarehouseItemFull) {
    this.dialog.open(PackageReceiptComponent, {
      data: pac,
      height: "800px",
      width: "1000px",
    });
  }

  openSplitter(warehouseItem: WarehouseItemFull) {
    Swal.fire({
      icon: "warning",
      title: "Wait!...",
      text: "You are about to divide a package, this action cannot be undone.You're sure?",
      showCancelButton: true,
      confirmButtonText: "Yes, divide it!",
      cancelButtonText: "No, cancel!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.open(SplitPackageComponent, {
          width: '1000px',
          height: "800px",
          data: warehouseItem
        }).afterClosed().subscribe((customer: Customer) => {
          if (customer) {
            this.spinner.show('plPackageSpinner');
            this.warehouseService.getWarehouseItemFullByCustomerId(customer._id.toString(), "1", false).subscribe(
              (response: ServiceResponse) => {
                if (response.ok) {
                  this.customerPackageArray = response.data;
                  this.dataSource.data = this.customerPackageArray;
                  this.spinner.hide('plPackageSpinner');
                  this.cd.detectChanges();
                }
              }
            );
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Handle deny action
      }
    });
  }

  createRePack(packageList: WarehouseItemFull[]) {

    this.dialog
      .open(RepackingRegistryComponent, {
        data: packageList,
        height: "600px",
        width: "1024px",
      })
      .afterClosed()
      .subscribe((pac: any) => {
        if (pac) {
          this.selection.clear();
          this.dataSource.data.unshift(pac.data);
          this.selection.select(pac.data);
          this.packagesSelected.emit(this.selection.selected);
          pac.paqs.forEach((row) => {
            this.dataSource.data = this.dataSource.data.filter((paq) => paq._id != row._id)
          });
          this.cd.detectChanges();
        }
      });
  }
}
