import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TableColumn } from '../../../../@vex/interfaces/table-column.interface';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../@vex/animations/stagger.animation';

import { NgxSpinnerService } from 'ngx-spinner';

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
import { packageTypeLabels } from '../../../../static-data/tlcargo-static-data';

import { PackageTypeCreateUpdateComponent } from './package-type-create-update/package-type-create-update.component';
import { PackageTypeService } from '../../../services/package-type.service';

import { ServiceResponse } from '../../../interfaces/service-response.interface';
import { PackageType } from './interfaces/package-type.model';

@UntilDestroy()
@Component({
  selector: 'vex-package-type',
  templateUrl: './package-type-registry.component.html',
  styleUrls: ['./package-type-registry.component.scss'],
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
export class PackageTypeRegistryComponent implements OnInit {

  layoutCtrl = new FormControl('boxed');

  packageTypes: PackageType[];

  @Input()
  columns: TableColumn<PackageType>[] = [
    { label: 'Checkbox', property: 'checkbox', type: 'checkbox', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true },
    { label: 'Name', property: 'name', type: 'text', visible: true },
    { label: 'Package Type', property: 'type', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Height "', property: 'height', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Width "', property: 'width', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Length "', property: 'length', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Created By', property: 'user', type: 'text', visible: true },
  ];

  labels = packageTypeLabels;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<PackageType> | null;
  selection = new SelectionModel<PackageType>(true, []);
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
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private packageTypeService: PackageTypeService) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.spinner.show('pckTypeSpinner');
    this.dataSource = new MatTableDataSource();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.packageTypeService.getPackageType()
      .subscribe((resp: ServiceResponse) => {
        this.packageTypes = resp.data;
        this.dataSource.data = this.packageTypes;
        this.spinner.hide('pckTypeSpinner');
      });

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));
  }

  createPackageType() {
    this.dialog.open(PackageTypeCreateUpdateComponent,
      { width: '700px' }).afterClosed().subscribe((packageType: PackageType) => {
        if (packageType) {
          this.spinner.show('pckTypeSpinner');
          this.packageTypeService.getPackageType()
            .subscribe((resp: ServiceResponse) => {
              this.packageTypes = resp.data;
              this.dataSource.data = this.packageTypes;
              this.spinner.hide('pckTypeSpinner');
            });
        }
      });
  }

  // TODO replicar este proceso para todos los updates

  updatePackageType(packageType: PackageType) {
    this.dialog.open(PackageTypeCreateUpdateComponent, {
      width: '700px', data: packageType
    }).afterClosed().subscribe(updatedPackageType => {
      if (updatedPackageType) {
        const index = this.packageTypes.findIndex((existingPackageType) => existingPackageType._id === updatedPackageType._id);
        this.packageTypes[index] = new PackageType(updatedPackageType);
        this.dataSource.data = this.packageTypes;
      } else {
        for (const packageTypeElement of this.packageTypes) {
          // tslint:disable-next-line:max-line-length
          packageTypeElement.name = (packageTypeElement.name.indexOf('_') === -1 ? packageTypeElement.name : packageTypeElement.name.substr(0, packageTypeElement.name.indexOf('_'))) + '_' + packageTypeElement.height + 'x' + packageTypeElement.width + 'x' + packageTypeElement.length;
        }
        this.dataSource.data = this.packageTypes;
        this.cd.detectChanges();
      }
    });
  }

  deletePackageType(packageType: PackageType) {

    this.packageTypeService.deletePackageType(packageType).subscribe((resp: ServiceResponse) => {

      this.packageTypes.splice(this.packageTypes.findIndex((existingPackageType) => existingPackageType._id === packageType._id), 1);
      this.selection.deselect(packageType);
      this.dataSource.data = this.packageTypes;
      this.openSnackbar(resp.msg);

    }, (error) => this.openSnackbar(error.error.msg));
  }

  deletePackageTypes(packageTypes: PackageType[]) {
    packageTypes.forEach(c => this.deletePackageType(c));
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

  onLabelChange(change: MatSelectChange, row: PackageType) {
    const index = this.dataSource.data.findIndex(c => c === row);
    this.packageTypes[index].labels = change.value;

    this.packageTypeService.updatePackageType(this.packageTypes[index]).subscribe((resp: ServiceResponse) => {
    }, (error) => this.openSnackbar(error.error.msg));
  }
}
