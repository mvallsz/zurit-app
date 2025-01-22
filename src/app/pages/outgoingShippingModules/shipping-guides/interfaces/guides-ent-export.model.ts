import { ShippingEnt } from "../../shipping-registry/interfaces/shipping.model";
import { Customer } from "../../../warehousingModules/customers-registry/interfaces/customer.model";
import { PackageType } from "../../../adminModules/package-type-registry/interfaces/package-type.model";
import { WarehouseItemFull } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { WarehouseItem } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item.model";
import { Address } from "../../../warehousingModules/customers-registry/interfaces/address.model";
import { Rate } from "../../../adminModules/rate-registry/interfaces/rate.model";
import { User } from "../../../adminModules/users-registry/interfaces/users.model";
import { PaymentBitacoraInterface } from "../../../../interfaces/payment-bitacora-data-table.interface";

export class GuidesEntExport {
  tlcargoId: string;
  status: string;
  finalVolume: number;
  finalVlb: number;
  finalWeight: number;
  packageList: string;
  cost: number;
  creationDate: Date;
  deliveryDate: Date;
  shipping: string;
  customer: string;
  notes: string;
  imageUrl: string;
  deliveryAddress: string;
  rateAmount: number;
  notifiedTimes: number;
  paymentStatus: string;
  paidAmount: number;
  partialPaid: boolean;
  quote: boolean;

  constructor(guidesModel) {
    this.tlcargoId = guidesModel.tlCargoId;
    switch (guidesModel.status) {
      case "1":
        this.status = "IN WAREHOUSE";
        break;
      case "2":
        this.status = "REPACKED";
        break;
      case "3":
        this.status = "IN PROCESS";
        break;
      case "4":
        this.status = "IN TRANSIT";
        break;
      case "5":
        this.status = "ON DESTINATION";
        break;
      case "6":
        this.status = "ON ROUTE";
        break;
      case "7":
        this.status = "DELIVERED";
        break;
      default:
        this.status = guidesModel.status;
    }
    this.finalVolume = guidesModel.finalVolume;
    this.finalVlb = guidesModel.finalVlb;
    this.finalWeight = guidesModel.finalWeight;
    this.packageList = guidesModel.packageList.length;
    this.cost = guidesModel.cost;
    this.creationDate = guidesModel.creationDate;
    this.deliveryDate = guidesModel.deliveryDate;
    this.shipping = `${guidesModel.shipping.type} - ${guidesModel.shipping.name}`;
    this.customer = `${guidesModel.customer.tlCargoName} - ${guidesModel.customer.name}`;
    this.notes = guidesModel.notes;
    this.imageUrl = guidesModel.imageUrl;
    this.deliveryAddress = `${guidesModel.deliveryAddress.address}, ${guidesModel.deliveryAddress.address2}, ${guidesModel.deliveryAddress.city}, ${guidesModel.deliveryAddress.state}`;
    this.rateAmount = guidesModel.rateAmount;
    this.notifiedTimes = guidesModel.notifiedTimes;
    switch (guidesModel.paymentStatus) {
      case "1":
        this.paymentStatus = "NOT PAID";
        break;
      case "2":
        this.paymentStatus = "PAID";
        break;
    }
    this.paidAmount = guidesModel.paidAmount;
    this.partialPaid = guidesModel.partialPaid ? guidesModel.partialPaid : "0";
    this.quote = guidesModel.quote;
  }
}
