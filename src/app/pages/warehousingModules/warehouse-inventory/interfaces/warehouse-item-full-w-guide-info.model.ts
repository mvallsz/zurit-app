import { Shipper } from '../../../adminModules/shipper-registry/interfaces/shipper.model';
import { Carrier } from '../../../adminModules/curriers-registry/interfaces/carrier.model';
import { Customer } from '../../customers-registry/interfaces/customer.model';
import { PackageType } from '../../../adminModules/package-type-registry/interfaces/package-type.model';
import { User } from '../../../adminModules/users-registry/interfaces/users.model';
import { GuidesEntPop } from '../../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';

export class WarehouseItemFullWGuideInfoModel {
  _id: string;
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
  guide: GuidesEntPop;
  guideFlag: boolean;
  measurement: string;
  piece?: number;
  guideCounter?: string;
  shipContainer?: string;

  constructor(warehouseItemFullWGuideInfoModel) {
    this._id = warehouseItemFullWGuideInfoModel._id;
    this.shortDesc = warehouseItemFullWGuideInfoModel.shortDesc;
    this.imageUrl = warehouseItemFullWGuideInfoModel.imageUrl;
    this.invoiceUrl = warehouseItemFullWGuideInfoModel.invoiceUrl;
    this.weight = warehouseItemFullWGuideInfoModel.weight;
    this.volume = warehouseItemFullWGuideInfoModel.volume;
    this.vlb = warehouseItemFullWGuideInfoModel.vlb;
    this.trackingId = warehouseItemFullWGuideInfoModel.trackingId;
    this.physicalLocation = warehouseItemFullWGuideInfoModel.physicalLocation;
    this.shipper = warehouseItemFullWGuideInfoModel.shipper;
    this.carrier = warehouseItemFullWGuideInfoModel.carrier;
    this.customer = warehouseItemFullWGuideInfoModel.customer;
    this.package = warehouseItemFullWGuideInfoModel.package;
    this.infoCarrier = warehouseItemFullWGuideInfoModel.infoCarrier;
    this.terms = warehouseItemFullWGuideInfoModel.terms;
    this.status = warehouseItemFullWGuideInfoModel.status;
    this.receptionDate = warehouseItemFullWGuideInfoModel.receptionDate;
    this.labels = warehouseItemFullWGuideInfoModel.labels;
    this.notification = warehouseItemFullWGuideInfoModel.notification;
    this.notifiedTimes = warehouseItemFullWGuideInfoModel.notifiedTimes;
    this.infoPackage = warehouseItemFullWGuideInfoModel.infoPackage;
    this.onGuide = warehouseItemFullWGuideInfoModel.onGuide;
    this.packageTypeSelected = warehouseItemFullWGuideInfoModel.packageTypeSelected;
    this.user = warehouseItemFullWGuideInfoModel.user;
    this.guide = warehouseItemFullWGuideInfoModel.guide;
    this.guideFlag = warehouseItemFullWGuideInfoModel.guideFlag;
    this.measurement = warehouseItemFullWGuideInfoModel.measurement;
  }



}
