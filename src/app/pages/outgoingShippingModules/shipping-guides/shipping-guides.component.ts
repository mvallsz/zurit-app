import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { TableColumn } from "../../../../@vex/interfaces/table-column.interface";
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSelectChange } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";

import { fadeInUp400ms } from "../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../@vex/animations/stagger.animation";

import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icFolder from "@iconify/icons-ic/twotone-folder";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icBoxi from "@iconify/icons-ic/twotone-inbox";
import icBoxo from "@iconify/icons-ic/twotone-outbox";
import icCheck from "@iconify/icons-ic/twotone-checklist";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import icPrint from "@iconify/icons-ic/twotone-print";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import icMoney from "@iconify/icons-ic/monetization-on";
import icAlarm from "@iconify/icons-ic/twotone-alarm-on";

import {
  guidesLabels,
  guideStatus,
  paymentGuideStatus,
} from "../../../../static-data/tlcargo-static-data";

import { GuidesEntPop } from "./interfaces/guides-ent-pop.model";
import { GuidesEnt } from "./interfaces/guides-ent.model";
import { ServiceResponse } from "../../../interfaces/service-response.interface";
import { PaymentBitacoraInterface } from "../../../interfaces/payment-bitacora-data-table.interface";

import { GuidesService } from "../../../services/guides.service";
import { WarehouseItemService } from "../../../services/warehouse-item.service";
import { MailService } from "../../../services/mail.service";
import { NgxSpinnerService } from "ngx-spinner";

import { PickingListWarehouseComponent } from "./picking-list-warehouse/picking-list-warehouse.component";
import { GuideInvoiceComponent } from "../../utility/guide-invoice/guide-invoice.component";
import { GuidePickListComponent } from "../../utility/guide-pick-list/guide-pick-list.component";
import { PaymentRecordCreateUpdateComponent } from "../../accountingModules/guides-invoices/payment-record-create-update/payment-record-create-update.component";
import { GuidesCreateUpdateComponent } from "./guides-create-update/guides-create-update.component";

import Swal from "sweetalert2";
import { environment } from "../../../../environments/environment";
import { TlCargoIdPipe } from "../../../pipes/tl-cargo-id/tl-cargo-id.pipe";
import { WarehouseItemFull } from "../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { QrGeneratorComponent } from "../../warehousingModules/warehouse-inventory/qr-generator/qr-generator.component";
import { GuideQrGeneratorComponent } from "./guide-qr-generator/guide-qr-generator.component";
import icQR from "@iconify/icons-ic/baseline-qr-code";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import * as XLSX from "xlsx";
import { GuidesEntExport } from "./interfaces/guides-ent-export.model";
import { AddressService } from "src/app/services/address.service";
import { Route, Router } from "@angular/router";

