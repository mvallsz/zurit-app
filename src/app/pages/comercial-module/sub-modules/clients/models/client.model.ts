import { Address, IAddress } from './address.model';
import { Contact, IContact } from './contact.model';

export interface IClient {
  _id?: string;
  descripcion?: string;
  rif: string;
  nombre: string;
  direcciones: (IAddress | string)[]; // Array of Address ID or Address object
  codigo?: string;
  puntaje?: number;
  telefono: string;
  whatsapp: string;
  email: string;
  categoria: number;
  tipo_contabilidad: number;
  tipo_cliente: number;
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
  direcciones: (Address | string)[]; // Array of Address ID or Address object
  codigo?: string;
  puntaje?: number;
  telefono: string;
  whatsapp: string;
  email: string;
  categoria: number;
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
    this.direcciones = data.direcciones;
    this.codigo = data.codigo;
    this.puntaje = data.puntaje;
    this.telefono = data.telefono;
    this.whatsapp = data.whatsapp;
    this.email = data.email;
    this.categoria = data.categoria;
    this.tipo_contabilidad = data.tipo_contabilidad;
    this.tipo_cliente = data.tipo_cliente;
    this.contactos = data.contactos;
    this.creationDate = data.creationDate;
    this.createdBy = data.createdBy;
    this.syStatus = data.syStatus;
  }
}
