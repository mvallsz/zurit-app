import { IClient, Client } from './client.model';
import { IUser, User } from 'src/app/pages/admin-module/sub-modules/users/models/users.model';

export interface ITransaction {
  _id?: string;
  cliente: IClient | string; // Could be the ID or the object
  fecha: Date;
  descripcion: string;
  monto: number;
  creationDate?: Date;
  createdBy?: IUser | string; // Assuming User ID is a string
}

export class Transaction implements ITransaction {
  _id?: string;
  cliente: Client | string;
  fecha: Date;
  descripcion: string;
  monto: number;
  creationDate?: Date;
  createdBy?: User | string;

  constructor(data: Partial<ITransaction>) {
    this._id = data._id;
    this.cliente = data.cliente;
    this.fecha = data.fecha;
    this.descripcion = data.descripcion;
    this.monto = data.monto;
    this.creationDate = data.creationDate;
    this.createdBy = data.createdBy;
  }
}
