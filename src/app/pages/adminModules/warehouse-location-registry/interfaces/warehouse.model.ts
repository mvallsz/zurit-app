import { User } from '../../../../../app/pages/adminModules/users-registry/interfaces/users.model';

export class Warehouse {
  _id: number;
  name: string;
  street: string;
  zipcode: number;
  city: string;
  phoneNumber: string;
  mail: string;
  labels: any;
  notes: string;
  user: User;

  constructor(warehouse) {
    this._id = warehouse._id;
    this.name = warehouse.name;
    this.street = warehouse.street;
    this.zipcode = warehouse.zipcode;
    this.city = warehouse.city;
    this.phoneNumber = warehouse.phoneNumber;
    this.mail = warehouse.mail;
    this.labels = warehouse.labels;
    this.notes = warehouse.notes;
    this.user = warehouse.user;
  }

  get address() {
    return `${this.street}, ${this.zipcode} ${this.city}`;
  }

  set address(value) {
  }
}
