import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";
import { MatSelectChange } from "@angular/material/select";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import { SelectionModel } from "@angular/cdk/collections";

import { TableColumn } from "../../../../@vex/interfaces/table-column.interface";
import { fadeInUp400ms } from "../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../@vex/animations/stagger.animation";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import Swal from "sweetalert2";

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
import icCheck from "@iconify/icons-ic/twotone-checklist";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import icPrint from "@iconify/icons-ic/twotone-print";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import icMoney from "@iconify/icons-ic/monetization-on";
import icTimer from "@iconify/icons-ic/twotone-timer";
import {
  guidesLabels,
  guideStatus,
  paymentGuideStatus,
} from "../../../../static-data/tlcargo-static-data";

import { PickingListWarehouseComponent } from "../../outgoingShippingModules/shipping-guides/picking-list-warehouse/picking-list-warehouse.component";
import { GuideInvoiceComponent } from "../../utility/guide-invoice/guide-invoice.component";
import { GuidePickListComponent } from "../../utility/guide-pick-list/guide-pick-list.component";
import { PaymentRecordCreateUpdateComponent } from "./payment-record-create-update/payment-record-create-update.component";
import { PaymentBitacoraComponent } from "../../utility/payment-bitacora/payment-bitacora.component";

import { NgxSpinnerService } from "ngx-spinner";
import { GuidesService } from "../../../services/guides.service";
import { WarehouseItemService } from "../../../services/warehouse-item.service";

import { ServiceResponse } from "../../../interfaces/service-response.interface";
import { GuidesEntPop } from "../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model";
import { GuidesEnt } from "../../outgoingShippingModules/shipping-guides/interfaces/guides-ent.model";
import { MailService } from "../../../services/mail.service";

import { environment } from "../../../../environments/environment";
import icAlarm from "@iconify/icons-ic/twotone-alarm-on";
import { PaymentBitacoraInterface } from "../../../interfaces/payment-bitacora-data-table.interface";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import * as XLSX from 'xlsx';

const this_url = environment.this_url;
const guideFilters = environment.guide_filters;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@UntilDestroy()
@Component({
  selector: "vex-guides-invoices",
  templateUrl: "./guides-invoices.component.html",
  styleUrls: ["./guides-invoices.component.scss"],
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
export class GuidesInvoicesComponent implements OnInit, AfterViewInit {
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
    { label: "Customer", property: "customer", type: "text", visible: true },
    {
      label: "OutGoing Shipment",
      property: "shipping",
      type: "text",
      visible: false,
    },
    { label: "Guide Id", property: "_id", type: "text", visible: true },
    {
      label: "Package List",
      property: "packageList",
      type: "button",
      visible: false,
    },
    {
      label: "Weight / Vlb/ Volume",
      property: "finalWeight",
      type: "text",
      visible: true,
    },
    { label: "Cost", property: "cost", type: "text", visible: true },
    {
      label: "Paid Amount",
      property: "paidAmount",
      type: "text",
      visible: true,
    },
    {
      label: "Payment Status",
      property: "paymentStatus",
      type: "button",
      visible: true,
    },
    { label: "Status", property: "status", type: "button", visible: true },
    { label: "Created By", property: "user", type: "text", visible: false },
  ];

  paymentGuideStatus = paymentGuideStatus;
  statusToShow = guideStatus;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";

  dataSource: MatTableDataSource<GuidesEntPop> | null;
  selection = new SelectionModel<GuidesEntPop>(true, []);
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
  icCheck = icCheck;
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icList = icListAlt;
  icMoney = icMoney;
  icTime = icTimer;
  icAlarm = icAlarm;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public spinnerDown = false;
  totalData = 0;


  constructor(
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private guidesService: GuidesService,
    private warehouseItemService: WarehouseItemService,
    private mailService: MailService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
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

  getTableData$(
    pageNumber: Number,
    pageSize: Number,
    filter: string,
    spinner: boolean,
    filterOptions: any
  ) {
    if (spinner) this.spinner.show("guideSpinner");

    return this.guidesService
      .getGuidesPag(
        pageNumber,
        pageSize,
        filter,
        filterOptions,
        false
      );
  }

  name = `TLCargo_invoices${Date.now().toPrecision()}.xlsx`;

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;
    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let itemsToExport: GuidesEntPop[];
        itemsToExport = new Array();
        if (resp.data.length > 0) {
          for (const item of resp.data) {
            itemsToExport.push(new GuidesEntPop(item));
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

  selectPaymentStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.paymentGuideStatus.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.statusToShow.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  paymentTimelineGuide(guide: GuidesEntPop) {
    this.dialog.open(PaymentBitacoraComponent, {
      data: guide._id,
      width: "1000px",
      height: "600px",
    });
  }

  showPicList(list: any) {
    this.dialog
      .open(PickingListWarehouseComponent, {
        height: "500px",
        data: list,
      })
      .afterClosed()
      .subscribe(() => {
        this.spinner.show("guideSpinner");
        this.guidesService
          .getGuides(0, 5, "", false)
          .subscribe((resp: ServiceResponse) => {
            this.guides = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide("guideSpinner");
          });
      });
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
      this.searchCtrl.setValue("");
      this.filter = "";
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
    const canChangeStatus = true;
    if (+change.value.id >= 4) {
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
          this.statusToShow.filter((status) => status.id === change.value.id)[0]
            .text +
          " once it becomes status IN TRANSIT",
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
      width: "1000px",
    });
  }

  checkOut(guide: GuidesEntPop) {
    this.dialog
      .open(PaymentRecordCreateUpdateComponent, {
        data: guide,
        width: "1024px",
        autoFocus: "first-header",
      })
      .afterClosed()
      .subscribe((updatedGuide) => {
        if (updatedGuide) {
          this.spinner.show();
          this.guidesService
            .getGuides(0, 5, "", false)
            .subscribe((resp: ServiceResponse) => {
              this.guides = resp.data;
              this.dataSource.data = resp.data;
              this.spinner.hide();
            });
        }
      });
  }

  openPickList(guide: GuidesEntPop) {
    this.dialog.open(GuidePickListComponent, {
      data: guide,
      height: "800px",
      width: "1000px",
    });
  }

  sendNotification(guide: GuidesEntPop, actualiza: boolean) {
    const guidetoUpdate: GuidesEnt = new GuidesEnt(guide);

    this.urlItem = `${this_url}/#/guide-receipt/${guide._id}`;
    this.urlItem2 = `${this_url}/#/guide-package-list/${guide._id}`;

    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = guide.customer.email;
    if (adminNotification) {
      mail.bcc = adminEmails;
    }
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
            this.guidesService
              .getGuides(0, 5, "", false)
              .subscribe((respWI: ServiceResponse) => {
                this.guides = respWI.data;
                this.dataSource.data = this.guides;
              });
          });
      }
    });
  }

  notifyCustomers(guide: GuidesEntPop[]) {
    guide.forEach((c) => this.sendNotification(c, true));
    this.openSnackbar("Customers notified Correctly!!");
    this.selection.clear();
  }
}
function observableOf(arg0: null): any {
  throw new Error("Function not implemented.");
}

