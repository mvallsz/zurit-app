import { User } from '../../../../../app/pages/adminModules/users-registry/interfaces/users.model';

export class Shipper {
  _id: number;
  name: string;
  tlCargoName: string;
  email: string;
  phoneNumber: string;
  isShipper: boolean;
  onlyShipper: boolean;
  labels: string;
  createdBy: User;

  constructor(shipper) {
    this._id = shipper._id;
    this.name = shipper.name;
    this.tlCargoName = shipper.tlCargoName;
    this.email = shipper.email;
    this.phoneNumber = shipper.phoneNumber;
    this.isShipper = shipper.isShipper;
    this.labels = shipper.labels;
    this.createdBy = shipper.createdBy;
    this.onlyShipper = shipper.onlyShipper;
  }
}
