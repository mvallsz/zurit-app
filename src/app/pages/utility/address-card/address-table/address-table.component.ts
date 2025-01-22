import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Address } from '../../../warehousingModules/customers-registry/interfaces/address.model';
import { FormControl } from '@angular/forms';
import { TableColumn } from '../../../../../@vex/interfaces/table-column.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icCheck from '@iconify/icons-ic/twotone-check';

@Component({
  selector: 'vex-address-table',
  templateUrl: './address-table.component.html',
  styleUrls: ['./address-table.component.scss']
})
export class AddressTableComponent implements OnInit, AfterViewInit, OnChanges {

  icMoreHoriz = icMoreHoriz;
  icCheck = icCheck;
  addresses: Address[];
  layoutCtrl = new FormControl('boxed');

  @Input() addressArray: Address[];

  columns: TableColumn<Address>[] = [
    { label: 'Id', property: '_id', type: 'text', visible: true },
    { label: 'Address', property: 'address', type: 'button', visible: true },
    { label: 'City', property: 'city', type: 'text', visible: true },
    { label: 'Zip Code', property: 'zipcode', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<Address> | null;

  @Output() addressId: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private cd: ChangeDetectorRef) { }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.addressArray;
    this.cd.detectChanges();

  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.addressArray;
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  changeDefault(row: Address) {
    this.addressId.emit(row._id.toString());
  }
}
