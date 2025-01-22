import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShippingService } from '../../../../services/shipping.service';
import { GuidesService } from '../../../../services/guides.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { PaymentType } from '../../../accountingModules/payment-types-registry/interfaces/payment-type.model';
import icMoney from '@iconify/icons-ic/monetization-on';
import icAttachMoney from '@iconify/icons-ic/twotone-attach-money';
import icRule from '@iconify/icons-ic/twotone-rule';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import { PaymentTypeService } from '../../../../services/payment-type.service';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { takeUntil } from 'rxjs/operators';
import icBoxo from '@iconify/icons-ic/twotone-outbox';
import Swal from 'sweetalert2';
import { Customer } from '../interfaces/customer.model';
import { defaults } from 'autoprefixer';
import { CustomerService } from '../../../../services/customer.service';
import icDescription from '@iconify/icons-ic/twotone-description';

import { environment } from "../../../../../environments/environment";
import { MailService } from 'src/app/services/mail.service';
const this_url = environment.this_url;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@Component({
  selector: 'vex-balance-record-create-update',
  templateUrl: './balance-record-create-update.component.html',
  styleUrls: ['./balance-record-create-update.component.scss']
})
export class BalanceRecordCreateUpdateComponent implements OnInit {

  public spinner = false;

  protected paymentTypes: PaymentType[] = [];
  public paymentTypesCtrl: FormControl = new FormControl('', [Validators.required]);
  public paymentTypesFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredPaymentTypes: ReplaySubject<PaymentType[]> = new ReplaySubject<PaymentType[]>(0);
  @ViewChild('paymentTypesSelect', { static: true }) paymentTypesSelect: MatSelect;

  icMoney = icMoney;
  icPkg = icBoxo;
  icCard = icAttachMoney;
  icRule = icRule;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icPrint = icPrint;
  icNote = icDescription;

  protected _onDestroy = new Subject<void>();

  public nameCtrl: FormControl = new FormControl('');
  public notesCtrl: FormControl = new FormControl('');
  public balanceCtrl: FormControl = new FormControl('');
  public paidAmountCtrl: FormControl = new FormControl('', [Validators.required]);

  formula = '';

