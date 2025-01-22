// export const environment = {
//   production: true,
//   base_url : 'http://localhost:3500/api'
// PRODUCCION
//base_url: "https://api.tlcargo.net/api",
//this_url: "https://app.tlcargo.net",
//PREPRODUCCION
//base_url: "https://apitc.doghoundtech.com",
//this_url: "https://tlcargo.doghoundtech.com",



// };

export const environment = {
  production: true,
  base_url: "https://apitc.doghoundtech.com",
  this_url: "https://tlcargo.doghoundtech.com",
  admin_email: ["Tracking@tlcargo.net", "jerqs2003@gmail.com"],
  admin_notification: true,
  min_weight_air: 4,
  min_weight_sea: 3,
  available_countries: "Venezuela, Colombia, Panamá",
  warehouse_filters: [
    "tlCargoId",
    "shortDesc",
    "customer.email",
    "customer.name",
    "customer.tlCargoName",
  ],
  guide_filters: [
    "tlCargoId",
    "name",
    "notes",
    "customer.email",
    "customer.name",
    "customer.tlCargoName",
    "shipping.name",
  ],
  customer_filters: ["email", "name", "tlCargoName"],
  ships_filters: ["type", "name", "arrivalHub.name"],
  users_filters: ["phone", "name", "email", "role"],
  NEWUSERSECRET: "scpetzdkgggoqexv",
  permissions: [
    { path: 'carriers', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'shippers', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'package-types', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'warehouses', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'rates', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'users', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'customers', expectedRoles: ['ADMIN-ROLE', 'ACCA-ROLE', 'WARE-ROLE'] },
    { path: 'warehouse-list', expectedRoles: ['ADMIN-ROLE', 'WARE-ROLE'] },
    { path: 'ships', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'ships/settle/:shippingId', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'ships/list/:shippingId', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'ships/:guideId/:tlPackage', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'warehouse-list/package-registry', expectedRoles: ['ADMIN-ROLE'] },
    { path: 'guides', expectedRoles: ['ADMIN-ROLE', 'WARE-ROLE', 'DELI-ROLE'] },
    { path: 'guides/register', expectedRoles: ['ADMIN-ROLE', 'WARE-ROLE', 'DELI-ROLE'] },
    { path: 'payment-types', expectedRoles: ['ADMIN-ROLE', 'ACCA-ROLE'] },
    { path: 'guides-invoices', expectedRoles: ['ADMIN-ROLE', 'ACCA-ROLE'] },
    { path: 'shipping-quote', expectedRoles: ['ADMIN-ROLE', 'ACCA-ROLE'] },
    { path: 'shipping-quotes/register', expectedRoles: ['ADMIN-ROLE', 'ACCA-ROLE'] }
  ]
};
