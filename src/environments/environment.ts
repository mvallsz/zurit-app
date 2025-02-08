// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base_url: "http://localhost:3500/api/v1",
  this_url: "http://localhost:4200/",
  admin_notification: true,
  admin_email: ["mvallsz85@gmail.com"],
  items_config: {
    items_filters: [
      "nombre",
      "descripcion",
      "lote",
      "serial",
      "sku",
      "codigo_uuid",
      "marca",
      "proveedor.nombre"
    ],
    items_export_config: {
      header_mapper: {
        "nombre": "Nombre",
        "descripcion": "Descripción",
        "lote": "Lote",
        "serial": "Serial",
        "sku": "SKU",
        "codigo_uuid": "Código UUID",
        "marca": "Marca",
        "proveedor.nombre": "Proveedor",
        "cantidad": "Cantidad",
        "unidad": "Unidad",
        "min_stock": "Stock mínimo",
        "max_stock": "Stock máximo",
        "estado": "Estado",
        "creationDate": "Fecha de creación",
        "createdBy.name": "Creado por"
      },
      file_name_template: "items",
      file_extension: "xlsx"
    }
  },
  users_config: {
    new_users_secret: "3df4$3we&wf4f5rg*",
    users_filters: ["phone", "name", "email", "role"],
    users_export_config: {
      header_mapper: {
        "name": "Nombre",
        "email": "Correo",
        "phone": "Teléfono",
        "role": "Rol",
        "estado": "Estado",
        "creationDate": "Fecha de creación",
        "createdBy.name": "Creado por"
      },
      file_name_template: "users",
      file_extension: "xlsx"
    }
  },
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
