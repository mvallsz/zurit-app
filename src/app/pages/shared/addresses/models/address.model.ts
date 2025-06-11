import { IUser, User } from 'src/app/pages/admin-module/sub-modules/users/models/users.model';

export interface IAddress {
  _id: number;
  address: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
  status: string;
  type: string;
  labels: any;
  user: IUser;
}

export class Address implements IAddress {
  _id: number;
  address: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
  status: string;
  type: string;
  labels: any;
  user: User;

  constructor(data: Partial<IAddress>) {
    this._id = data._id;
    this.address = data.address;
    this.address2 = data.address2;
    this.city = data.city;
    this.zipcode = data.zipcode;
    this.state = data.state;
    this.country = data.country;
    this.status = data.status;
    this.type = data.type;
    this.labels = data.labels;
    this.user = data.user;
  }



}
