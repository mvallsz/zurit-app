import { ShippingEnt } from '../pages/outgoingShippingModules/shipping-registry/interfaces/shipping.model';

export interface ShippingInterface {
  total: number;
  ships: ShippingEnt[];
}
