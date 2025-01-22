import {WarehouseItem} from '../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item.model';

export class PackageGuideModel {
  id: number;
  rePack: string;
  packageList: WarehouseItem[];
  newPackageType: string;
  newVolume: string;
  newWeight: string;
  notes: string;

  constructor(packageGuide) {

    this.id = packageGuide.id;
    this.rePack = packageGuide.rePack;
    this.packageList = packageGuide.packageList;
    this.newPackageType = packageGuide.newPackageType;
    this.newVolume = packageGuide.newVolume;
    this.newWeight = packageGuide.newWeight;
    this.notes = packageGuide.notes;
  }

  get netVolume() {
    let netVolume: string;
    if (this.rePack === 'true'){
      netVolume = this.newVolume.toString();
    }else{
        for (const packageUnit of this.packageList) {
           netVolume = netVolume + packageUnit.volume;
        }
      }
    return netVolume;
  }

  get packageQ() {
    return this.packageList.length;
  }
}
