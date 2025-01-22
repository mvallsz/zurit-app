import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { fadeInUp400ms } from '../../../../../../@vex/animations/fade-in-up.animation';
import { stagger40ms } from '../../../../../../@vex/animations/stagger.animation';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { FormControl } from '@angular/forms';
import { TableColumn } from '../../../../../../@vex/interfaces/table-column.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ManifestData } from '../../../../../interfaces/manifest-data-table.interface';
import icSearch from '@iconify/icons-ic/twotone-search';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import icEdit from '@iconify/icons-ic/twotone-edit';
import { ShippingEnt } from '../../interfaces/shipping.model';
import { ShippingService } from '../../../../../services/shipping.service';
import { ServiceResponse } from '../../../../../interfaces/service-response.interface';
import {
  WarehouseItemFull
} from '../../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { WarehouseItemService } from '../../../../../services/warehouse-item.service';
import Swal from "sweetalert2";
import { PackageTypeService } from 'src/app/services/package-type.service';

@UntilDestroy()
@Component({
  selector: 'vex-temp-shipping-manifest',
  templateUrl: './temp-shipping-manifest.component.html',
  styleUrls: ['./temp-shipping-manifest.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
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
export class TempShippingManifestComponent implements AfterViewInit, OnChanges {

  layoutCtrl = new FormControl('boxed');
  @Input() shippingPackageArray: ManifestData[];
  @Input() ship: ShippingEnt;

  columns: TableColumn<ManifestData>[] = [
    { label: 'Short Desc', property: 'shortDesc', type: 'text', visible: true },
    { label: 'Volume', property: 'finalVolume', type: 'text', visible: true },
    { label: 'Vlb', property: 'finalVlb', type: 'text', visible: true },
    { label: 'Weight', property: 'finalWeight', type: 'text', visible: true },
    { label: 'Measuress', property: 'packageType', type: 'text', visible: true, cssClasses: ['text-secondary', 'font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<ManifestData> | null;
  selection = new SelectionModel<ManifestData>(true, []);
  searchCtrl = new FormControl();

  @Output() packagesSelected: EventEmitter<ManifestData[]> = new EventEmitter<ManifestData[]>();
  @Output() packageToEdit: EventEmitter<ManifestData> = new EventEmitter<ManifestData>();
  @Output() packages: EventEmitter<WarehouseItemFull[]> = new EventEmitter<WarehouseItemFull[]>();
  @Output() packagesToEdit: EventEmitter<String> = new EventEmitter<String>();

  icSearch = icSearch;
  icDelete = icDelete;
  icEdit = icEdit;
  icFilterList = icFilterList;
  icMoreHoriz = icMoreHoriz;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private shippingService: ShippingService,
    private wareHouseService: WarehouseItemService,
    private packageTypeService: PackageTypeService,
    private cd: ChangeDetectorRef) {

  }

  toNumber(num: String) {
    return Number(num);
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource();

    this.shippingPackageArray.forEach((row) => {
      if (row.packageType !== 'N/A') {
        this.packageTypeService.getPackageTypeByName(row.packageType).subscribe(
          (resp: ServiceResponse) => {
            row.measures = `H:${resp.data[0].height}in. X 
            W:${resp.data[0].width}in. X 
            L:${resp.data[0].length}in.`;
          }
        );
      }
    });
    this.dataSource.data = this.shippingPackageArray;


    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.onFilterChange(value));

    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    if (this.dataSource.data) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cd.detectChanges();
    }

  }

  public OnResetParent(data: ManifestData[]) {
    this.shippingPackageArray = data;
    this.dataSource.data = this.shippingPackageArray;
    this.packagesSelected.emit(this.shippingPackageArray);
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
    if (this.isAllSelected()) {
      this.selection.clear();
      this.packagesSelected.emit(this.selection.selected);
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.packagesSelected.emit(this.selection.selected);
    }
  }

  editPackage(row) {
    this.packageToEdit.emit(row);
  }

  deletePackage(row) {

    Swal.fire({
      title:
        "Are you about to remove a package container? ",
      icon: "warning",
      text: "If you continue, that would mean that all the packages associated with this container would remain as loose packages",
      showDenyButton: true,
      confirmButtonText: "Yes, I'm aware of that",
      denyButtonText: `No!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let container: ManifestData;
        container = row;
        const containerIndex = this.shippingPackageArray.indexOf(row);
        const noConteinerIndex = this.shippingPackageArray.indexOf(this.shippingPackageArray.filter(x => x.shortDesc === 'Loose Packages')[0]);

        this.shippingPackageArray[noConteinerIndex].finalVlb = Number(this.shippingPackageArray[noConteinerIndex].finalVlb) + Number(container.finalVlb);
        this.shippingPackageArray[noConteinerIndex].finalVolume = Number(this.shippingPackageArray[noConteinerIndex].finalVolume) + Number(container.finalVolume);
        this.shippingPackageArray[noConteinerIndex].finalWeight = Number(this.shippingPackageArray[noConteinerIndex].finalWeight) + Number(container.finalWeight);

        this.shippingPackageArray.splice(containerIndex, 1);
        this.ship.shippingManifest = this.shippingPackageArray;

        this.shippingService.updateShipping(this.ship).subscribe(
          (respS: ServiceResponse) => {
            if (!respS.ok) {
              console.log(respS.msg);
            }
          }
        );

        let packageList: WarehouseItemFull[];
        this.shippingService.getShippingGuidesAndPackageList(this.ship._id.toString()).subscribe(
          (resp: ServiceResponse) => {
            packageList = [];
            for (const guide of resp.data) {
              packageList = packageList.concat(guide.packageList);
            }

            for (const tlPackage of packageList) {
              if (tlPackage.shipContainer === container.shortDesc) {
                tlPackage.shipContainer = 'Loose Packages';
                this.wareHouseService.updateWarehouseItem(tlPackage).subscribe(
                  (respW: ServiceResponse) => {
                    if (!respW.ok) {
                      console.log(respW.msg);
                    }
                  }
                );
              }
            }
          }
        );
        this.dataSource.data = this.shippingPackageArray;
        this.packagesToEdit.emit(container.shortDesc);
        this.openSnackbar('Container deleted successfully');
      }
    });



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
