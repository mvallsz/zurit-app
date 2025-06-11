import { IItem } from '../../../../inventory-module/sub-modules/items/models/item.model'; // Import the Item interface
import { IClient } from '../../clients/models/client.model';

export interface IProject {
  _id?: string;
  client: IClient; // Reference to Client model
  nombre: string;
  tipo: string; // String representation of the project type
  fecha_inicio: Date;
  fecha_fin: Date;
  items_solicitados: Object[]; // Array of ItemType objects
  estado?: string; // String representation of the state
  starred?: boolean;
  anexos?: string[];
  createdBy?: string; // Reference to User model
  creationDate?: Date
}

export class Project implements IProject {
  _id?: string;
  client: IClient;
  nombre: string;
  tipo: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  items_solicitados: Object[]; // Array of ItemType objects
  estado?: string;
  starred?: boolean;
  anexos?: string[];
  createdBy?: string;
  creationDate?: Date;

  constructor(project: IProject) {
    this._id = project._id;
    this.client = project.client;
    this.nombre = project.nombre;
    this.tipo = project.tipo;
    this.fecha_inicio = project.fecha_inicio;
    this.fecha_fin = project.fecha_fin;
    this.items_solicitados = project.items_solicitados;
    this.estado = project.estado;
    this.starred = project.starred;
    this.anexos = project.anexos;
    this.createdBy = project.createdBy;
    this.creationDate = project.creationDate;
  }
}
