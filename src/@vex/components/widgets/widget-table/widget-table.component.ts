import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TableColumn } from '../../../interfaces/table-column.interface';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icPrint from '@iconify/icons-ic/twotone-print';
import icAlarm from '@iconify/icons-ic/twotone-alarm-on';
import { GuidePickListComponent } from '../../../../app/pages/utility/guide-pick-list/guide-pick-list.component';
import { MatDialog } from '@angular/material/dialog';
import { WarehouseItemService } from '../../../../app/services/warehouse-item.service';
import { Router } from '@angular/router';
import { ShippingEnt } from 'src/app/pages/outgoingShippingModules/shipping-registry/interfaces/shipping.model';

@Component({
  selector: 'vex-widget-table',
  templateUrl: './widget-table.component.html'
})
export class WidgetTableComponent<T> implements OnInit, OnChanges, AfterViewInit {

  @Input() data: T[];
  @Input() columns: TableColumn<T>[];
  @Input() pageSize = 5;
  @Input() title: String;
  @Input() type: String;

  visibleColumns: Array<keyof T | string>;
  dataSource = new MatTableDataSource<T>();

  icMoreHoriz = icMoreHoriz;
  icPrint = icPrint;
  icAlarm = icAlarm;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private dialog: MatDialog,
    private router: Router) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columns) {
      this.visibleColumns = this.columns.map(column => column.property);
    }

    if (changes.data) {
      this.dataSource.data = this.data;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openPickList(guide: any) {

    this.dialog.open(GuidePickListComponent, {
      data: guide,
      height: '800px',
      width: '1000px'
    });
  }

  navigateTo(row: ShippingEnt) {

    this.router.navigate([`/app/ships/settle/${row._id}`]);

  }
}
