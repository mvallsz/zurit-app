export class GuidesEnt {

  _id: number;
  name: string;
  type: string;
  status: string;
  finalVolume: number;
  finalWeight: number;
  cost: number;
  creationDate: Date;
  deliveryDate: Date;
  packageList: string[];
  shipping: number;
  customer: number;
  packageType: number;
  notes: string;
  imageUrl: string;
  rateAmount: number;
  rate: number;
  packageTypeSelected: boolean;
  notifiedTimes: number;
  usuario: number;
  paymentStatus: string;
  paidAmount: number;
  paymentBitacora: object[];
  notification: boolean;
  partialPaid: boolean;
  tlCargoId: string;
  quote: boolean;

  constructor(guidesModel) {

    this._id = guidesModel._id;
    this.name = guidesModel.name;
    this.type = guidesModel.type;
    this.status = guidesModel.status;
    this.finalVolume = guidesModel.finalVolume;
    this.finalWeight = guidesModel.finalWeight;
    this.cost = guidesModel.cost;
    this.creationDate = guidesModel.creationDate;
    this.deliveryDate = guidesModel.deliveryDate;
    this.packageList = guidesModel.packageList;
    this.shipping = guidesModel.shipping;
    this.customer = guidesModel.customer;
    this.packageType = guidesModel.packageType;
    this.notes = guidesModel.notes;
    this.imageUrl = guidesModel.imageUrl;
    this.rateAmount = guidesModel.rateAmount;
    this.rate = guidesModel.rate;
    this.packageTypeSelected = guidesModel.packageTypeSelected;
    this.notifiedTimes = guidesModel.notifiedTimes;
    this.usuario = guidesModel.usuario;
    this.paymentStatus = guidesModel.paymentStatus;
    this.paidAmount = guidesModel.paidAmount;
    this.paymentBitacora = guidesModel.paymentBitacora;
    this.notification = guidesModel.notification;
    this.partialPaid = guidesModel.partialPaid;
    this.tlCargoId = guidesModel.tlCargoId;
    this.quote = guidesModel.quote;
  }



}
