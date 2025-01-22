import { WarehouseItemFull } from "src/app/pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";

export class TlPackagesModel {
    packageSelected: WarehouseItemFull[];
    customerPackages: WarehouseItemFull[];
  
    constructor(TlPackages) {
      this.packageSelected = TlPackages.packageSelected;
      this.customerPackages = TlPackages.customerPackages;
    }
  }
  