import { Shipper } from '../../../adminModules/shipper-registry/interfaces/shipper.model';
import { Carrier } from '../../../adminModules/curriers-registry/interfaces/carrier.model';
import { Customer } from '../../customers-registry/interfaces/customer.model';
import { PackageType } from '../../../adminModules/package-type-registry/interfaces/package-type.model';
import { User } from '../../../adminModules/users-registry/interfaces/users.model';

export class WarehouseItemFull {
  _id: number;
  shortDesc: string;
  imageUrl: string;
  invoiceUrl: string;
  weight: string;
  volume: string;
  vlb: string;
  trackingId: string;
  shipper: Shipper;
  carrier: Carrier;
  customer: Customer;
  package: PackageType;
  infoCarrier: string;
  infoPackage: string;
  terms: string;
  status: string;
  receptionDate: string;
  labels: any;
  notification: boolean;
  notifiedTimes: number;
  physicalLocation: string;
  onGuide: boolean;
  packageTypeSelected: boolean;
  user: User;
  piece?: number;
  guideCounter?: string;
  guideId?: string;
  shipContainer?: string;
  guide?: number;
  delivery?: User;
  deliveryInfo?: string;
  type: number;
  rePackage: WarehouseItemFull;
  splitPackage: WarehouseItemFull;
  tlCargoId: string;

  constructor(warehouseItemFull) {
    this._id = warehouseItemFull._id;
    this.shortDesc = warehouseItemFull.shortDesc;
    this.imageUrl = warehouseItemFull.imageUrl;
    this.invoiceUrl = warehouseItemFull.invoiceUrl;
    this.weight = warehouseItemFull.weight;
    this.volume = warehouseItemFull.volume;
    this.vlb = warehouseItemFull.vlb;
    this.trackingId = warehouseItemFull.trackingId;
    this.physicalLocation = warehouseItemFull.physicalLocation;
    this.shipper = warehouseItemFull.shipper;
    this.carrier = warehouseItemFull.carrier;
    this.customer = warehouseItemFull.customer;
    this.package = warehouseItemFull.package;
    this.infoCarrier = warehouseItemFull.infoCarrier;
    this.terms = warehouseItemFull.terms;
    this.status = warehouseItemFull.status;
    this.receptionDate = warehouseItemFull.receptionDate;
    this.labels = warehouseItemFull.labels;
    this.notification = warehouseItemFull.notification;
    this.notifiedTimes = warehouseItemFull.notifiedTimes;
    this.infoPackage = warehouseItemFull.infoPackage;
    this.onGuide = warehouseItemFull.onGuide;
    this.packageTypeSelected = warehouseItemFull.packageTypeSelected;
    this.user = warehouseItemFull.user;
    this.guideCounter = warehouseItemFull.guideCounter;
    this.piece = warehouseItemFull.piece;
    this.guideId = warehouseItemFull.guideId;
    this.guide = warehouseItemFull.guide;
    this.shipContainer = warehouseItemFull.shipContainer;
    this.delivery = warehouseItemFull.delivery;
    this.deliveryInfo = warehouseItemFull.deliveryInfo;
    this.type = warehouseItemFull.type;
    this.rePackage = warehouseItemFull.rePackage;
    this.splitPackage = warehouseItemFull.splitPackage;
    this.tlCargoId = warehouseItemFull.tlCargoId;
  }



}
