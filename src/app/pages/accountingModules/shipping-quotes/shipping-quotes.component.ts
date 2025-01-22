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
import { UntilDestroy } from "@ngneat/until-destroy";
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
  quoteStatus,
} from "../../../../static-data/tlcargo-static-data";

import { GuidesEntPop } from "./interfaces/guides-ent-pop.model";
import { GuidesEnt } from "./interfaces/guides-ent.model";
import { ServiceResponse } from "../../../interfaces/service-response.interface";

import { GuidesService } from "../../../services/guides.service";
import { MailService } from "../../../services/mail.service";
import { NgxSpinnerService } from "ngx-spinner";

import { PickingListWarehouseComponent } from "./picking-list-warehouse/picking-list-warehouse.component";
import { GuideInvoiceComponent } from "../../utility/guide-invoice/guide-invoice.component";
import { GuidePickListComponent } from "../../utility/guide-pick-list/guide-pick-list.component";

import Swal from "sweetalert2";
import { environment } from "../../../../environments/environment";
import { QuotesQrGeneratorComponent } from "./quotes-qr-generator/quotes-qr-generator.component";
import icQR from "@iconify/icons-ic/baseline-qr-code";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import * as XLSX from "xlsx";
import { GuidesEntExport } from "./interfaces/guides-ent-export.model";
import { AddressService } from "src/app/services/address.service";
import { ShippingService } from "src/app/services/shipping.service";
import { ShippingEnt } from "../../outgoingShippingModules/shipping-registry/interfaces/shipping.model";
import { AssignToShippingComponent } from "./assign-to-shipping/assign-to-shipping.component";
import { Router } from "@angular/router";
import { Quote } from "./interfaces/quote-containers.model";
import { QuotesService } from "src/app/services/quotes.service";
import { WarehouseItemFull } from "../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { QueryValueType } from "@angular/compiler/src/core";

