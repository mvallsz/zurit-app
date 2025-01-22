import { Warehouse } from '../../../adminModules/warehouse-location-registry/interfaces/warehouse.model';
import { Carrier } from '../../../adminModules/curriers-registry/interfaces/carrier.model';
import { ManifestData } from '../../../../interfaces/manifest-data-table.interface';
import { User } from '../../../adminModules/users-registry/interfaces/users.model';

export class ShippingEnt {
  _id: number;
  name: string;
  type: string;
  carrier: Carrier;
  departureDate: string;
  departureHub: Warehouse;
  arrivalDate: string;
  arrivalHub: Warehouse;
  status: string;
  labels: any;
  guidesCount: number;
  notes: string;
  shippingManifest: ManifestData[];
  user: User;

  constructor(shippingEnt) {
    this._id = shippingEnt._id;
    this.name = shippingEnt.name;
    this.type = shippingEnt.type;
    this.carrier = shippingEnt.carrier;
    this.departureDate = shippingEnt.departureDate;
    this.departureHub = shippingEnt.departureHub;
    this.arrivalDate = shippingEnt.arrivalDate;
    this.arrivalHub = shippingEnt.arrivalHub;
    this.status = shippingEnt.status;
    this.labels = shippingEnt.labels;
    this.notes = shippingEnt.notes;
    this.shippingManifest = shippingEnt.shippingManifest;
    this.guidesCount = shippingEnt.guidesCount;
    this.user = shippingEnt.user;
  }

}
