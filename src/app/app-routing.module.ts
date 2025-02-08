import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CustomLayoutComponent } from "./custom-layout/custom-layout.component";
import { VexRoutes } from "../@vex/interfaces/vex-route.interface";
import { QuicklinkModule, QuicklinkStrategy } from "ngx-quicklink";
import { AuthGuard } from "./guards/auth.guard";
import { RoleGuard } from "./guards/role.guard";
import { environment } from "../environments/environment";
import { UnsavedChangesGuard } from "./guards/unsaved-changes";

const permissions = environment.permissions;
const routes: VexRoutes = [
  {
    path: "",
    loadChildren: () =>
      import("./pages/auth-module/sub-modules/login/login.module").then((m) => m.LoginModule),
  },
  {
    path: "forgot-password",
    loadChildren: () =>
      import("./pages/auth-module/sub-modules/forgot-password/forgot-password.module").then(
        (m) => m.ForgotPasswordModule
      ),
  },
  {
    path: "active-user/:token",
    loadChildren: () =>
      import("./pages/auth-module/sub-modules/validate-user/validate-user.module").then(
        (m) => m.ValidateUserModule
      ),
  },
  {
    path: "reset-password/:token",
    loadChildren: () =>
      import("./pages/auth-module/sub-modules/reset-password/reset-password.module").then(
        (m) => m.ResetPasswordModule
      ),
  },
  {
    path: "app",
    component: CustomLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        // tslint:disable-next-line:max-line-length
        loadChildren: () =>
          import(
            "./pages/admin-module/sub-modules/users/users.module"
          ).then((m) => m.UsersRegistryModule),
      },
      {
        path: "dashboards/analytics",
        redirectTo: "/",
      },
      {
        path: "usuarios",
        canActivate: [RoleGuard],
        data: { expectedRoles: permissions.filter(x => x.path === 'usuarios')[0].expectedRoles },
        // tslint:disable-next-line:max-line-length
        loadChildren: () =>
          import(
            "./pages/admin-module/sub-modules/users/users.module"
          ).then((m) => m.UsersRegistryModule),
      },
      {
        path: "401",
        loadChildren: () =>
          import(
            "./pages/errors/error-401/error-401.module"
          ).then((m) => m.Error401Module),
      },
      {
        path: "faq",
        loadChildren: () =>
          import("./pages/faq/faq.module").then(
            (m) => m.FaqModule
          ),
      },
      // {
      //   path: "proveedores",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'proveedores')[0].expectedRoles },
      //   loadChildren: () =>
      //     import(
      //       "./pages/adminModules/shipper-registry/shipper-registry.module"
      //     ).then((m) => m.ShipperRegistryModule),
      // },
      // {
      //   path: "tarifas",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'tarifas')[0].expectedRoles },
      //   // tslint:disable-next-line:max-line-length
      //   loadChildren: () =>
      //     import(
      //       "./pages/adminModules/rate-registry/rate-registry.module"
      //     ).then((m) => m.RateRegistryModule),
      // },
      // {
      //   path: "clientes",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'clientes')[0].expectedRoles },
      //   // tslint:disable-next-line:max-line-length
      //   loadChildren: () =>
      //     import(
      //       "./pages/warehousingModules/customers-registry/customers-registry.module"
      //     ).then((m) => m.CustomersRegistryModule),
      // },
      // {
      //   path: "proyectos",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'proyectos')[0].expectedRoles },
      //   // tslint:disable-next-line:max-line-length
      //   loadChildren: () =>
      //     import(
      //       "./pages/warehousingModules/customers-registry/customers-registry.module"
      //     ).then((m) => m.CustomersRegistryModule),
      // },
      {
        path: "items",
        canActivate: [RoleGuard],
        data: { expectedRoles: permissions.filter(x => x.path === 'items')[0].expectedRoles },
        // tslint:disable-next-line:max-line-length
        loadChildren: () =>
          import(
            "./pages/inventory-module/sub-modules/items/items.module"
          ).then((m) => m.ItemsModule),
      },
      {
        path: "items/registro",
        canActivate: [RoleGuard],
        data: { expectedRoles: permissions.filter(x => x.path === 'items/registro')[0].expectedRoles },
        // tslint:disable-next-line:max-line-length
        loadChildren: () =>
          import(
            "./pages/inventory-module/sub-modules/items/items-create/items-create.module"
          ).then((m) => m.ItemsCreateModule),
      },
      {
        path: "items/registro/:id",
        canActivate: [RoleGuard],
        data: { expectedRoles: permissions.filter(x => x.path === 'items/registro')[0].expectedRoles },
        // tslint:disable-next-line:max-line-length
        loadChildren: () =>
          import(
            "./pages/inventory-module/sub-modules/items/items-update/items-update.module"
          ).then((m) => m.ItemsUpdateModule),
      },
      // {
      //   path: "documentos",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'documentos')[0].expectedRoles },
      //   // tslint:disable-next-line:max-line-length
      //   loadChildren: () =>
      //     import(
      //       "./pages/outgoingShippingModules/shipping-guides/shipping-guides.module"
      //     ).then((m) => m.ShippingGuidesModule),
      // },
      // {
      //   path: "documentos/registro/:documentoId",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'documentos/registro')[0].expectedRoles },
      //   // tslint:disable-next-line:max-line-length
      //   loadChildren: () =>
      //     import(
      //       "./pages/outgoingShippingModules/shipping-guides/guides-create-update-b/guides-create-update-b.module"
      //     ).then((m) => m.GuidesCreateUpdateBModule),
      // },
      // {
      //   path: "contaduria",
      //   canActivate: [RoleGuard],
      //   data: { expectedRoles: permissions.filter(x => x.path === 'contaduria')[0].expectedRoles },
      //   // tslint:disable-next-line:max-line-length
      //   loadChildren: () =>
      //     import(
      //       "./pages/accountingModules/payment-types-registry/payment-types-registry.module"
      //     ).then((m) => m.PaymentTypesRegistryModule),
      // },
      {
        path: "**",
        loadChildren: () =>
          import("./pages/errors/error-404/error-404.module").then(
            (m) => m.Error404Module
          ),
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: QuicklinkStrategy,
      scrollPositionRestoration: "enabled",
      relativeLinkResolution: "corrected",
      anchorScrolling: "enabled",
      useHash: true,
    }),
  ],
  exports: [RouterModule, QuicklinkModule],
})
export class AppRoutingModule { }
