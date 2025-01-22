import { User } from '../../../../../app/pages/adminModules/users-registry/interfaces/users.model';


export class Carrier {
  _id: number;
  name: string;
  street: string;
  zipcode: number;
  city: string;
  phoneNumber: string;
  mail: string;
  carrierType: string;
  carrierRate: string;
  labels: any;
  notes: string;
  user: User;

  constructor(carrier) {
    this._id = carrier._id;
    this.name = carrier.name;
    this.street = carrier.street;
    this.zipcode = carrier.zipcode;
    this.city = carrier.city;
    this.phoneNumber = carrier.phoneNumber;
    this.mail = carrier.mail;
    this.labels = carrier.labels;
    this.notes = carrier.notes;
    this.user = carrier.user;
  }

  get address() {
    return `${this.street}, ${this.zipcode} ${this.city}`;
  }

  set address(value) {
  }
}