  // tslint:disable-next-line:no-shadowed-variable
  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Customer,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<BalanceRecordCreateUpdateComponent>,
    private customerService: CustomerService,
    private paymentTypeService: PaymentTypeService,
    private snackbar: MatSnackBar,
    private mailService: MailService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {

    this.nameCtrl.setValue(this.defaults.name);
    this.balanceCtrl.setValue(this.defaults.creditBalance[0].balance.toLocaleString('en', {
      style: 'currency',
      currency: 'USD'
    }));

    this.paymentTypeService.getPaymentTypes().subscribe((resp: ServiceResponse) => {
      this.paymentTypes = resp.data.filter(paymentType => (paymentType.canShow));
      this.filteredPaymentTypes.next(this.paymentTypes.slice());
      this.paymentTypesFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterPaymentTypes();
        });
    });
  }

  protected filterPaymentTypes() {
    if (!this.paymentTypes) {
      return;
    }
    let search = this.paymentTypesFilterCtrl.value;
    if (!search) {
      this.filteredPaymentTypes.next(this.paymentTypes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredPaymentTypes.next(
      this.paymentTypes.filter(packageType => packageType.name.toLowerCase().indexOf(search) > -1)
    );
  }

  submit() {
    if (this.paidAmountCtrl.value > 0) {
      this.spinner = true;
      const customer = new Customer(this.defaults);

      const balanceAccountItem = {
        balance: Number(this.paidAmountCtrl.value) + Number(this.defaults.creditBalance[0].balance),
        newAmount: Number(this.paidAmountCtrl.value),
        source: this.paymentTypesCtrl.value,
        balanceDate: new Date(),
        notes: this.notesCtrl.value,
        usuario: ''
      };
      customer.creditBalance.unshift(balanceAccountItem);

      this.customerService.updateCustomer(customer).subscribe(resp => {
        if (resp.ok) {
          this.spinner = false;
          this.sendNotification(customer);
          this.dialogRef.close(resp.data);
          this.openSnackbar(resp.msg);
        }
      });
    } else {
      this.openSnackbar('The credit amount cannot be a negative value or zero');
      this.paidAmountCtrl.setValue(0);
    }


  }

  sendNotification(customer: Customer) {
    const mail: any = {};
    const balance = Number(this.defaults.creditBalance[0].balance) - Number(this.paidAmountCtrl.value);
    const newBalance = Number(this.defaults.creditBalance[0].balance);
    const credit = Number(this.paidAmountCtrl.value);
    const balanceDate = new Date().toLocaleDateString('ve-ES');
    const notes = this.notesCtrl.value;

    mail.from = "TlCargo System Notification Service";
    mail.to = customer.email;
    if (adminNotification) mail.bcc = adminEmails;
    mail.subject = `Hemos registrado un crédito en tu casillero [${customer.tlCargoName}]!`;
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }.datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> <h2>Hemos registrado un crédito en tu cuenta!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <h2>Hola ${customer.name}!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt;"> Acabamos de registrar un crédito a tu balance de cuenta, acá el detalle: </p> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> <tr> <td style="text-align: center; padding-left: 15px; padding-right: 15px;"> <div style="background: #59ace4; border-radius: 20px; color: white;padding: 15px;"> <h2 style="font-size: 12pt"> Balance de cuenta previo al crédito </h2> <h3 style="font-size: 14pt"> ${balance.toLocaleString('en', { style: 'currency', currency: 'USD' })} </h3> <h2 style="font-size: 12pt"> Monto del crédito </h2> <h3 style="font-size: 14pt; color: green;"> ${credit.toLocaleString('en', { style: 'currency', currency: 'USD' })} </h3> <h2 style="font-size: 12pt"> Balance de cuenta posterior al crédito </h2> <h3 style="font-size: 14pt"> ${newBalance.toLocaleString('en', { style: 'currency', currency: 'USD' })} </h3> </div> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>Fecha de la transacción:</b> ${balanceDate} </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>Comentarios:</b> ${notes} <br> <br> <hr> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <p > <hr> <h1 style="text-align: center; font-size: 12pt;" > Te recordamos que estas son las únicas cuentas autorizadas de TLCARGO </h1> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga</li> <li><b>Numero de Cuenta:</b> 0172 0110 7111 0844 6517</li> <li><b>Titular:</b> Francy Wadskier</li> <li><b>C.I.:</b> V-18857206</li> </ul> <h2 style="font-size: 10pt;"> Para Pago Movil en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga (0172)</li> <li><b>Telefono:</b> 0424-1521758</li> <li><b>C.I.:</b> V-18857206</li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Si no has realizado el pago al momento de recibir este correo electrónico, por favor comunícate con nuestro servicio de atención al cliente para verificar la tasa de cambio. </b> </span> <br> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Dólares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>Cuenta:</b> Cheque</li> <li><b>Numero de Cuenta:</b> 9149573200</li> <li><b>Titular:</b> TL CARGO</li> <li><b>ABA:</b> 266086554</li> <li><b>SWIFT:</b> CITIUS33MIA</li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante ZELLE </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>ZELLE:</b> ZELLE@TLCARGO.NET</li> <li><b>Nombre:</b> (Teleflex Group Inc o Alvaro Abreu)</li> <li><b>Por favor colocar numero de Invoice en memo</b></li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante PAYPAL </h2> <ul style="font-size: 8pt;"> <li><b>Email:</b> paypal@TLCargo.net</li> <li><b>Verificar si su cuenta cobra un Fee por pagar debe agregarlo para que llegue el pago completo</b></li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Los pagos recibidos a través de transferencias (Wire) de otros bancos americanos tendrán un cargo extra de $15.00, esto no aplica para Zelle. </b> </span> </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:15px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTMLCreate(mail).subscribe((resp: any) => {
      this.openSnackbar('Customer Notified correctly!');
    });
  }

  reset() { }

  keyPressNumbersWithDecimalFC(event, input: FormControl) {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 45 && charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = input.value.indexOf('.');
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }

    if (charCode === 45) {
      if (input.value.length > 0) {
        event.preventDefault();
        return false;
      }
      const index = input.value.indexOf('-');
      if (index === 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  openSnackbar(message: string) {
    this.snackbar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

}
