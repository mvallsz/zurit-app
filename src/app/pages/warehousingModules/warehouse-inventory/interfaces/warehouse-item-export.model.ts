import { environment } from '../../../../../environments/environment';

const base_url = environment.base_url;

export class WarehouseItemExport {
  tlCargoId: string;
  shortDesc: string;
  trackingId: string;
  package: string;
  weight: string;
  volume: string;
  vlb: string;
  customer: string;
  infoPackage: string;
  receptionDate: string;
  status: string;
  imageUrl: string;
  invoiceUrl: string;
  shipper: string;
  carrier: string;
  notifiedTimes: number;
  physicalLocation: string;
  onGuide: boolean;
  user: string;
  type: string;

  constructor(warehouseItemFull) {
    this.shortDesc = warehouseItemFull.shortDesc;
    this.imageUrl = `${base_url}/uploads/packages/${warehouseItemFull.imageUrl === '' ? 'NO-IMAGE' : warehouseItemFull.imageUrl}`;
    this.invoiceUrl = `${base_url}/uploads/invoices/${warehouseItemFull.invoiceUrl === '' || warehouseItemFull.invoiceUrl === undefined ? 'NO-INVOICE' : warehouseItemFull.invoiceUrl}`;
    this.weight = warehouseItemFull.weight;
    this.volume = warehouseItemFull.volume;
    this.vlb = warehouseItemFull.vlb;
    this.trackingId = warehouseItemFull.trackingId;
    this.physicalLocation = warehouseItemFull.physicalLocation;
    this.shipper = warehouseItemFull.shipper.name;
    this.carrier = warehouseItemFull.carrier.name;
    this.customer = warehouseItemFull.customer.name;
    this.package = warehouseItemFull.package.name;
    //1: IN WAREHOUSE - 2: REPACKED - 3: IN PROCESS - 4: IN TRANSIT - 5: ON DESTINATION - 6: ON ROUTE - 7: DELIVERED
    switch (warehouseItemFull.status) {
      case '1': this.status = 'IN WAREHOUSE'; break;
      case '2': this.status = 'REPACKED'; break;
      case '3': this.status = 'IN PROCESS'; break;
      case '4': this.status = 'IN TRANSIT'; break;
      case '5': this.status = 'ON DESTINATION'; break;
      case '6': this.status = 'ON ROUTE'; break;
      case '7': this.status = 'DELIVERED'; break;
      default: this.status = warehouseItemFull.status;
    }

    this.receptionDate = warehouseItemFull.receptionDate;
    this.notifiedTimes = warehouseItemFull.notifiedTimes;
    this.infoPackage = warehouseItemFull.infoPackage;
    this.onGuide = warehouseItemFull.onGuide;
    this.user = warehouseItemFull.user.name;

    //    1 normal - 2 repacked
    switch (warehouseItemFull.type) {
      case 1: this.type = 'MORMAL'; break;
      case 2: this.type = 'REPACKED'; break;
    }
    this.tlCargoId = warehouseItemFull.tlCargoId;
  }



}
