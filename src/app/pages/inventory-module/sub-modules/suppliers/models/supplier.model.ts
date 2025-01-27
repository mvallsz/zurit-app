import { Address, IAddress } from "src/app/pages/shared/addresses/models/address.model";
import { Contact, IContact } from "src/app/pages/shared/contacts/models/contact.model";
import { TIPOS_CONTABILIDAD, TIPOS_EMPRESA } from '../../../../../../static-data/constants/enums';

import { IUser, User } from "src/app/pages/admin-module/sub-modules/users/models/users.model";


export interface ISupplier {
  _id?: number;
  descripcion?: string;
  rif: string;
  nombre: string;
  direccion: IAddress;
  codigo: string;
  puntaje: number;
  telefono: string;
  whatsapp: string;
  email: string;
  tipo_contabilidad: keyof typeof TIPOS_CONTABILIDAD;
  tipo: keyof typeof TIPOS_EMPRESA;
  contactos: IContact[];
  creationDate?: Date;
  createdBy: IUser;
  syStatus?: boolean;
}

export class Supplier implements ISupplier {
  _id?: number;
  descripcion?: string;
  rif: string;
  nombre: string;
  direccion: Address;
  codigo: string;
  puntaje: number;
  telefono: string;
  whatsapp: string;
  email: string;
  tipo_contabilidad: keyof typeof TIPOS_CONTABILIDAD;
  tipo: keyof typeof TIPOS_EMPRESA;
  contactos: Contact[];
  creationDate?: Date;
  createdBy: User;
  syStatus?: boolean;

  constructor(data: Partial<ISupplier>) {
    if (typeof data === 'string') {
      this._id = data;
    } else {
      this._id = data._id;
      this.descripcion = data.descripcion;
      this.rif = data.rif || '';
      this.nombre = data.nombre || '';
      this.direccion = new Address(data.direccion || {});
      this.codigo = data.codigo || '';
      this.puntaje = data.puntaje || 0;
      this.telefono = data.telefono || '';
      this.whatsapp = data.whatsapp || '';
      this.email = data.email || '';
      this.tipo_contabilidad = data.tipo_contabilidad || '1';
      this.tipo = data.tipo || '2';
      this.contactos = (data.contactos || []).map(contact => new Contact(contact));
      this.creationDate = data.creationDate || new Date();
      this.createdBy = new User(data.createdBy || {});
      this.syStatus = data.syStatus || true;
    }
  }
}
