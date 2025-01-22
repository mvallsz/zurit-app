import { ShippingEnt } from '../app/pages/outgoingShippingModules/shipping-registry/interfaces/shipping.model';
import { Customer } from '../app/pages/warehousingModules/customers-registry/interfaces/customer.model';
import { PackageType } from '../app/pages/adminModules/package-type-registry/interfaces/package-type.model';
import { Rate } from '../app/pages/adminModules/rate-registry/interfaces/rate.model';
import { User } from '../app/pages/adminModules/users-registry/interfaces/users.model';
import { Warehouse } from '../app/pages/adminModules/warehouse-location-registry/interfaces/warehouse.model';
import { Shipper } from 'src/app/pages/adminModules/shipper-registry/interfaces/shipper.model';
import { Carrier } from 'src/app/pages/adminModules/curriers-registry/interfaces/carrier.model';
import { WarehouseItemFull } from 'src/app/pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';

export const shippingLabels = [
  {
    text: 'ON SCHEDULE',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'FULLY LOADED',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'WITH DELAY',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    text: 'CANCELED',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
];

export const guidesLabels = [
  {
    text: 'ON SCHEDULE',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'FULLY LOADED',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'WITH DELAY',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    text: 'CANCELED',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
];

export const packageStatus = [
  {
    id: '1',
    text: 'IN WAREHOUSE',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '2',
    text: 'REPACKED',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    id: '3',
    text: 'IN PROCESS',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    id: '4',
    text: 'IN TRANSIT',
    textClass: 'text-orange',
    bgClass: 'bg-orange-light',
    previewClass: 'bg-orange'
  },
  {
    id: '5',
    text: 'ON DESTINATION',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
  {
    id: '6',
    text: 'ON ROUTE',
    textClass: 'text-white',
    bgClass: 'bg-amber',
    previewClass: 'bg-amber'
  },
  {
    id: '7',
    text: 'DELIVERED',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    id: '8',
    text: 'SPLITTED',
    textClass: 'text-red',
    bgClass: 'bg-amber',
    previewClass: 'bg-amber'
  }
];

export const guideStatus = [
  {
    id: '0',
    text: 'NOT VALID',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '1',
    text: 'IN WAREHOUSE',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '3',
    text: 'IN PROCESS',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    id: '4',
    text: 'IN TRANSIT',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '5',
    text: 'ON DESTINATION',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
  {
    id: '6',
    text: 'ON ROUTE',
    textClass: 'text-white',
    bgClass: 'bg-amber',
    previewClass: 'bg-amber'
  },
  {
    id: '7',
    text: 'DELIVERED',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    id: '8',
    text: 'PRE-APROVED',
    textClass: 'text-white',
    bgClass: 'bg-primary',
    previewClass: 'bg-primary'
  },
];

export const quoteStatus = [
  {
    id: '0',
    text: 'NOT VALID',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '1',
    text: 'IN PROCESS',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    id: '2',
    text: 'AIR-PRE-APROVED',
    textClass: 'text-white',
    bgClass: 'bg-primary',
    previewClass: 'bg-primary'
  },
  {
    id: '3',
    text: 'SEA-PRE-APROVED',
    textClass: 'text-white',
    bgClass: 'bg-primary',
    previewClass: 'bg-primary'
  },
];

export const paymentGuideStatus = [
  {
    id: '1',
    text: 'NOT PAID',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '2',
    text: 'PAID',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    id: '3',
    text: 'PARCIAL PAID',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    id: '4',
    text: 'PRE PAID',
    textClass: 'text-orange',
    bgClass: 'bg-orange-light',
    previewClass: 'bg-orange'
  }
];

export const paymentStatus = [
  {
    id: '1',
    text: 'NO PAGO',
    textClass: 'text-black',
    bgClass: 'bg-gray',
  },
  {
    id: '2',
    text: 'PAGO',
    textClass: 'text-black',
    bgClass: 'bg-gray',
  },
  {
    id: '3',
    text: 'PAGO PARCIAL',
    textClass: 'text-black',
    bgClass: 'bg-gray',
  }, {
    id: '4',
    text: 'PRE PAGO',
    textClass: 'text-black',
    bgClass: 'bg-gray',
  }
];

export const shippingStatus = [
  {
    id: '1',
    text: 'IN PROCESS',
    textClass: 'text-black',
    bgClass: 'bg-gray',
    previewClass: 'bg-gray'
  },
  {
    id: '2',
    text: 'IN TRANSIT',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    id: '3',
    text: 'ON DESTINATION HUB',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    id: '4',
    text: 'ON DESTINATION WH',
    textClass: 'text-orange',
    bgClass: 'bg-orange-light',
    previewClass: 'bg-orange'
  }
];

export const userStatus = [
  {
    id: '1',
    text: 'ACTIVE',
    textClass: 'text-black',
    bgClass: 'bg-green',
    previewClass: 'bg-green'
  },
  {
    id: '2',
    text: 'INACTIVE',
    textClass: 'text-orange',
    bgClass: 'bg-orange-light',
    previewClass: 'bg-orange'
  },
  {
    id: '3',
    text: 'WITHOUT VALIDATION',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    id: '4',
    text: 'TEMP PASSWORD',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  }
];

export const shippingSettleStatus = [
  {
    id: '1',
    text: 'IN PROCESS',
    classColor: 'tag--process'
  },
  {
    id: '2',
    text: 'IN TRANSIT',
    classColor: 'tag--in-transit'
  },
  {
    id: '3',
    text: 'ON DESTINATION HUB',
    classColor: 'tag--arrived'
  },
  {
    id: '4',
    text: 'ON DESTINATION WH',
    classColor: 'tag--delivered'
  }];

export const registryPackageTableStatus = [
  {
    text: 'Recived',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'On Process',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'On Going',
    textClass: 'text-teal',
    bgClass: 'bg-teal-light',
    previewClass: 'bg-teal'
  },
  {
    text: 'Delivered',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
];

export const customersLabels = [
  {
    text: 'NEW',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'FAVORITE',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'SHIPPER',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    text: 'BLOCKED',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
];

export const addressLabels = [
  {
    text: 'MAIN',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'FAVORITE',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'DANGER',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    text: 'BLOCKED',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
];

export const packageTypeLabels = [
  {
    text: 'NEW',
    textClass: 'text-navy',
    bgClass: 'bg-navy-light',
    previewClass: 'bg-navy'
  },
  {
    text: 'XS',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'S',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'M',
    textClass: 'text-teal',
    bgClass: 'bg-teal-light',
    previewClass: 'bg-teal'
  },
  {
    text: 'L',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
  {
    text: 'XL',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  }
];

export const paymentTypeLabels = [
  {
    text: 'NEW',
    textClass: 'text-navy',
    bgClass: 'bg-navy-light',
    previewClass: 'bg-navy'
  },
  {
    text: 'BLOCKED',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'MAIN',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'FAVORITE',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  }
];

export const warehouseItemsLabels = [
  {
    text: 'NEW',
    textClass: 'text-green',
    bgClass: 'bg-green-light',
    previewClass: 'bg-green'
  },
  {
    text: 'PRIORITY',
    textClass: 'text-cyan',
    bgClass: 'bg-cyan-light',
    previewClass: 'bg-cyan'
  },
  {
    text: 'DAMAGED',
    textClass: 'text-red',
    bgClass: 'bg-red-light',
    previewClass: 'bg-red'
  },
  {
    text: 'UNSEALED',
    textClass: 'text-purple',
    bgClass: 'bg-purple-light',
    previewClass: 'bg-purple'
  },
];

export const initShipping = {
  _id: '',
  name: '',
  type: '',
  departureDate: '',
  departureHub: new Warehouse({}),
  arrivalDate: '',
  arrivalHub: new Warehouse({}),
  status: '1',
  labels: {},
  notes: '',
};

export const initPack = {
  _id: 0,
  shortDesc: '',
  imageUrl: '',
  invoiceUrl: '',
  weight: '0',
  volume: '0',
  vlb: '0',
  trackingId: '',
  shipper: new Shipper({}),
  carrier: new Carrier({}),
  customer: new Customer({}),
  package: new PackageType({}),
  infoCarrier: '',
  infoPackage: '',
  terms: '',
  status: '',
  receptionDate: '',
  labels: '',
  notification: false,
  notifiedTimes: 0,
  physicalLocation: '',
  onGuide: false,
  packageTypeSelected: false,
  user: new User({}),
  piece: 0,
  guideCounter: '',
  guideId: '',
  shipContainer: '',
  guide: '',
  delivery: new User({}),
  type: 0,
  rePackage: new WarehouseItemFull({})
};

export const initGuide = {
  _id: 0,
  name: '',
  type: '',
  status: '',
  finalVolume: 0,
  finalVlb: 0,
  finalWeight: 0,
  cost: 0,
  creationDate: new Date(),
  deliveryDate: new Date(),
  packageList: [''],
  shipping: new ShippingEnt(initShipping),
  customer: new Customer({
    name: '',
    phoneNumber: '',
    email: ''
  }),
  packageType: new PackageType({}),
  notes: '',
  imageUrl: '',
  deliveryAddress: '',
  rateAmount: 0,
  rate: new Rate({}),
  packageTypeSelected: false,
  notifiedTimes: 0,
  user: new User({}),
  paymentStatus: 1
};

export const initCarrier = {
  _id: 0,
  name: '',
  street: '',
  zipcode: 0,
  city: '',
  phoneNumber: '',
  mail: '',
  carrierType: '',
  carrierRate: '',
  labels: {},
  notes: '',
  user: new User({}),
};
