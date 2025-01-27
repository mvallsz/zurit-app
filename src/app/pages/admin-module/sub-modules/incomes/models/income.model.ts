import { IItem } from '../../../../inventory-module/sub-modules/items/models/item.model';

export interface IIncomeItem {
  itemId: string | IItem;
  cantidad: number;
  precio: number;
  moneda: string;
}

export interface IIncome {
  _id?: string;
  tipo: string; // e.g., Sale, Refund
  fecha: Date;
  cliente?: string;
  items: IIncomeItem[];
  total: number;
  estado: number; // 1: Activo, 2: Inactivo, 3: Suspendido
  creationDate?: Date;
  createdBy?: string;
  sysStatus?: boolean;
}

export class Income implements IIncome {
  _id?: string;
  tipo: string;
  fecha: Date;
  cliente?: string;
  items: IIncomeItem[];
  total: number;
  estado: number;
  creationDate?: Date;
  createdBy?: string;
  sysStatus?: boolean;

  constructor(income: IIncome) {
    this._id = income._id;
    this.tipo = income.tipo;
    this.fecha = income.fecha;
    this.cliente = income.cliente;
    this.items = income.items;
    this.total = income.total;
    this.estado = income.estado;
    this.creationDate = income.creationDate || new Date();
    this.createdBy = income.createdBy;
    this.sysStatus = income.sysStatus || true;
  }
}
