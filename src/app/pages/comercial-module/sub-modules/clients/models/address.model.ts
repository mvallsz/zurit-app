export interface IAddress {
  _id?: string;
  calle: string;
  ciudad: string;
  estado: string;
  codigo_postal?: string;
  referencia?: string;
  tipo?: string;
  creationDate?: Date;
  createdBy?: string; // Assuming User ID is a string
}

export class Address implements IAddress {
  _id?: string;
  calle: string;
  ciudad: string;
  estado: string;
  codigo_postal?: string;
  referencia?: string;
  tipo?: string;
  creationDate?: Date;
  createdBy?: string;

  constructor(data: Partial<IAddress>) {
    this._id = data._id;
    this.calle = data.calle;
    this.ciudad = data.ciudad;
    this.estado = data.estado;
    this.codigo_postal = data.codigo_postal;
    this.referencia = data.referencia;
    this.tipo = data.tipo;
    this.creationDate = data.creationDate;
    this.createdBy = data.createdBy;
  }
}
