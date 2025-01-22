export class WarehouseItemFrom {
  _id: number;
  shortDesc: string;
  imageUrl: string;
  invoiceUrl: string;
  weight: string;
  volume: string;
  vlb: string;
  trackingId: string;
  physicalLocation: string;
  shipper: string;
  carrier: string;
  customer: string;
  package: string;
  infoCarrier: string;
  infoPackage: string;
  notification: boolean;
  status: string;
  receptionDate: string;
  labels: any;
  notifiedTimes: number;
  terms: string;
  onGuide: boolean;
  packageTypeSelected: boolean;
  user: string;
  piece?: number;
  guideCounter?: string;
  guideId?: string;
  shipContainer?: string;

  constructor(warehouseItem) {
    this._id = warehouseItem._id;
    this.shortDesc = warehouseItem.shortDesc;
    this.imageUrl = warehouseItem.imageUrl;
    this.invoiceUrl = warehouseItem.invoiceUrl;
    this.weight = warehouseItem.weight;
    this.volume = warehouseItem.volume;
    this.vlb = warehouseItem.vlb;
    this.trackingId = warehouseItem.trackingId;
    this.physicalLocation = warehouseItem.physicalLocation;
    this.shipper = warehouseItem.shipper._id;
    this.carrier = warehouseItem.carrier._id;
    this.customer = warehouseItem.customer._id;
    this.package = warehouseItem.package._id;
    this.infoCarrier = warehouseItem.infoCarrier;
    this.notification = warehouseItem.notification;
    this.infoPackage = warehouseItem.infoPackage;
    this.status = warehouseItem.status;
    this.receptionDate = warehouseItem.receptionDate;
    this.terms = warehouseItem.terms;
    this.notifiedTimes = warehouseItem.notifiedTimes;
    this.labels = warehouseItem.labels;
    this.onGuide = warehouseItem.onGuide;
    this.packageTypeSelected = warehouseItem.packageTypeSelected;
    this.user = warehouseItem.user;
  }

}
