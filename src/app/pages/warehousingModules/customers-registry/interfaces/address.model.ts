import { User } from '../../../adminModules/users-registry/interfaces/users.model';

export class Address {
  _id: number;
  address: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
  status: string;
  type: string;
  customerId: string;
  labels: any;
  isDefault: boolean;
  user: User;

  constructor(address) {
    this._id = address._id;
    this.address = address.address;
    this.address2 = address.address2;
    this.city = address.city;
    this.zipcode = address.zipcode;
    this.state = address.state;
    this.country = address.country;
    this.status = address.status;
    this.type = address.type;
    this.customerId = address.customerId;
    this.labels = address.labels;
    this.isDefault = address.isDefault;
    this.user = address.user;
  }


}
