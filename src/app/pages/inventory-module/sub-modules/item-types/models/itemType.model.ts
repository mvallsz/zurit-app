import { ISupplier } from "../../suppliers/models/supplier.model";

export interface IItemType {
  _id?: string;
  nombre: string;
  descripcion: string;
  marca: string;
  modelo?: string;
  categoria: number;
  proveedor: ISupplier;
  costo_compra: number;
  unidad: string;
  moneda: number;
  exento: boolean;
  min_stock: number;
  max_stock: number;
  ficha_tecnica?: string;
  imagenes?: string[];
  estado?: number;
  creationDate?: Date;
  createdBy?: string;
}

export class ItemType {
  _id?: string;
  nombre: string;
  descripcion: string;
  marca: string;
  modelo?: string;
  categoria: number;
  proveedor: ISupplier;
  costo_compra: number;
  unidad: string;
  moneda: number;
  exento: boolean;
  min_stock: number;
  max_stock: number;
  ficha_tecnica?: string;
  imagenes?: string[];
  estado?: number;
  creationDate?: Date;
  createdBy?: string;

  constructor(itemType: IItemType) {
    this._id = itemType._id;
    this.nombre = itemType.nombre;
    this.descripcion = itemType.descripcion;
    this.marca = itemType.marca;
    this.modelo = itemType.modelo;
    this.categoria = itemType.categoria;
    this.proveedor = itemType.proveedor;
    this.costo_compra = itemType.costo_compra;
    this.unidad = itemType.unidad;
    this.moneda = itemType.moneda;
    this.exento = itemType.exento;
    this.min_stock = itemType.min_stock;
    this.max_stock = itemType.max_stock;
    this.ficha_tecnica = itemType.ficha_tecnica;
    this.imagenes = itemType.imagenes;
    this.estado = itemType.estado;
    this.creationDate = itemType.creationDate;
    this.createdBy = itemType.createdBy;
  }
}
