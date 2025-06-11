import { AfterViewInit, Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { stagger80ms } from 'src/@vex/animations/stagger.animation';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { CATEGORIAS, TIPOS_PROYECTO, UNIDADES } from 'src/static-data/constants/enums';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icEdit from '@iconify/icons-ic/twotone-edit'; // Import edit icon
import { ItemsReq } from '../../projects-create.component';

@Component({
  selector: 'zurit-items-req',
  templateUrl: './items-req.component.html',
  styleUrls: ['./items-req.component.scss'],
  animations: [
    stagger80ms,
      fadeInUp400ms,
      scaleIn400ms,
      fadeInRight400ms]
})
export class ItemsReqComponent<T> implements OnInit, AfterViewInit {

  @Input() itemsReqDataSource: MatTableDataSource<T>;
  @Input() columns: TableColumn<T>[];
  @Input() itemsReqPageSizeOptions: number[] = [5, 10, 20];
  @Input() itemsReqTotalData: number = 0;
  @Input() itemsReqPageSize: number = 10;

  @Output() edit = new EventEmitter<T>();

  icMoreVert = icMoreVert;
  icMoreHoriz = icMoreHoriz;
  icDelete = icDelete;
  icEdit = icEdit;

  UNIDADES = UNIDADES;
  CATEGORIAS = CATEGORIAS;
  TIPOS_PROYECTO = TIPOS_PROYECTO;

  @ViewChild(MatPaginator, { static: true }) itemsReqPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subs: Subscription[] = [];

    get visibleColumns() {
      return this.columns
        .filter(column => column.visible)
        .map(column => column.property);
    }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.itemsReqDataSource.paginator = this.itemsReqPaginator;
    this.itemsReqDataSource.sort = this.sort;
  }

  editItemReq(itemReq: T) {
    this.edit.emit(itemReq);
  }

  removeItemReq(itemReq: ItemsReq) {
    //this.itemsReq = this.itemsReq.filter(it => it !== itemReq);
    this.itemsReqDataSource.data = this.itemsReqDataSource.data.filter(it => it !== itemReq); // Trigger table update
    //this.cd.detectChanges();
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

}
