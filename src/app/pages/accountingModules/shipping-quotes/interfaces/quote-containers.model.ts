import { User } from "src/app/pages/adminModules/users-registry/interfaces/users.model";
import { GuidesEntPop } from "src/app/pages/outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model";
import { Customer } from "src/app/pages/warehousingModules/customers-registry/interfaces/customer.model";
import { WarehouseItemFrom } from "src/app/pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-from_full.model";
import { WarehouseItemFull } from "src/app/pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";

export class Quote {
  _id?: string;
  tlCargoId?: string;
  status?: string;
  notification?: boolean;
  notifiedTimes?: number;
  preGuideList: GuidesEntPop[];
  customer: Customer;
  user: User;
  syStatus: boolean;
  creationDate?: Date;
  finalVolume?: number = 0;
  finalWeight?: number = 0;

  constructor(quote) {
    this._id = quote._id;
    this.tlCargoId = quote.tlCargoId;
    this.status = quote.status;
    this.notification = quote.notification;
    this.notifiedTimes = quote.notifiedTimes;
    this.preGuideList = quote.preGuideList;
    this.customer = quote.customer;
    this.user = quote.user;
    this.syStatus = quote.syStatus;
    this.creationDate = quote.creationDate;
  }

}
