// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base_url: "http://localhost:3500/api/v1",
  this_url: "http://localhost:4200/",
  admin_email: ["mvallsz85@gmail.com", "Alvaro@tlcargo.net", "jerqs2003@gmail.com"],
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
  NEWUSERSECRET: "3df4$3we&wf4f5rg*",
  permissions: [
    { path: 'proveedores', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'usuarios', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'documentos', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'tarifas', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'clientes', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'proyectos', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'items', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'items/registro', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'documentos', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'documentos/registro', expectedRoles: ['ADMIN', 'ROOT'] },
    { path: 'contaduria', expectedRoles: ['ADMIN', 'ROOT'] }
  ]
};

/*export const environment = {
  production: false,
  base_url : 'http://192.227.138.4:3500/api'
};*/

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
