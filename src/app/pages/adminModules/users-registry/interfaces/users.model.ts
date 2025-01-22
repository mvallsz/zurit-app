
export interface User {
  _id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  avatar: string;
  status: string;
  google: string;
  creationDate?: Date;
  createdBy: string;
}

export class User {
  constructor(data: any) {
    this._id = data._id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.role = data.role;
    this.avatar = data.avatar;
    this.status = data.status;
    this.google = data.google;
    this.creationDate = data.creationDate;
    this.createdBy = data.createdBy;
  }
}
