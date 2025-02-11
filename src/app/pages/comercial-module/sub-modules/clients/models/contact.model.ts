export interface IContact {
  _id?: string;
  nombre: string;
  telefono: string;
  email: string;
  tipo: number; // 1: principal, 2: administrativo, 3: logistica
  creationDate?: Date;
  createdBy?: string; // Assuming User ID is a string
}

export class Contact implements IContact {
  _id?: string;
  nombre: string;
  telefono: string;
  email: string;
  tipo: number;
  creationDate?: Date;
  createdBy?: string;

  constructor(data: Partial<IContact>) {
    this._id = data._id;
    this.nombre = data.nombre;
    this.telefono = data.telefono;
    this.email = data.email;
    this.tipo = data.tipo;
    this.creationDate = data.creationDate;
    this.createdBy = data.createdBy;
  }
}
