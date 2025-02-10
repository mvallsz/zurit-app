import { IUser, User } from 'src/app/pages/admin-module/sub-modules/users/models/users.model';
import { MONEDAS, STOCK_ESTADOS } from '../../../../../../static-data/constants/enums';
import { ISupplier, Supplier } from '../../suppliers/models/supplier.model';

export interface IItem {
  _id?: string;
  itemTypeId: string;
  lote?: string;
  fecha_vencimiento?: Date;
  serial?: string;
  exento?: boolean;
  costo_compra?: number;
  moneda?: keyof typeof MONEDAS; // 1: USD, 2: EUR, 3: BTC, 4: ETH, 5: VES
  estado?: keyof typeof STOCK_ESTADOS; // 1: activo, 2: inactivo, 3: sin stock, 4: alarmado
  creationDate?: Date;
  createdBy?: IUser; // ObjectId as string
  syStatus?: boolean;
}

export class Item implements IItem {
  _id?: string;
  itemTypeId: string;
  lote?: string;
  fecha_vencimiento?: Date;
  serial?: string;
  exento?: boolean;
  costo_compra?: number;
  moneda?: keyof typeof MONEDAS;
  estado?: keyof typeof STOCK_ESTADOS;
  creationDate?: Date;
  createdBy: User;
  syStatus?: boolean;

  constructor(data: Partial<IItem>) {
    this._id = data._id;
    this.itemTypeId = data.itemTypeId;
    this.lote = data.lote;
    this.fecha_vencimiento = data.fecha_vencimiento;
    this.serial = data.serial;
    this.exento = data.exento || false;
    this.costo_compra = data.costo_compra || 0;
    this.moneda = data.moneda || '1';
    this.estado = data.estado;
  }


  // Método para formatear la fecha de vencimiento
  getFormattedExpirationDate(): string {
    return this.fecha_vencimiento ? this.fecha_vencimiento.toLocaleDateString() : 'N/A';
  }

  // Método para formatear el estado del item
  get formattedStatus(): string {
    return STOCK_ESTADOS[this.estado];
  }


  // Método para formatear el costo de compra
  getFormattedCost(): string {
    return `${this.costo_compra.toFixed(2)} ${MONEDAS[this.moneda]}`;
  }

}
