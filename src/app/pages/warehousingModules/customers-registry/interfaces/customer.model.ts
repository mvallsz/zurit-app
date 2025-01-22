import { User } from '../../../adminModules/users-registry/interfaces/users.model';

export class Customer {
  _id: any;
  tlCargoName: string;
  name: string;
  phoneNumber: string;
  email: string;
  labels: any;
  notes: string;
  isShipper: boolean;
  usuario: User;
  createdBy: User;
  creditBalance: any[];

  constructor(customer) {
    this._id = customer._id;
    this.tlCargoName = customer.tlCargoName;
    this.name = customer.name;
    this.phoneNumber = customer.phoneNumber;
    this.email = customer.email;
    this.labels = customer.labels;
    this.notes = customer.notes;
    this.isShipper = customer.isShipper;
    this.usuario = customer.usuario;
    this.createdBy = customer.createdBy;
    this.creditBalance = customer.creditBalance;
  }

}
