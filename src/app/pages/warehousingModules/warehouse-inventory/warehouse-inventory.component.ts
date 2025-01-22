import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import { MatSelectChange } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { TableColumn } from "../../../../@vex/interfaces/table-column.interface";
import { fadeInUp400ms } from "../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../@vex/animations/stagger.animation";

import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icFolder from "@iconify/icons-ic/twotone-folder";
import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icPrint from "@iconify/icons-ic/twotone-print";
import icAlarm from "@iconify/icons-ic/twotone-alarm-on";
import icQR from "@iconify/icons-ic/baseline-qr-code";
import icBox from "@iconify/icons-ic/add-box";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import { packageStatus } from "../../../../static-data/tlcargo-static-data";
import { environment } from "../../../../environments/environment";

import { WarehouseItemService } from "../../../services/warehouse-item.service";
import { CustomerService } from "../../../services/customer.service";
import { MailService } from "../../../services/mail.service";
import { NgxSpinnerService } from "ngx-spinner";

import { WarehouseItemFull } from "./interfaces/warehouse-item-full.model";
import { WarehouseItem } from "./interfaces/warehouse-item.model";
import { ServiceResponse } from "../../../interfaces/service-response.interface";

import { RegistryPackageCreateUpdateComponent } from "./registry-package-create-update/registry-package-create-update.component";
import { PackageReceiptComponent } from "../../utility/package-receipt/package-receipt.component";
import { QrGeneratorComponent } from "./qr-generator/qr-generator.component";

import Swal from "sweetalert2";
import { TlCargoIdPipe } from "../../../pipes/tl-cargo-id/tl-cargo-id.pipe";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { interval, of } from "rxjs";
import { RepackingRegistryComponent } from "./repacking-registry/repacking-registry.component";
import { NotExpr } from "@angular/compiler";
import * as XLSX from "xlsx";
import { WarehouseItemExport } from "./interfaces/warehouse-item-export.model";
import { SplitPackageComponent } from "../../outgoingShippingModules/shipping-guides/guides-create-update/split-package/split-package.component";
import { Customer } from "../customers-registry/interfaces/customer.model";
import { Router } from "@angular/router";
import { PackageQrGeneratorComponent } from "./package-qr-generator/package-qr-generator.component";
import { GuidesService } from "src/app/services/guides.service";
import { QuotesService } from "src/app/services/quotes.service";

