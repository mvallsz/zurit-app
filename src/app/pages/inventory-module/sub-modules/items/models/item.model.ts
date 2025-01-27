import { IUser, User } from 'src/app/pages/admin-module/sub-modules/users/models/users.model';
import { MONEDAS, CATEGORIAS, UNIDADES, ITEM_ESTADOS } from '../../../../../../static-data/constants/enums';
import { ISupplier, Supplier } from '../../suppliers/models/supplier.model';

export interface IItem {
  _id?: string;
  nombre: string;
  descripcion: string;
  lote?: string;
  fecha_vencimiento?: Date;
  serial?: string;
  sku?: string;
  codigo_uuid?: string;
  exento?: boolean;
  costo_compra: number;
  moneda: keyof typeof MONEDAS; // 1: USD, 2: EUR, 3: BTC, 4: ETH, 5: VES
  marca: string;
  modelo?: string;
  categoria: keyof typeof CATEGORIAS; // 1: medicamento 2: insumo 3: equipo médico 4: servicio 5:otros
  proveedor: ISupplier; // ObjectId as string
  cantidad: number;
  unidad: keyof typeof UNIDADES; // 1: ml, 2: l, 3: mg, 4: g, 5: kg, 6: cm, 7: m, 8: und, 9: paquete 10: caja
  min_stock: number;
  max_stock: number;
  ficha_tecnica?: string;
  imagenes?: string[];
  estado?: keyof typeof ITEM_ESTADOS; // 1: activo, 2: inactivo, 3: sin stock, 4: alarmado
  creationDate?: Date;
  createdBy?: IUser; // ObjectId as string
  syStatus?: boolean;
}

export class Item implements IItem {
  _id?: string;
  nombre: string;
  descripcion: string;
  lote?: string;
  fecha_vencimiento?: Date;
  serial?: string;
  sku?: string;
  codigo_uuid?: string;
  exento?: boolean;
  costo_compra: number;
  moneda: keyof typeof MONEDAS;
  marca: string;
  modelo?: string;
  categoria: keyof typeof CATEGORIAS;
  proveedor: Supplier;
  cantidad: number;
  unidad: keyof typeof UNIDADES;
  min_stock: number;
  max_stock: number;
  ficha_tecnica?: string;
  imagenes?: string[];
  estado: keyof typeof ITEM_ESTADOS;
  creationDate?: Date;
  createdBy: User;
  syStatus?: boolean;

  constructor(data: Partial<IItem>) {
    this.nombre = data.nombre || '';
    this.descripcion = data.descripcion || '';
    this.lote = data.lote;
    this.fecha_vencimiento = data.fecha_vencimiento;
    this.serial = data.serial;
    this.sku = data.sku;
    this.exento = data.exento || false;
    this.costo_compra = data.costo_compra || 0;
    this.moneda = data.moneda || '1';
    this.marca = data.marca || '';
    this.modelo = data.modelo || '';
    this.categoria = data.categoria || '1';
    this.proveedor = new Supplier(data.proveedor || {});
    this.cantidad = data.cantidad || 0;
    this.unidad = data.unidad || '1';
    this.min_stock = data.min_stock || 0;
    this.max_stock = data.max_stock || 0;
    this.ficha_tecnica = data.ficha_tecnica;
    this.imagenes = data.imagenes;
    this.estado = data.estado;
  }

  // Método para validar si el item está en stock
  isInStock(): boolean {
    return this.cantidad > 0;
  }

  // Método para formatear la fecha de vencimiento
  getFormattedExpirationDate(): string {
    return this.fecha_vencimiento ? this.fecha_vencimiento.toLocaleDateString() : 'N/A';
  }

  // Método para formatear el estado del item
  get formattedStatus(): string {
    return ITEM_ESTADOS[this.estado];
  }


  // Método para formatear el costo de compra
  getFormattedCost(): string {
    return `${this.costo_compra.toFixed(2)} ${MONEDAS[this.moneda]}`;
  }

}
