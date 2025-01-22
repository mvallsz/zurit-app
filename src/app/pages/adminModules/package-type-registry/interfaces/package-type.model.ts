import { User } from '../../../../../app/pages/adminModules/users-registry/interfaces/users.model';


export class PackageType {
  _id: number;
  name: string;
  type: string;
  height: number;
  width: number;
  length: number;
  labels: any;
  notes: string;
  user: User;

  constructor(packageType) {
    this._id = packageType._id;
    this.name = packageType.name;
    this.type = packageType.type;
    this.height = packageType.height;
    this.width = packageType.width;
    this.length = packageType.length;
    this.labels = packageType.labels;
    this.notes = packageType.notes;
    this.user = packageType.user;
  }

  get measures() {
    return `H ${this.height} x W ${this.width} x L ${this.length}`;
  }
}
