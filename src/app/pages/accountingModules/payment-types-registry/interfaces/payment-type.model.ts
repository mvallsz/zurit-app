import { User } from '../../../../../app/pages/adminModules/users-registry/interfaces/users.model';


export class PaymentType {
  _id: number;
  name: string;
  status: string;
  type: string;
  labels: any;
  notes: string;
  user: User;

  constructor(paymentType) {
    this._id = paymentType._id;
    this.name = paymentType.name;
    this.status = paymentType.status;
    this.type = paymentType.type;
    this.labels = paymentType.labels;
    this.notes = paymentType.notes;
    this.user = paymentType.user;
  }

}
