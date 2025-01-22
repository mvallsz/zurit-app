import { Warehouse } from '../pages/adminModules/warehouse-location-registry/interfaces/warehouse.model';

export interface WarehouseLocationInterface {
  total: number;
  warehouseLocations: Warehouse[];
}
