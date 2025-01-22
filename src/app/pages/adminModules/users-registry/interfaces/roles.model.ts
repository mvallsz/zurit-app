export class Roles {
  _id: number;
  shortDesc: string;
  role: string;


  constructor(role) {
    this._id = role._id;
    this.shortDesc = role.shortDesc;
    this.role = role.role;
  }

}
