import { WarehouseItemFull } from "../pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";

export interface ServiceResponse {
  ok: boolean;
  msg: string;
  data: any;
  user?: any;
  uid: string;
  total: number;
  containerPackageList?: WarehouseItemFull[];
}
