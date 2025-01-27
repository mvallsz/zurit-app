import { IUser } from "../../users/models/users.model";

export interface IExpense {
  _id?: string;
  categoria: number; // 1: gasto operativo, 2: gasto logistico, 3: gasto extraordinario
  justificacion: string;
  descripcion: string;
  iva?: number;
  monto: number;
  moneda: number; // 1: USD, 2: EUR, 3: BTC, 4: ETH, 5: VES
  factura?: string;
  estado: number; // 1: pendiente, 2: aprobado, 3: rechazado, 4: anulado
  creationDate?: Date;
  createdBy: IUser;
  syStatus?: boolean;
}

export class Expense implements IExpense {
  _id?: string;
  categoria: number;
  justificacion: string;
  descripcion: string;
  iva?: number;
  monto: number;
  moneda: number;
  factura?: string;
  estado: number;
  creationDate?: Date;
  createdBy: IUser;
  syStatus?: boolean;

  constructor(expense: IExpense) {
    this._id = expense._id;
    this.categoria = expense.categoria;
    this.justificacion = expense.justificacion;
    this.descripcion = expense.descripcion;
    this.iva = expense.iva || 0;
    this.monto = expense.monto;
    this.moneda = expense.moneda;
    this.factura = expense.factura;
    this.estado = expense.estado || 1;
    this.creationDate = expense.creationDate || new Date();
    this.createdBy = expense.createdBy;
    this.syStatus = expense.syStatus || true;
  }
}