const this_url = environment.this_url;
const guideFilters = environment.guide_filters;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@UntilDestroy()
@Component({
  selector: "vex-shipping-quotes",
  templateUrl: "./shipping-quotes.component.html",
  styleUrls: ["./shipping-quotes.component.scss"],
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
export class ShippingQuotesComponent implements OnInit, AfterViewInit {

  type: "guide" | "quote" = "quote";
  layoutCtrl = new FormControl("boxed");
  urlItem = "";
  urlItem2 = "";
  urlItem3 = "";
  quotes: Quote[];

  @Input()
  columns: TableColumn<Quote>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "Actions", property: "actions", type: "button", visible: true },
    { label: "Quote Id", property: "tlCargoId", type: "text", visible: true },
    { label: "Status", property: "status", type: "button", visible: true },
    {
      label: "Package Q'",
      property: "preGuideList",
      type: "button",
      visible: true,
    },
    { label: "Weight", property: "finalWeight", type: "text", visible: true },
    { label: "Volume", property: "finalVolume", type: "text", visible: true },
    { label: "Customer", property: "customer", type: "text", visible: true },
    { label: "Creation Date", property: "creationDate", type: "text", visible: false },
    { label: "Created By", property: "user", type: "text", visible: false },
  ];

  status = quoteStatus;
  statusToShow = quoteStatus;
  paymentGuideStatus = paymentGuideStatus;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";
  totalData = 0;

  dataSource: MatTableDataSource<Quote> | null;
  selection = new SelectionModel<Quote>(true, []);
  searchCtrl = new FormControl();

  labels = guidesLabels;

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

  public spinnerDown = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

  public dateSearch = false;
  public dateColor = 'primary';

  public shippingsAvailable: ShippingEnt[] = [];
  public preGuides: GuidesEntPop[] = [];
  public packageList: WarehouseItemFull[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private router: Router,
    private mailService: MailService,
    private guidesService: GuidesService,
    private quoteService: QuotesService,
    private addressService: AddressService,
    private shippingService: ShippingService,
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
    this.shippingService.getShipsByStatus('1').subscribe((resp: ServiceResponse) => {
      this.shippingsAvailable = resp.data;
    });
  }

  getTableData$(
    pageNumber: Number,
    pageSize: Number,
    filter: string,
    spinner: boolean,
    filterOptions: any,
  ) {
    if (filter) this.spinner.show("guideSpinner");
    return this.quoteService.getQuotesPag(
      pageNumber,
      pageSize,
      filter,
      filterOptions,
      (this.type === 'quote')
    );
  }

  dataLoad() {
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
            (this.type === 'quote'),
            filterOptions
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((tlData: ServiceResponse) => {
          if (tlData == null) return [];
          this.totalData = tlData.total;
          tlData.data.forEach((quote) => {
            quote.finalVolume = quote.preGuideList[0].finalVolume;
            quote.finalWeight = quote.preGuideList[0].finalWeight;
          });
          return tlData.data;
        })
      )
      .subscribe((tlData) => {
        this.spinner.hide("guideSpinner");
        this.quotes = tlData;
        this.dataSource = new MatTableDataSource(this.quotes);
        this.sort.sort({ id: "creationDate", start: "desc" } as MatSortable);
        this.dataSource.sort = this.sort;
      });
  }

  ngAfterViewInit() {
    this.dataLoad();
  }

  name = `TLCargo_quotes${Date.now().toPrecision()}.xlsx`;

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

  sendNotification(guide: GuidesEntPop, actualiza: boolean, quote: Quote) {
    const guidetoUpdate: GuidesEnt = new GuidesEnt(guide);

    this.urlItem = `${this_url}/#/guide-receipt/${guide._id}`;
    this.urlItem2 = `${this_url}/#/guide-package-list/${guide._id}`;
    this.urlItem3 = `${this_url}/#/active-quote/${quote._id}/${guide._id}`;

    const type = guide.name.includes("AIR") ? "AIR" : "SEA";

    const mail: any = {};
    if (adminNotification) {
      mail.bcc = adminEmails;
    }
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = guide.customer.email;
    mail.subject = `Acá tienes la cotización ${type === 'AIR' ? 'Aerea' : 'Marítima'} para el envio de tus paquetes!`;
    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en">
        <head>
          <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi">
          <title>Sistema de notificación de TLCARGO </title>
          <meta property="og:title" content="Email template">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style type="text/css">
            .datagrid table { border-collapse: collapse; text-align: left; width: 100%; }
            .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }
            .datagrid table td, .datagrid table th { padding: 3px 10px; }
            .datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; }
            .datagrid table thead th:first-child { border: none; }
            .datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }
            .datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }
            .datagrid table tbody td:first-child { border-left: none; }
            .datagrid table tbody tr:last-child td { border-bottom: none; }
            a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; }
            h1 { font-size: 56px; }
            h2{ font-size: 28px; font-weight: 900; }
            p { font-weight: 100; }
            td { vertical-align: top; }
            #email { margin: auto; width: 600px; background-color: white; }
            button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; }
            .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; }
          </style>
        </head>
        <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word">
        <! View in Browser Link -->
          <div id="email">
            <table align="right" role="presentation">
              <tr>
                <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> -->
                </td>
              <tr>
            </table>
            <! Banner -->
            <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
              <tr>
                <td bgcolor="white" align="center" style="color: black;">
                  <br>
                  <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle">
                  <h2>Hemos generado una cotización para ti!</h2>
                </td>
              </tr>
              <tr>
                <td bgcolor="#85C1E9" align="center" style="color: white;">
                  <h2>Hola ${quote.customer.name}!</h2>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="text-align: center; font-size: 14pt;">
                    Gracias por utilizar nuestro servicio de envíos.
                  </p>
                  <p style="text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px;">
                    Nuestro objetivo es que siempre estés satisfecho, para poder cumplir con esto,
                    es imprescindible que todos tus envíos estén Pre-Pagados;
                    para tu comodidad puedes hacer pagos en Dólares, o en Bolívares (Al cambio del día)
                    y enviarnos el comprobante a PAGOS@TLCARGO.NET el comprobante.
                  </p>
                </td>
              </tr>
            </table>
            <! First Row -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%">
              <tr>
                <td style="text-align: center; padding-left: 15px; padding-right: 15px;">
                  <div style="background: #59ace4; border-radius: 20px; color: white;padding: 15px;">
                    <h1 style="font-size: 36pt"> Tipo de Cotización: ${type === 'AIR' ? 'Aereo' : 'Marítimo'}</h1>
                    <h2 style="font-size: 16pt"> Costo total de la cotización: </h2>
                    <h3 style="font-size: 24pt">
                      ${guide.cost.toLocaleString("en", { style: "currency", currency: "USD" })}
                    </h3>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; font-size: 10pt; padding-left: 30px; padding-right: 30px;">
                  <p> Para revisar los paquetes asociados a la guía haz click en el siguiente enlace:<br/>
                    ${this.urlItem2}
                  </p>
                  <p> Descarga la cotización acá:
                    <br/>
                    ${this.urlItem}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; font-size: 12pt; padding-left: 30px; padding-right: 30px;">
                  <div style="text-align: center; font-size: large; padding: 20px">
                    Para confirmar la cotización, haz click en el siguiente botón
                    <br />
                    <br />
                    <div
                      align="center"
                      valign="middle"
                      style="
                        background: #ff7a59;
                        font-family: Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        font-weight: bold;
                        letter-spacing: -0.5px;
                        line-height: 150%;
                        padding-top: 15px;
                        padding-right: 30px;
                        padding-bottom: 15px;
                        padding-left: 30px;
                        border-radius: 10px;
                      "
                    >
                      <a
                        href="${this.urlItem3}"
                        target="_blank"
                        style="color: #ffffff; text-decoration: none"
                      >
                      Confirmar la cotización
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;">
                  <p >
                    <hr>
                    <h1 style="text-align: center; font-size: 12pt;" > Te recordamos que estas son las únicas cuentas autorizadas de TLCARGO </h1>
                    <hr><br>
                    <h2 style="font-size: 10pt;"> Para depósitos en Bolívares </h2>
                    <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga</li> <li><b>Numero de Cuenta:</b> 0172 0110 7111 0844 6517</li> <li><b>Titular:</b> Francy Wadskier</li> <li><b>C.I.:</b> V-18857206</li> </ul> <h2 style="font-size: 10pt;"> Para Pago Movil en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga (0172)</li> <li><b>Telefono:</b> 0424-1521758</li> <li><b>C.I.:</b> V-18857206</li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Si no has realizado el pago al momento de recibir este correo electrónico, por favor comunícate con nuestro servicio de atención al cliente para verificar la tasa de cambio. </b> </span> <br> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Dólares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>Cuenta:</b> Cheque</li> <li><b>Numero de Cuenta:</b> 9149573200</li> <li><b>Titular:</b> TL CARGO</li> <li><b>ABA:</b> 266086554</li> <li><b>SWIFT:</b> CITIUS33MIA</li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante ZELLE </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>ZELLE:</b> ZELLE@TLCARGO.NET</li> <li><b>Nombre:</b> (Teleflex Group Inc o Alvaro Abreu)</li> <li><b>Por favor colocar numero de Invoice en memo</b></li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante PAYPAL </h2> <ul style="font-size: 8pt;"> <li><b>Email:</b> paypal@TLCargo.net</li> <li><b>Verificar si su cuenta cobra un Fee por pagar debe agregarlo para que llegue el pago completo</b></li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Los pagos recibidos a través de transferencias (Wire) de otros bancos americanos tendrán un cargo extra de $15.00, esto no aplica para Zelle. </b> </span> </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:15px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.ok) {
        if (resp.info.response.includes("250")) {
          this.openSnackbar("Customer notified Correctly!!");
        } else {
          this.openSnackbar("We have some problems sending the notification!!");
        }
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }


      if (actualiza) {
        guidetoUpdate.notifiedTimes++;
        guidetoUpdate.notification = true;
        this.guidesService
          .updateGuide(guidetoUpdate)
          .subscribe((respAct: any) => {
          });
      }
    });
  }

  createQuote() {
    this.router.navigate(['/app/shipping-quotes/register/0']);
  }

  updateQuote(quote: Quote) {
    this.router.navigate(['/app/shipping-quotes/register/' + quote._id]);
  }

  deleteQuote(quote: Quote) {
    this.quoteService.deleteQuote(quote).subscribe(
      (resp: ServiceResponse) => {
        this.quotes.splice(
          this.quotes.findIndex(
            (existingQuote) => existingQuote._id === quote._id
          ),
          1
        );
        this.selection.deselect(quote);
        this.dataSource.data = this.quotes;
        this.openSnackbar(resp.msg);
      },
      (error) => this.openSnackbar(error.error.msg)
    );

  }

  deleteQuotes(quotes: Quote[]) {
    quotes.forEach((c) => this.deleteQuote(c));
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
      this.quotes = resp.data;
      this.dataSource.data = this.quotes;
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
    this.dialog.open(QuotesQrGeneratorComponent, {
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

  convertToGuide(guide: GuidesEntPop, quote: Quote) {

    if (quote.status === '1') {
      Swal.fire({
        icon: "warning",
        title: "Wait!...",
        text: "The quote is not pre-aproved by the customer, are you sure about continue?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No, cancel!"
      }).then((resultQ) => {
        if (resultQ.isConfirmed) {
          Swal.fire({
            icon: "warning",
            title: "Wait!...",
            text: "You are about to convert the quote to a shipping guide, are you sure about that?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No, cancel!"
          }).then((result) => {
            if (result.isConfirmed) {
              const type = guide.name.includes("AIR") ? "AIR" : "SEA";
              const finalShippings = this.shippingsAvailable.filter(ship => ship.type === type);
              if (finalShippings.length === 0) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "There are no available shippings to convert the quote to a guide",
                });
              } else {

                this.dialog
                  .open(AssignToShippingComponent, {
                    data: { guide, ships: finalShippings },
                    height: "auto",
                    width: "800px",
                  })
                  .afterClosed()
                  .subscribe((updatedGuide) => {
                    if (updatedGuide) {
                      this.dataLoad();

                      Swal.fire({
                        title: "Guide created successfully!!",
                        icon: "info",
                        text: "The guide has been created successfully, the quote has been eliminated, you can check it in the guide list.",
                        confirmButtonText: "Ok",
                      }).then(() => {
                        this.openQRStick(updatedGuide);
                        this.router.navigate(["/app/guides/register/guide/" + updatedGuide._id]);
                      });
                    }
                  });

              }
            }
          });
        }
      });
    } else {
      const guideType = guide.name.includes("AIR") ? "AIR" : "SEA";
      if ((quote.status === '2' && guideType === 'AIR') || (quote.status === '3' && guideType === 'SEA')) {
        Swal.fire({
          icon: "warning",
          title: "Wait!...",
          text: "You are about to convert the quote to a shipping guide, are you sure about that?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No, cancel!"
        }).then((result) => {
          if (result.isConfirmed) {
            const type = guide.name.includes("AIR") ? "AIR" : "SEA";
            const finalShippings = this.shippingsAvailable.filter(ship => ship.type === type);
            if (finalShippings.length === 0) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "There are no available shippings to convert the quote to a guide",
              });
            } else {

              this.dialog
                .open(AssignToShippingComponent, {
                  data: { guide, ships: finalShippings },
                  height: "auto",
                  width: "800px",
                })
                .afterClosed()
                .subscribe((updatedGuide) => {
                  if (updatedGuide) {
                    this.dataLoad();

                    Swal.fire({
                      title: "Guide created successfully!!",
                      icon: "info",
                      text: "The guide has been created successfully, the quote has been eliminated, you can check it in the guide list.",
                      confirmButtonText: "Ok",
                    }).then(() => {
                      this.openQRStick(updatedGuide);
                      this.router.navigate(["/app/guides/register/guide/" + updatedGuide._id]);
                    });
                  }
                });

            }
          }
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Wait!...",
          text: "The Shipping type that you're selecting for the Quote is not the same that the customer aproved, are you sure about that?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No, cancel!"
        }).then((resultDiff) => {
          if (resultDiff.isConfirmed) {
            Swal.fire({
              icon: "warning",
              title: "Wait!...",
              text: "You are about to convert the quote to a shipping guide, are you sure about that?",
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No, cancel!"
            }).then((result) => {
              if (result.isConfirmed) {
                const type = guide.name.includes("AIR") ? "AIR" : "SEA";
                const finalShippings = this.shippingsAvailable.filter(ship => ship.type === type);
                if (finalShippings.length === 0) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "There are no available shippings to convert the quote to a guide",
                  });
                } else {

                  this.dialog
                    .open(AssignToShippingComponent, {
                      data: { guide, ships: finalShippings },
                      height: "auto",
                      width: "800px",
                    })
                    .afterClosed()
                    .subscribe((updatedGuide) => {
                      if (updatedGuide) {
                        this.dataLoad();

                        Swal.fire({
                          title: "Guide created successfully!!",
                          icon: "info",
                          text: "The guide has been created successfully, the quote has been eliminated, you can check it in the guide list.",
                          confirmButtonText: "Ok",
                        }).then(() => {
                          this.openQRStick(updatedGuide);
                          this.router.navigate(["/app/guides/register/guide/" + updatedGuide._id]);
                        });
                      }
                    });

                }
              }
            });

          }
        });
      }
    }

  }


  getGuide(type: string, quote: any) {
    return quote.preGuideList.filter(guide => guide.name.includes(type))[0];
  }

}
function observableOf(arg0: null): any {
  throw new Error("Function not implemented.");
}
