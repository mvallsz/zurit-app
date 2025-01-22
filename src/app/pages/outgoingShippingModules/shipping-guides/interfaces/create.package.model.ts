export class CreatePackageModel {
  id: number;
  trackingId: string;
  volume: string;
  packageType: string;
  status: string;
  receptionDate: string;

  constructor(createPackageModel) {
    this.id = createPackageModel.id;
    this.trackingId = createPackageModel.trackingId;
    this.volume = createPackageModel.volume;
    this.packageType = createPackageModel.packageType;
    this.status = createPackageModel.status;
    this.receptionDate = createPackageModel.receptionDate;
  }
}
