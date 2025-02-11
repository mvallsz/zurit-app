import { Address, IAddress } from './address.model';
import { Contact, IContact } from './contact.model';

export interface IClient {
  _id?: string;
  descripcion?: string;
  rif: string;
  nombre: string;
  direccion: IAddress | string; // Could be the ID or the object
  codigo: string;
  puntaje?: number;
  telefono: string;
  whatsapp: string;
  email: string;
  tipo_contabilidad: number; // 1: ordinario, 2: especial
  tipo_cliente: number; // 1: empresa privada, 2: ente gubernamental
  contactos: (IContact | string)[]; // Array of Contact IDs or Contact objects
  creationDate?: Date;
  createdBy?: string; // Assuming User ID is a string
  syStatus?: boolean;
}

export class Client implements IClient {
  _id?: string;
  descripcion?: string;
  rif: string;
  nombre: string;
  direccion: Address | string;
  codigo: string;
  puntaje?: number;
  telefono: string;
  whatsapp: string;
  email: string;
  tipo_contabilidad: number;
  tipo_cliente: number;
  contactos: (Contact | string)[];
  creationDate?: Date;
  createdBy?: string;
  syStatus?: boolean;

  constructor(data: Partial<IClient>) {
    this._id = data._id;
    this.descripcion = data.descripcion;
    this.rif = data.rif;
    this.nombre = data.nombre;
    this.direccion = data.direccion;
    this.codigo = data.codigo;
    this.puntaje = data.puntaje;
    this.telefono = data.telefono;
    this.whatsapp = data.whatsapp;
    this.email = data.email;
    this.tipo_contabilidad = data.tipo_contabilidad;
    this.tipo_cliente = data.tipo_cliente;
    this.contactos = data.contactos;
    this.creationDate = data.creationDate;
    this.createdBy = data.createdBy;
    this.syStatus = data.syStatus;
  }
}
