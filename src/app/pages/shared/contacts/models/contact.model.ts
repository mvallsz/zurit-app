import { Address, IAddress } from "../../addresses/models/address.model";

export interface IContact {
  _id: number;
  nombre: string;
  email: string;
  telefono: string;
  whatsapp: string;
  address: IAddress;
  type: 1 | 2; // 1: supplier, 2: client
}

export class Contact implements IContact {
  _id: number;
  nombre: string;
  email: string;
  telefono: string;
  whatsapp: string;
  address: Address;
  type: 1 | 2;

  constructor(data: Partial<IContact>) {
    this._id = data._id;
    this.nombre = data.nombre;
    this.email = data.email;
    this.telefono = data.telefono;
    this.whatsapp = data.whatsapp;
    this.address = new Address(data.address || {});
    this.type = data.type;
  }
}
