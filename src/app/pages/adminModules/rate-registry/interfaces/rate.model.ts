import { User } from '../../../../../app/pages/adminModules/users-registry/interfaces/users.model';


export class Rate {
  _id: number;
  name: string;
  rate: number;
  type: string;
  status: number;
  notes: string;
  city: any;
  isDefault: boolean;
  user: User;

  constructor(rate) {
    this._id = rate._id;
    this.name = rate.name;
    this.rate = rate.rate;
    this.type = rate.type;
    this.status = rate.status;
    this.notes = rate.notes;
    this.city = rate.city;
    this.isDefault = rate.isDefault;
    this.user = rate.user;
  }

  toString() {
    return this._id;
  }
}
