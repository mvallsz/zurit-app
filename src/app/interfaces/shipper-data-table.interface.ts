import { Shipper } from '../pages/adminModules/shipper-registry/interfaces/shipper.model';

export interface ShipperInterface {
  total: number;
  shippers: Shipper[];
}
