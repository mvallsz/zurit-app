import { WarehouseItemFull } from '../pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';

export class ManifestData {

  shortDesc: string;
  finalVolume: number;
  finalVlb: number;
  finalWeight: number;
  packageType: string;
  packageList: WarehouseItemFull[];
  measures?: string;
  customValue?: boolean;

  constructor(manifestData) {
    this.shortDesc = manifestData.shortDesc;
    this.finalVolume = manifestData.finalVolume;
    this.finalVlb = manifestData.finalVlb;
    this.finalWeight = manifestData.finalWeight;
    this.packageType = manifestData.packageType;
    this.packageList = manifestData.packageList;
    this.measures = manifestData.measures;
    this.customValue = manifestData.customValue;
  }
}