const this_url = environment.this_url;
const warehouseFilters = environment.warehouse_filters;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@UntilDestroy()
@Component({
  selector: "vex-warehouse-inventory",
  templateUrl: "./warehouse-inventory.component.html",
  styleUrls: ["./warehouse-inventory.component.scss"],
  animations: [fadeInUp400ms, stagger40ms],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: "standard",
      } as MatFormFieldDefaultOptions,
    },
  ],
})
export class WarehouseInventoryComponent implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl("boxed");
  packageList: WarehouseItemFull[];

  columns: TableColumn<WarehouseItemFull>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "Actions", property: "actions", type: "button", visible: true },
    { label: "Id", property: "tlCargoId", type: "text", visible: true },
    {
      label: "Customer Name",
      property: "customer",
      type: "text",
      visible: true,
      cssClasses: ["font-medium"],
    },
    {
      label: "Short Desc",
      property: "shortDesc",
      type: "text",
      visible: true,
      cssClasses: ["font-medium"],
    },
    {
      label: "Shipper Name",
      property: "shipper",
      type: "text",
      visible: false,
    },
    {
      label: "Package Type",
      property: "package",
      type: "text",
      visible: false,
      cssClasses: ["text-secondary", "font-medium"],
    },
    { label: "Status", property: "status", type: "button", visible: true },
    {
      label: "Notified",
      property: "notification",
      type: "text",
      visible: true,
    },
    {
      label: "Reception Date",
      property: "receptionDate",
      type: "text",
      visible: true,
      cssClasses: ["text-secondary", "font-medium"],
    },
    { label: "Created By", property: "user", type: "text", visible: false },
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  interval;
  totalData = 0;
  dataSource: MatTableDataSource<WarehouseItemFull> | null;
  selection = new SelectionModel<WarehouseItemFull>(true, []);
  searchCtrl = new FormControl();

  urlItem = "";

  status = packageStatus;
  statusToShow = packageStatus.slice(0, 3);

  icPhone = icPhone;
  icMail = icMail;
  icMap = icMap;
  icEdit = icEdit;
  icSearch = icSearch;
  icDelete = icDelete;
  icAdd = icAdd;
  icFilterList = icFilterList;
  icMoreHoriz = icMoreHoriz;
  icFolder = icFolder;
  icPrint = icPrint;
  icAlarm = icAlarm;
  icQR = icQR;
  icBox = icBox;
  icArrowDropDown = icArrowDropDown;

  tlCargoId = "";
  cantProcessed = 0;
  public spinnerDown = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

  public dateSearch = false;
  public dateColor = 'primary';

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private warehouseItemService: WarehouseItemService,
    private guideService: GuidesService,
    private mailService: MailService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private quoteService: QuotesService
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.spinner.show("pckSpinner");
    this.dataSource = new MatTableDataSource();
  }

  getTableData$(
    pageNumber: Number,
    pageSize: Number,
    filter: string,
    spinner: boolean,
    filterOptions: any
  ) {
    if (spinner) this.spinner.show("pckSpinner");

    return this.warehouseItemService.getWarehouseItemsFull(
      pageNumber,
      pageSize,
      filter,
      filterOptions
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.getTableData$(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.filter,
            true,
            filterOptions
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((tlData: ServiceResponse) => {
          if (tlData == null) return this.packageList;
          this.totalData = tlData.total;
          return tlData.data;
        })
      )
      .subscribe((tlData) => {
        this.spinner.hide("pckSpinner");
        this.packageList = tlData;
        this.dataSource = new MatTableDataSource(this.packageList);
        this.sort.sort({ id: "receptionDate", start: "desc" } as MatSortable);
        this.dataSource.sort = this.sort;
      });
  }

  name = `TLCargo_warehouse_items${Date.now().toPrecision()}.xlsx`;

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;

    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let itemsToExport: WarehouseItemExport[];
        itemsToExport = new Array();
        if (resp.data.length > 0) {
          for (const item of resp.data) {
            itemsToExport.push(new WarehouseItemExport(item));
          }
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            JSON.parse(JSON.stringify(itemsToExport))
          );
          const book: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(book, worksheet, "Sheet1");

          XLSX.writeFile(book, this.name);
          this.spinnerDown = false;
        } else {
          this.openSnackbar("There is nothing to download -.-");
          this.spinnerDown = false;
        }
      }
    );
  }

  showDate() {
    this.dateSearch = !this.dateSearch;
    this.dateColor = this.dateSearch ? 'accent' : 'primary';
    if (!this.dateSearch) {
      this.sinceDateCtrl.setValue("");
      this.untilDateCtrl.setValue("");
    } else {
      this.searchCtrl.setValue("");
    }
  }

  openReceipt(pac: WarehouseItemFull) {
    this.dialog.open(PackageReceiptComponent, {
      data: pac,
      height: "800px",
      width: "1000px",
    });
  }


  openQRStickMulti(tlPackages: WarehouseItemFull[]) {
    this.dialog.open(PackageQrGeneratorComponent, {
      data: {
        tlPackages
      },
      height: "600px",
      width: "700px",
    });
  }

  openQRStick(pac: WarehouseItemFull) {
    this.dialog.open(QrGeneratorComponent, {
      data: pac,
      height: "500px",
      width: "700px",
    });
  }

  openSplitter(warehouseItem: WarehouseItemFull) {

    Swal.fire({
      icon: "warning",
      title: "Wait!...",
      text: "You are about to divide a package, this action cannot be undone.You're sure?",
      showCancelButton: true,
      confirmButtonText: "Yes, divide it!",
      cancelButtonText: "No, cancel!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.open(SplitPackageComponent, {
          width: '1000px',
          height: "800px",
          data: warehouseItem
        }).afterClosed().subscribe((resp: any) => {
          if (resp) {
            this.spinner.show("pckSpinner");
            if (Array.isArray(resp.newPackages)) {
              this.packageList = this.packageList.concat(resp.newPackages);
            } else {
              this.packageList.push(resp.newPackages);
            }
            this.packageList.forEach((row) => {
              if (row._id === warehouseItem._id) {
                row.status = '8';
              }
            });

            this.dataSource.data = this.packageList;
            this.cd.detectChanges();
            this.spinner.hide("pckSpinner");

          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Handle deny action
      }
    });
  }

  async sendNotification(pac: WarehouseItemFull, actualiza: boolean) {
    this.tlCargoId = pac.tlCargoId;
    const pacToUpdate: WarehouseItem = new WarehouseItem(pac);
    this.urlItem = `${this_url}/#/warehouse-item-receipt/${pac._id}`;
    const mail: any = {};
    mail.from = "TlCargo system Notification Service";
    mail.to = pac.customer.email;

    if (adminNotification) mail.bcc = adminEmails;
    mail.subject = `Hemos recibido un paquete [${pac.tlCargoId}] en tu casillero!`;

    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <br> <h2> Has recibido un paquete en tu casillero! </h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> <tr> <td style="background-color:#5DADE2; color: white;"> <h2 style="font-size: 14pt;">Hola ${pac.customer.name
      }</h2> <p style="font-size: 12pt;">¡Has recibido paquetes en tu casillero! </p> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 20px;"> <b>ID del paquete:</b> ${this.tlCargoId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Descripción:</b> ${pac.shortDesc
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Tracking ID:</b> ${pac.trackingId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Fecha de recepción:</b> ${new Date(
        pac.receptionDate
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Peso y Volumen:</b> ${pac.weight
      } pounds, <span style="font-size: 8pt;"> ${Number(
        +pac.weight / 2.2046
      ).toFixed(2)} Kgs. </span> / ${pac.volume
      } pies<sup>3</sup> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Enviado por:</b> ${pac.shipper.name
      } </td> </tr> <tr> <td style="text-align: center; font-size: 8pt; padding:10px;"> <hr> <p>Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br>${this.urlItem
      } </p> <hr> <p> Una vez que hayas confirmado la recepción y verificado que todo lo que has comprado esté correcto, por favor avísanos cuándo deseas que enviemos tus productos a Venezuela. Para ello, te pedimos que nos envíes un correo electrónico único con la lista de los números de recibo (TL-xxxx) y la confirmación de cuándo y en qué tipo de envío deseas que los despachemos. <br>Estamos aquí para ayudarte en todo el proceso. </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <br> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:30px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    await this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {
        this.openSnackbar("Customer notified Correctly!!");
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }

      if (actualiza) {
        pacToUpdate.notifiedTimes++;
        this.warehouseItemService
          .updateWarehouseItem(pacToUpdate)
          .subscribe((respAct: any) => {
            const packageRow = this.packageList.filter(
              (tlpackage) => tlpackage._id === pacToUpdate._id
            )[0];
            packageRow.notifiedTimes++;
          });
      }
    });
  }

  async sendNotificationMassive(pac: WarehouseItemFull, actualiza: boolean) {
    this.tlCargoId = pac.tlCargoId;
    const pacToUpdate: WarehouseItem = new WarehouseItem(pac);
    this.urlItem = `${this_url}/#/warehouse-item-receipt/${pac._id}`;
    const mail: any = {};
    mail.from = "TlCargo system Notification Service";
    mail.to = pac.customer.email;

    if (adminNotification) mail.bcc = adminEmails;
    mail.subject = `Hemos recibido un paquete [${this.tlCargoId}] en tu casillero!`;

    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <br> <h2> Has recibido un paquete en tu casillero! </h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> <tr> <td style="background-color:#5DADE2; color: white;"> <h2 style="font-size: 14pt;">Hola ${pac.customer.name
      }</h2> <p style="font-size: 12pt;">¡Has recibido paquetes en tu casillero! </p> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 20px;"> <b>ID del paquete:</b> ${this.tlCargoId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Descripción:</b> ${pac.shortDesc
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Tracking ID:</b> ${pac.trackingId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Fecha de recepción:</b> ${new Date(
        pac.receptionDate
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Peso y Volumen:</b> ${pac.weight
      } pounds, <span style="font-size: 8pt;"> ${Number(
        +pac.weight / 2.2046
      ).toFixed(2)} Kgs. </span> / ${pac.volume
      } pies<sup>3</sup> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Enviado por:</b> ${pac.shipper.name
      } </td> </tr> <tr> <td style="text-align: center; font-size: 8pt; padding:10px;"> <hr> <p>Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br>${this.urlItem
      } </p> <hr> <p> Una vez que hayas confirmado la recepción y verificado que todo lo que has comprado esté correcto, por favor avísanos cuándo deseas que enviemos tus productos a Venezuela. Para ello, te pedimos que nos envíes un correo electrónico único con la lista de los números de recibo (TL-xxxx) y la confirmación de cuándo y en qué tipo de envío deseas que los despachemos. <br>Estamos aquí para ayudarte en todo el proceso. </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <br> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:30px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    await this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {
        this.openSnackbar("Customer notified Correctly!!");
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }

      if (actualiza) {
        pacToUpdate.notifiedTimes++;
        this.warehouseItemService
          .updateWarehouseItem(pacToUpdate)
          .subscribe((respAct: any) => {
            const packageRow = this.packageList.filter(
              (tlpackage) => tlpackage._id === pacToUpdate._id
            )[0];
            packageRow.notifiedTimes++;
          });
      }
    });
  }

  notifyCustomers(packageList: WarehouseItemFull[]) {
    Swal.fire({
      title: `Only in warehouse packages can be notified`,
      text: `Also the packages that have not been repacked or divided will be notified. Do you wish to continue?`,
      showDenyButton: true,
      confirmButtonText: "Yes!",
      denyButtonText: `No!`,
      width: "500px",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        packageList.forEach((c) => {
          if (c.status === '1') {
            this.sendNotificationMassive(c, true);
          }
        });
        this.selection.clear();
      }
    });

  }

  async sendNotificationOnCreate(
    pac: WarehouseItemFull,
    email: string,
    actualiza: boolean
  ) {
    this.tlCargoId = pac[0].tlCargoId;
    const pacToUpdate: WarehouseItem = new WarehouseItem(pac[0]);
    this.urlItem = `${this_url}/#/warehouse-item-receipt/${pac[0]._id}`;
    const mail: any = {};
    mail.from = "TlCargo system Notification Service";
    mail.to = email;

    if (adminNotification) mail.bcc = adminEmails;
    mail.subject = `Hemos recibido un paquete [${this.tlCargoId}] en tu casillero!`;

    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <br> <h2> Has recibido un paquete en tu casillero! </h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> <tr> <td style="background-color:#5DADE2; color: white;"> <h2 style="font-size: 14pt;">Hola ${pac[0].customer.name
      }</h2> <p style="font-size: 12pt;">¡Has recibido paquetes en tu casillero! </p> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 20px;"> <b>ID del paquete:</b> ${this.tlCargoId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Descripción:</b> ${pac[0].shortDesc
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Tracking ID:</b> ${pac[0].trackingId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Fecha de recepción:</b> ${new Date(
        pac[0].receptionDate
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Peso y Volumen:</b> ${pac[0].weight
      } pounds, <span style="font-size: 8pt;"> ${Number(
        +pac[0].weight / 2.2046
      ).toFixed(2)} Kgs. </span> / ${pac[0].volume
      } pies<sup>3</sup> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Enviado por:</b> ${pac[0].shipper.name
      } </td> </tr> <tr> <td style="text-align: center; font-size: 8pt; padding:10px;"> <hr> <p>Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br>${this.urlItem
      } </p> <hr> <p> Una vez que hayas confirmado la recepción y verificado que todo lo que has comprado esté correcto, por favor avísanos cuándo deseas que enviemos tus productos a Venezuela. Para ello, te pedimos que nos envíes un correo electrónico único con la lista de los números de recibo (TL-xxxx) y la confirmación de cuándo y en qué tipo de envío deseas que los despachemos. <br>Estamos aquí para ayudarte en todo el proceso. </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <br> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:30px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;

    await this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {
        this.openSnackbar("Customer notified Correctly!!");
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }

      if (actualiza) {
        pacToUpdate.notifiedTimes++;
        this.warehouseItemService
          .updateWarehouseItem(pacToUpdate)
          .subscribe((respAct: any) => {
            const packageRow = this.packageList.filter(
              (tlpackage) => tlpackage._id === pacToUpdate._id
            )[0];
            packageRow.notifiedTimes++;
          });
      }
    });
  }

  sendNotificationOnUpdate(
    pac: WarehouseItemFull,
    email: string,
    actualiza: boolean
  ) {
    const pacToUpdate: WarehouseItem = new WarehouseItem(pac);
    this.urlItem = `${this_url}/#/warehouse-item-receipt/${pac._id}`;
    const mail: any = {};
    mail.from = "TlCargo system Notification Service";
    mail.to = email;
    if (adminNotification) mail.bcc = adminEmails;
    mail.subject = `Algunos datos de tu paquete [${pac.tlCargoId}] han variado!`;
    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <br> <h2> ¡Hay información de tu paquete que cambio! </h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> <tr> <td style="background-color:#5DADE2; color: white;"> <h2 style="font-size: 14pt;">Hola ${pac.customer.name
      }</h2> <p style="font-size: 12pt;">Hay información de tu paquete que cambio, <br>acá te detallamos de nuevo la información. </p> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 20px;"> <b>ID del paquete:</b> ${this.tlCargoId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Descripción:</b> ${pac.shortDesc
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Tracking ID:</b> ${pac.trackingId
      } </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Fecha de recepción:</b> ${new Date(
        pac.receptionDate
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Peso y Volumen:</b> ${pac.weight
      } pounds, <span style="font-size: 8pt;"> ${Number(
        +pac.weight / 2.2046
      ).toFixed(2)} Kgs. </span> / ${pac.volume
      } pies<sup>3</sup> </td> </tr> <tr> <td style="text-align: justify; font-size: 10pt; padding-left:20px; padding-top: 10px;"> <b>Enviado por:</b> ${pac.shipper.name
      } </td> </tr> <tr> <td style="text-align: center; font-size: 8pt; padding:10px;"> <hr> <p>Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br>${this.urlItem
      } </p> <hr> <p> Una vez que hayas confirmado la recepción y verificado que todo lo que has comprado esté correcto, por favor avísanos cuándo deseas que enviemos tus productos a Venezuela. Para ello, te pedimos que nos envíes un correo electrónico único con la lista de los números de recibo (TL-xxxx) y la confirmación de cuándo y en qué tipo de envío deseas que los despachemos. <br>Estamos aquí para ayudarte en todo el proceso. </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <br> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:30px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {
        this.openSnackbar("Customer notified Correctly!!");
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }

      if (actualiza) {
        pacToUpdate.notifiedTimes++;
        this.warehouseItemService
          .updateWarehouseItem(pacToUpdate)
          .subscribe((respAct: any) => {
            const packageRow = this.packageList.filter(
              (tlpackage) => tlpackage._id === pacToUpdate._id
            )[0];
            packageRow.notifiedTimes++;
          });
      }
    });
  }

  createPac() {
    this.dialog
      .open(RegistryPackageCreateUpdateComponent, {
        height: "600px",
        width: "1024px"
      })
      .afterClosed()
      .subscribe((pac: WarehouseItemFull[]) => {
        if (pac) {
          this.spinner.show("pckSpinner");

          for (const pacElement of pac) {
            const fecha = new Date();
            pacElement.receptionDate = fecha.toDateString();
            let email;
            this.warehouseItemService
              .getWarehouseItemFullById(pacElement._id.toString())
              .subscribe((wiResp) => {
                if (pac[0].notification.toString() === "true") {
                  email = wiResp.data[0].customer.email;
                  this.sendNotificationOnCreate(wiResp.data, email, false);
                }

                this.packageList.push(wiResp.data[0]);
                this.dataSource.data = this.packageList;
                this.cd.detectChanges();
                this.openQRStick(wiResp.data[0]);
                this.spinner.hide("pckSpinner");
              });
          }
        }
      });
  }

  createRePack(packageList: WarehouseItemFull[]) {


    let notTheSame = false;
    let notInWh = false;
    let oneCustomer = packageList[0].customer;
    for (let i = 0; i < packageList.length; i++) {
      if (oneCustomer._id !== packageList[i].customer._id) {
        notTheSame = true;
      }
      if (packageList[i].status !== "1") {
        notInWh = true;
      }
    }

    if (!notTheSame && !notInWh) {
      this.dialog
        .open(RepackingRegistryComponent, {
          data: packageList,
          height: "600px",
          width: "1024px",
        })
        .afterClosed()
        .subscribe((pac: any) => {
          if (pac) {
            this.spinner.show("pckSpinner");
            this.packageList.push(pac.data);
            pac.paqs.forEach((row) => {
              this.packageList.filter((paq) => paq._id === row._id)[0].status =
                "2";
            });
            this.dataSource.data = this.packageList;
            this.cd.detectChanges();
            this.openQRStick(pac.data);
            this.selection.clear();
            this.spinner.hide("pckSpinner");
          }
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: `You can't repackage these packages !!`,
        text: `To repackage it is necessary that all packages are from the same customer, and the status is equal to IN WAREHOUSE!`,
        confirmButtonText: "OK",
        width: "500px",
        heightAuto: false,
      });
      this.selection.clear();
    }
  }

  updatePac(pac: WarehouseItemFull) {
    this.router.navigate(['/app/warehouse-list/package-registry/' + pac._id]);
  }

  deleteQuotes(paq: WarehouseItemFull) {

    this.guideService.getGuides(0, 0, `&packageList=${paq._id}`, true).subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          if (resp.data.length > 0) {
            let guideIds = [];
            resp.data.forEach(
              (guide) => {
                guideIds.push(guide._id);
                this.guideService.deleteGuide(guide).subscribe(
                  (respDelete: ServiceResponse) => {
                    if (!respDelete.ok) {
                      this.openSnackbar(respDelete.msg);
                    }
                  }
                );
              }
            );


            this.quoteService.getQuotes(0, 0, `&preGuideList=${guideIds.join(',')}`).subscribe(
              (respQuotes: ServiceResponse) => {
                if (respQuotes.ok) {
                  if (respQuotes.data.length > 0) {
                    respQuotes.data.forEach(quote => {
                      this.quoteService.deleteQuote(quote).subscribe(
                        (respDeleteQuote: ServiceResponse) => {
                          if (!respDeleteQuote.ok) {
                            this.openSnackbar(respDeleteQuote.msg);
                          }
                        }
                      );

                    });
                  }
                }
              }
            );

            Swal.fire({
              icon: "info",
              title: "Oops...",
              text: "The packages have associated quotes, all will be deleted!",
            });
          }
        }
      });
  }

  deletePac(pac: WarehouseItemFull) {
    if (+pac.status === 1) {
      if (pac.type === 2) {
        Swal.fire({
          title: `This is a repackaged package, do you want to keep the previous packages?`,
          text: `If you select NO, the packages will be eliminated!, if you select YES, the packages will be disassociated from the repackaged package and will remain in the warehouse!`,
          showDenyButton: true,
          confirmButtonText: "Yes!",
          denyButtonText: `No!`,
          width: "500px",
          heightAuto: false,
        }).then((result) => {
          if (result.isConfirmed) {
            const filterOptions = {
              multiple: false,
              autoComplete: false,
            };

            this.warehouseItemService
              .getWarehouseItemsFull(
                0,
                5,
                `&rePackage=${pac._id}`,
                filterOptions
              )
              .subscribe((resp: ServiceResponse) => {
                if (resp.ok) {
                  const tlPackages = resp.data;
                  const cantPackages = tlPackages.length;

                  for (let i = 0; i < tlPackages.length; i++) {
                    tlPackages[i].rePackage = "";
                    tlPackages[i].status = '1';
                    if (i === tlPackages.length - 1) {
                      this.warehouseItemService
                        .updateWarehouseItem(tlPackages[i])
                        .subscribe((respUpdate: ServiceResponse) => {
                          if (respUpdate.ok) {
                            this.warehouseItemService
                              .deleteWarehouseItem(pac)
                              .subscribe(
                                (respDelete: ServiceResponse) => {
                                  filterOptions.autoComplete = true;
                                  filterOptions.multiple = true;
                                  this.getTableData$(
                                    this.paginator.pageIndex,
                                    this.paginator.pageSize,
                                    this.filter,
                                    false,
                                    filterOptions
                                  ).subscribe((respTable: ServiceResponse) => {
                                    this.totalData = respTable.total;
                                    this.packageList = respTable.data;
                                    this.dataSource.data = this.packageList;
                                  });
                                  this.selection.clear();
                                  this.openSnackbar(respDelete.msg);
                                },
                                (error) => this.openSnackbar(error.error.msg)
                              );
                          } else {
                            this.openSnackbar(respUpdate.msg);
                          }
                        });
                    } else {
                      this.warehouseItemService
                        .updateWarehouseItem(tlPackages[i])
                        .subscribe((respUpdate: ServiceResponse) => {
                          if (!respUpdate.ok) {
                            this.openSnackbar(respUpdate.msg);
                          }
                        });
                    }
                  }
                } else {
                  this.openSnackbar(resp.msg);
                }
              });
          } else {
            const filterOptions = {
              multiple: false,
              autoComplete: false,
            };

            this.warehouseItemService
              .getWarehouseItemsFull(
                0,
                5,
                `&rePackage=${pac._id}`,
                filterOptions
              )
              .subscribe((resp: ServiceResponse) => {
                if (resp.ok) {
                  const tlPackages = resp.data;
                  const cantPackages = tlPackages.length;

                  for (let i = 0; i < tlPackages.length; i++) {
                    this.warehouseItemService.deleteWarehouseItem(tlPackages[i]).subscribe(
                      (respDelete: ServiceResponse) => {
                        if (i === tlPackages.length - 1) {
                          this.warehouseItemService
                            .deleteWarehouseItem(pac)
                            .subscribe(
                              (respDelete: ServiceResponse) => {
                                filterOptions.autoComplete = true;
                                filterOptions.multiple = true;

                                this.getTableData$(
                                  this.paginator.pageIndex,
                                  this.paginator.pageSize,
                                  this.filter,
                                  false,
                                  filterOptions
                                ).subscribe((respTable: ServiceResponse) => {
                                  this.totalData = respTable.total;
                                  this.packageList = respTable.data;
                                  this.dataSource.data = this.packageList;
                                });
                                this.selection.clear();
                                this.openSnackbar(respDelete.msg);
                              },
                              (error) => this.openSnackbar(error.error.msg)
                            );
                        }
                      },
                      (error) => this.openSnackbar(error.error.msg)
                    );
                  }
                } else {
                  this.openSnackbar(resp.msg);
                }
              });
          }

        });
      } else {
        this.warehouseItemService.deleteWarehouseItem(pac).subscribe(
          (resp: ServiceResponse) => {
            const filterOptions = {
              multiple: true,
              autoComplete: true,
            };

            this.getTableData$(
              this.paginator.pageIndex,
              this.paginator.pageSize,
              this.filter,
              false,
              filterOptions
            ).subscribe((respTable: ServiceResponse) => {
              this.totalData = respTable.total;
              this.packageList = respTable.data;
              this.dataSource.data = this.packageList;
            });
            this.selection.clear();
            this.openSnackbar(resp.msg);
          },
          (error) => this.openSnackbar(error.error.msg)
        );
      }
      this.deleteQuotes(pac);

    } else {
      const packageId = `${pac.type === 2 ? "RP-" : "TL-"} ${pac._id
        .toString()
        .substring(0, 5)}${pac._id
          .toString()
          .substring(pac._id.toString().toString().length - 5)}`;
      this.openSnackbar(
        `This package (${packageId}) is in process or associated with a repack, it cannot be removed`
      );
    }
  }

  deletePacs(packageList: WarehouseItemFull[]) {
    packageList.forEach((c) => this.deletePac(c));
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }

    this.spinner.show("pckSpinner");

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    value = value.trim();
    value = value.toLowerCase();

    if (value === "") {
      if (this.dateSearch) {
        if (this.sinceDateCtrl.value && this.untilDateCtrl.value) {
          this.filter = `&sincePackageDate=${this.sinceDateCtrl.value}&untilPackageDate=${this.untilDateCtrl.value}`;
        } else {
          this.openSnackbar("Please select a date range");
        }

      } else {
        this.searchCtrl.setValue("");
        this.filter = "";
      }
    } else {
      for (const whFilter of warehouseFilters) {
        this.filter += `&${whFilter}=${value}`;
      }
    }

    this.getTableData$(
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.filter,
      false,
      filterOptions
    ).subscribe((resp: ServiceResponse) => {
      this.totalData = resp.total;
      this.packageList = resp.data;
      this.dataSource.data = this.packageList;
      this.spinner.hide("pckSpinner");
    });
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  onLabelChange(change: MatSelectChange, row: WarehouseItemFull) {
    const index = this.dataSource.data.findIndex((c) => c === row);
    this.packageList[index].labels = change.value;
    const packageToUpdate: WarehouseItem = new WarehouseItem(
      this.packageList[index]
    );
    this.warehouseItemService.updateWarehouseItem(packageToUpdate).subscribe(
      (resp: any) => { },
      (error) => this.openSnackbar(error.error.msg)
    );
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  onStatusChange(change: MatSelectChange, row: WarehouseItemFull) {
    if (+row.status < 4) {
      const index = this.dataSource.data.findIndex((c) => c === row);
      this.packageList[index].status = change.value.id;
      const warehouseToUpdate = new WarehouseItem(this.packageList[index]);
      this.warehouseItemService
        .updateWarehouseItem(warehouseToUpdate)
        .subscribe(
          (resp: any) => { },
          (error) => this.openSnackbar(error.error.msg)
        );
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot change the status of the package once it becomes status IN TRANSIT",
      });
    }
  }
}

function observableOf(arg0: null): any {
  throw new Error("Function not implemented.");
}