const this_url = environment.this_url;
const guideFilters = environment.guide_filters;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@UntilDestroy()
@Component({
  selector: "vex-shipping-guides",
  templateUrl: "./shipping-guides.component.html",
  styleUrls: ["./shipping-guides.component.scss"],
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
export class ShippingGuidesComponent implements OnInit, AfterViewInit {
  layoutCtrl = new FormControl("boxed");
  urlItem = "";
  urlItem2 = "";
  guides: GuidesEntPop[];

  @Input()
  columns: TableColumn<GuidesEntPop>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "Actions", property: "actions", type: "button", visible: true },
    {
      label: "OutGoing Shipment",
      property: "shipping",
      type: "text",
      visible: false,
    },
    { label: "Guide Id", property: "tlCargoId", type: "text", visible: true },
    { label: "Status", property: "status", type: "button", visible: true },
    {
      label: "Payment Status",
      property: "paymentStatus",
      type: "button",
      visible: true,
    },
    {
      label: "Package Q'",
      property: "packageList",
      type: "button",
      visible: true,
    },
    { label: "Weight", property: "finalWeight", type: "text", visible: true },
    { label: "Volume", property: "finalVolume", type: "text", visible: true },
    { label: "Customer", property: "customer", type: "text", visible: true },
    { label: "Creation Date", property: "creationDate", type: "text", visible: false },
    { label: "Created By", property: "user", type: "text", visible: true },
  ];

  status = guideStatus;
  statusToShow = guideStatus;
  paymentGuideStatus = paymentGuideStatus;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  totalData = 0;

  dataSource: MatTableDataSource<GuidesEntPop> | null;
  selection = new SelectionModel<GuidesEntPop>(true, []);
  searchCtrl = new FormControl();

  labels = guidesLabels;

  type: 'guide' | 'quote' = 'guide';

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
  icBoxo = icBoxo;
  icBoxi = icBoxi;
  icCheck = icCheck;
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icList = icListAlt;
  icMoney = icMoney;
  icAlarm = icAlarm;
  icQR = icQR;

  filterValues = {
    customerName: "",
    guideName: "",
    guideStatus: "",
  };

  public spinnerDown = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  packageList: any;

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

  public dateSearch = false;
  public dateColor = 'primary';

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private mailService: MailService,
    private guidesService: GuidesService,
    private addressService: AddressService,
    private warehouseItemService: WarehouseItemService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.spinner.show("guideSpinner");
    this.dataSource = new MatTableDataSource();
  }

  getTableData$(
    pageNumber: Number,
    pageSize: Number,
    filter: string,
    spinner: boolean,
    filterOptions: any
  ) {
    if (filter) this.spinner.show("guideSpinner");
    return this.guidesService.getGuidesPag(
      pageNumber,
      pageSize,
      filter,
      filterOptions,
      (this.type === 'quote')
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
          if (tlData == null) return [];
          this.totalData = tlData.total;
          return tlData.data;
        })
      )
      .subscribe((tlData) => {
        this.spinner.hide("guideSpinner");
        this.guides = tlData;
        this.dataSource = new MatTableDataSource(this.guides);
        this.sort.sort({ id: "creationDate", start: "desc" } as MatSortable);
        this.dataSource.sort = this.sort;
      });
  }

  name = `TLCargo_guides${Date.now().toPrecision()}.xlsx`;

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;
    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let itemsToExport: GuidesEntExport[];
        itemsToExport = new Array();
        if (resp.data.length > 0) {
          for (let i = 0; i < resp.data.length; i++) {
            this.addressService
              .getAddressByType(resp.data[i].customer._id.toString(), "1")
              .subscribe((respA1: ServiceResponse) => {
                if (respA1.data.length === 0) {
                  this.addressService
                    .getAddressByType(resp.data[i].customer._id.toString(), "0")
                    .subscribe((respA0: ServiceResponse) => {
                      resp.data[i].deliveryAddress = respA0.data[0];
                      itemsToExport.push(new GuidesEntExport(resp.data[i]));
                      const worksheet: XLSX.WorkSheet =
                        XLSX.utils.json_to_sheet(
                          JSON.parse(JSON.stringify(itemsToExport))
                        );
                      if (i === resp.data.length - 1) {
                        const book: XLSX.WorkBook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(book, worksheet, "Sheet1");
                        XLSX.writeFile(book, this.name);
                        this.spinnerDown = false;
                      }
                    });
                } else {
                  resp.data[i].deliveryAddress = respA1.data[0];
                  itemsToExport.push(new GuidesEntExport(resp.data[i]));
                  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
                    JSON.parse(JSON.stringify(itemsToExport))
                  );

                  if (i === resp.data.length - 1) {
                    const book: XLSX.WorkBook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(book, worksheet, "Sheet1");
                    XLSX.writeFile(book, this.name);
                    this.spinnerDown = false;
                  }
                }
              });
          }
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

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  selectPaymentStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.paymentGuideStatus.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  showPicList(list: any) {
    this.dialog
      .open(PickingListWarehouseComponent, {
        height: "500px",
        data: list,
      })
      .afterClosed()
      .subscribe(() => { });
  }

  sendNotification(guide: GuidesEntPop, actualiza: boolean) {
    const guidetoUpdate: GuidesEnt = new GuidesEnt(guide);

    this.urlItem = `${this_url}/#/guide-receipt/${guide._id}`;
    this.urlItem2 = `${this_url}/#/guide-package-list/${guide._id}`;

    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = guide.customer.email;
    if (adminNotification) mail.bcc = adminEmails;

    mail.subject = `La guía ${guide.tlCargoId} ya está lista para salir!`;
    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }.datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> <h2>Tu envio con TLCargo ya está listo para salir!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <h2>Hola ${guide.customer.name
      }!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt;"> Gracias por utilizar nuestro servicio de envíos. </p> <p style="text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px;"> Nuestro objetivo es que siempre estés satisfecho, para poder cumplir con esto, es imprescindible que todos tus envíos estén Pre-Pagados; para tu comodidad puedes hacer pagos en Dólares, o en Bolívares (Al cambio del día) y enviarnos el comprobante a PAGOS@TLCARGO.NET el comprobante. </p> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> <tr> <td style="text-align: center; padding-left: 15px; padding-right: 15px;"> <div style="background: #59ace4; border-radius: 20px; color: white;padding: 15px;"> <h2 style="font-size: 16pt"> Costo total de la guia: </h2> <h3 style="font-size: 18pt"> ${guide.cost.toLocaleString(
        "en",
        { style: "currency", currency: "USD" }
      )} </h3> </div> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>Fecha estimada de salida de nuestro Warehouse en Miami:</b> ${new Date(
        guide.shipping.departureDate
      ).toLocaleDateString(
        "ve-ES"
      )} </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>Fecha estimada de llegada a nuestro Warehouse en Caracas:</b> ${new Date(
        guide.shipping.arrivalDate
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} <br> <br> <hr> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <p> Para revisar los paquetes asociados a la guía haz click en el siguiente enlace:<br/>${this.urlItem2
      } </p> <p> Descarga el invoice acá:<br/>${this.urlItem
      }</p> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <p > <hr> <h1 style="text-align: center; font-size: 12pt;" > Te recordamos que estas son las únicas cuentas autorizadas de TLCARGO </h1> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga</li> <li><b>Numero de Cuenta:</b> 0172 0110 7111 0844 6517</li> <li><b>Titular:</b> Francy Wadskier</li> <li><b>C.I.:</b> V-18857206</li> </ul> <h2 style="font-size: 10pt;"> Para Pago Movil en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga (0172)</li> <li><b>Telefono:</b> 0424-1521758</li> <li><b>C.I.:</b> V-18857206</li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Si no has realizado el pago al momento de recibir este correo electrónico, por favor comunícate con nuestro servicio de atención al cliente para verificar la tasa de cambio. </b> </span> <br> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Dólares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>Cuenta:</b> Cheque</li> <li><b>Numero de Cuenta:</b> 9149573200</li> <li><b>Titular:</b> TL CARGO</li> <li><b>ABA:</b> 266086554</li> <li><b>SWIFT:</b> CITIUS33MIA</li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante ZELLE </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>ZELLE:</b> ZELLE@TLCARGO.NET</li> <li><b>Nombre:</b> (Teleflex Group Inc o Alvaro Abreu)</li> <li><b>Por favor colocar numero de Invoice en memo</b></li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante PAYPAL </h2> <ul style="font-size: 8pt;"> <li><b>Email:</b> paypal@TLCargo.net</li> <li><b>Verificar si su cuenta cobra un Fee por pagar debe agregarlo para que llegue el pago completo</b></li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Los pagos recibidos a través de transferencias (Wire) de otros bancos americanos tendrán un cargo extra de $15.00, esto no aplica para Zelle. </b> </span> </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:15px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {
        this.openSnackbar("Customer notified Correctly!!");
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }

      if (actualiza) {
        guidetoUpdate.notifiedTimes++;
        guidetoUpdate.notification = true;
        this.guidesService
          .updateGuide(guidetoUpdate)
          .subscribe((respAct: any) => {
            this.guides.filter((guide) => guide._id === guidetoUpdate._id)[0] =
              guide;
          });
      }
    });
  }

  createGuide() {
    this.router.navigate(['/app/guides/register/guide/0']);
    // this.dialog
    //   .open(GuidesCreateUpdateComponent, {
    //     height: "500px",
    //     width: "1024px",
    //     data: { type: "guide", guide: null },
    //     disableClose: true
    //   })
    //   .afterClosed()
    //   .subscribe((guide: GuidesEntPop) => {
    //     if (guide) {
    //       this.spinner.show();
    //       this.guides.push(guide);
    //       this.dataSource.data = this.guides;
    //       if (guide.notification) {
    //         this.sendNotification(guide, true);
    //       }
    //       this.openQRStick(guide);
    //     }
    //   });

  }

  updateGuide(guide: GuidesEntPop) {
    this.router.navigate(['/app/guides/register/guide/' + guide._id]);
    // this.dialog
    //   .open(GuidesCreateUpdateComponent, {
    //     data: { type: "guide", guide },
    //     height: "500px",
    //     width: "1024px",
    //     disableClose: true
    //   })
    //   .afterClosed()
    //   .subscribe((updatedGuide) => {
    //     if (updatedGuide) {
    //       this.guides[
    //         this.guides.findIndex((existingGuide) => existingGuide._id === updatedGuide._id)
    //       ] = updatedGuide;
    //       this.dataSource.data = this.guides;
    //       if (updatedGuide.notification.toString() === "true") {
    //         this.sendNotification(updatedGuide, true);
    //         this.openQRStick(updatedGuide);
    //       }
    //     }
    //   });
  }

  deleteGuide(guide: GuidesEntPop) {
    if (guide.status === "1" || guide.status === "3") {
      this.guidesService.deleteGuide(guide).subscribe(
        (resp: any) => {
          this.guides.splice(
            this.guides.findIndex(
              (existingGuide) => existingGuide._id === guide._id
            ),
            1
          );
          this.selection.deselect(guide);
          this.dataSource.data = this.guides;
          this.openSnackbar(resp.msg);
        },
        (error) => this.openSnackbar(error.error.msg)
      );
    } else {
      this.openSnackbar(
        `This guide (${guide.tlCargoId}) is in transit, it cannot be removed`
      );
    }
  }

  deleteGuides(guides: GuidesEntPop[]) {
    guides.forEach((c) => this.deleteGuide(c));
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }

    this.spinner.show("guideSpinner");

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    value = value.trim();
    value = value.toLowerCase();

    if (value === "") {
      if (this.dateSearch) {
        if (this.sinceDateCtrl.value && this.untilDateCtrl.value) {
          this.filter = `&sinceGuideDate=${this.sinceDateCtrl.value}&untilGuideDate=${this.untilDateCtrl.value}`;
        } else {
          this.openSnackbar("Please select a date range");
        }

      } else {
        this.searchCtrl.setValue("");
        this.filter = "";
      }
    } else {
      this.filter = "";
      for (const guideFilter of guideFilters) {
        this.filter += `&${guideFilter}=${value}`;
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
      this.guides = resp.data;
      this.dataSource.data = this.guides;
      this.spinner.hide("guideSpinner");
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

  onStatusChange(change: MatSelectChange, row: GuidesEntPop) {
    let canChangeStatus = true;
    if (+change.value.id >= 4 && +row.shipping.status === 1) {
      canChangeStatus = false;
    }
    if (canChangeStatus) {
      if (+row.status <= 4 && +change.value.id < 4) {
        const index = this.dataSource.data.findIndex((c) => c === row);
        if (canChangeStatus) {
          this.guides[index].status = change.value.id;
          const guideToUpdate = new GuidesEnt(this.guides[index]);
          this.guidesService.updateGuide(guideToUpdate).subscribe(
            (resp: any) => { },
            (error) => this.openSnackbar(error.error.msg)
          );
        } else {
          this.guides[index].status = row.status;
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "You cannot change the status of the guide if the packages are not processed by the warehouse",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            "You cannot change the status to " +
            this.status.filter((status) => status.id === change.value.id)[0]
              .text +
            " once it becomes status IN TRANSIT",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          "You cannot change the status to " +
          this.status.filter((status) => status.id === change.value.id)[0]
            .text +
          " if the shipment status is IN PROCESS",
      });
    }
  }

  onPayStatusChange(change: MatSelectChange, row: GuidesEntPop) {
    let canChangeStatus = false;
    const index = this.dataSource.data.findIndex((c) => c === row);
    if (change.value.id === "1") {
      this.guides[index].paidAmount = 0;
      const guideStatusItem: PaymentBitacoraInterface = {
        paymentStatus: change.value.id,
        paymentType: "Payment Status Change",
        paidAmount: 0,
        discount: 0,
        user: "",
        paymentDate: new Date().toJSON(),
      };
      this.guides[index].paymentBitacora.unshift(guideStatusItem);
      canChangeStatus = true;
    }

    if (change.value.id === "4") {
      this.guides[index].paidAmount = this.guides[index].cost;
      const guideStatusItem: PaymentBitacoraInterface = {
        paymentStatus: change.value.id,
        paymentType: "PRE",
        paidAmount: this.guides[index].cost,
        discount: 0,
        user: "",
        paymentDate: new Date().toJSON(),
      };
      this.guides[index].paymentBitacora.unshift(guideStatusItem);
      canChangeStatus = true;
    }

    if (canChangeStatus) {
      this.guides[index].paymentStatus = change.value.id;
      const guideToUpdate = new GuidesEnt(this.guides[index]);
      this.guidesService.updateGuide(guideToUpdate).subscribe(
        (resp: any) => { },
        (error) => this.openSnackbar(error.error.msg)
      );
    } else {
      this.guides[index].paymentStatus = row.paymentStatus;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot change the Payment status of the guide from here, you need to registry the payment",
      });
    }
  }

  openInvoice(guide: GuidesEntPop) {
    this.dialog.open(GuideInvoiceComponent, {
      data: { guide, tlpackage: null },
      height: "800px",
      width: "1024px",
    });
  }

  openQRStick(guide: GuidesEntPop) {
    const piezas = new Array(guide.packageList.length);
    for (let i = 0; i < guide.packageList.length; i++) {
      piezas[i] = i + 1;
    }
    this.dialog.open(GuideQrGeneratorComponent, {
      data: {
        guide,
        piezas,
      },
      height: "600px",
      width: "700px",
    });
  }

  openPickList(guide: GuidesEntPop) {
    this.dialog.open(GuidePickListComponent, {
      data: guide,
      height: "800px",
      width: "1024px",
    });
  }

  checkOut(guide: GuidesEntPop) {
    this.dialog
      .open(PaymentRecordCreateUpdateComponent, {
        data: guide,
        width: "512px",
      })
      .afterClosed()
      .subscribe((updatedGuide) => {
        if (updatedGuide) {
          this.guides.filter((guide) => guide._id === updatedGuide._id)[0] =
            updatedGuide;
        }
      });
  }
}
function observableOf(arg0: null): any {
  throw new Error("Function not implemented.");
}
