import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import icAttachMoney from '@iconify/icons-ic/twotone-attach-money';
import icMoney from '@iconify/icons-ic/monetization-on';
import icRule from '@iconify/icons-ic/twotone-rule';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShippingEnt } from '../interfaces/shipping.model';
import { GuidesService } from '../../../../services/guides.service';
import { ShippingService } from '../../../../services/shipping.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WarehouseItemService } from '../../../../services/warehouse-item.service';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { RegisterForm } from '../../../../interfaces/register-form.interface';
import { UsuarioService } from '../../../../services/usuario.service';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { takeUntil } from 'rxjs/operators';
import { MailService } from '../../../../services/mail.service';
import { WarehouseItemFull } from '../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { environment } from '../../../../../environments/environment';
import { GuidesEnt } from '../../shipping-guides/interfaces/guides-ent.model';
import SignaturePad from 'signature_pad';
import { ShipPackagesListComponent } from '../ship-packages-list/ship-packages-list.component';
import { FileUploadService } from '../../../../services/file-upload.service';
import { GuidesEntPop } from '../../shipping-guides/interfaces/guides-ent-pop.model';

const this_url = environment.this_url;
const base_url = environment.base_url;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@Component({
  selector: 'vex-customer-signature',
  templateUrl: './customer-signature.component.html',
  styleUrls: ['./customer-signature.component.scss']
})
export class CustomerSignatureComponent implements OnInit, AfterViewInit {

  icMoney = icMoney;
  icCard = icAttachMoney;
  icRule = icRule;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icPrint = icPrint;

  spinner = false;
  public packageToShow: string;
  public ship: ShippingEnt;

  urlItem = '';

  public customerCtrl: FormControl = new FormControl('');
  public deliveryDateCtrl: FormControl = new FormControl('');
  public notificationCtrl: FormControl = new FormControl('');

  protected _onDestroy = new Subject<void>();

  signaturePad: SignaturePad;
  @ViewChild('canvas') canvasEl: ElementRef;
  signatureImg: string;
  signatureImgPath: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CustomerSignatureComponent>,
    private warehouseService: WarehouseItemService,
    private guideService: GuidesService,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService,
    private mailService: MailService) { }

  ngOnInit(): void {
    this.packageToShow = "<h2>You chose the following packages to deliver</h2><br>";
    let guide: GuidesEntPop;

    for (const tlPackage of this.data.selectedPackages) {
      guide = this.data.guides.filter((guideItem) => guideItem._id === tlPackage.guide)[0];
      this.packageToShow += `[<b>Guide:</b> ${guide.tlCargoId} / <b>Pkg:</b> ${tlPackage.tlCargoId} / <b>Piece:</b> ${tlPackage.guideCounter}]<br>`;
    }

    this.packageToShow = this.packageToShow.slice(0, -4);

    this.customerCtrl.setValue(guide.customer.name + ' - ' + guide.customer.tlCargoName);
    this.deliveryDateCtrl.setValue(new Date().toLocaleDateString("es-VE", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }));

  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  startDrawing(event: Event) {
    console.log(event);
    // works in device not in browser

  }

  moved(event: Event) {
    // works in device not in browser
  }

  clearPad() {
    this.signaturePad.clear();
  }

  savePad() {
    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;

    this.dataUrlToFile(this.signatureImg, this.data.selectedPackages[0].guide + '.png').then(
      (respFile) => {
        this.fileUploadService.photoUpdate(respFile, 'signatures', this.data.selectedPackages[0].guide).then(
          (resp: any) => {
            if (resp.ok) {
              this.openSnackbar('Signature saved correctly');
              this.signatureImgPath = resp.pathToFront;
            }
          }
        )
      }
    );
  }

  async dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {

    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: 'image/png' });
  }

  sendNotification(tlPackages: WarehouseItemFull[]) {

    this.urlItem = `${this_url}/#/warehouse-item-receipt/${tlPackages[0]._id}`;
    const guide = this.data.guides.filter((guideItem) => guideItem._id === tlPackages[0].guide)[0];

    const mail: any = {};
    mail.from = 'TLCargo tu servicio de transporte de carga';
    mail.to = guide.customer.email;
    if (adminNotification) {
      mail.bcc = adminEmails;
    }
    mail.subject = `El Paquete ${tlPackages[0].tlCargoId} / ${guide.tlCargoId} ha sido entregado`;

    if (tlPackages.length === 1) {
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>Ya tu paquete fue entregado!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <h2>Hola ${guide.customer.name}!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt"> Tu paquete ha sido entregado, abajo el detalle </p> <p style=" text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px; " > <b>Nro de guia</b>: ${guide.tlCargoId} <br> <b>Nro de Paquete</b>: ${tlPackages[0].tlCargoId} <br> <b>Nro de Pieza</b>: Paquete ${tlPackages[0].guideCounter} contenidos en la guia <br> <b>Descripción</b>: ${tlPackages[0].shortDesc} </p> </td> </tr> <tr> <td> <p style=" text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px; " > <b>Paquete entregado el</b>: ${this.deliveryDateCtrl.value} <br><b>Entregado a</b>: ${this.customerCtrl.value} <br> <b>Firma y recibe conforme</b>: <br> <br><div style="text-align: center; position: relative;"> <img style="text-align: center;" src="${base_url}/uploads/signatures/${this.signatureImgPath}" alt="Firma de quien recibe el paquete" width="200px" height="100px"/> </div> </p> </td> </tr> </tr> </table> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> ¡Gracias por preferirnos! <br /> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    } else {
      let packageDesc = '<ul style="font-size: 10pt;">';
      for (const tlPackage of tlPackages) {
        packageDesc += `<li >
                          <b>Nro de Paquete</b>: ${tlPackage.tlCargoId}
                        </li>
                        <li>
                          <b>Paq. en guia</b>: ${tlPackage.guideCounter}
                        </li>
                        <li>
                          <b>Descripción:</b> ${tlPackage.shortDesc}
                        </li>`;
      }
      packageDesc += '</ul>';

      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>Ya tu paquete fue entregado!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <h2>Hola ${guide.customer.name}!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt"> Tu paquete ha sido entregado, abajo el detalle </p> <p style=" text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px; " > <b>Nro de guia</b>: ${guide.tlCargoId}<br>${packageDesc} </p> </td> </tr><tr> <td> <p style=" text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px; " > <b>Entregado el</b>: ${this.deliveryDateCtrl.value}  <br> <b>Firma y recibe conforme</b>: <br> <br><div style="text-align: center; position: relative;"> <img style="text-align: center;" src="${base_url}/uploads/signatures/${this.signatureImgPath}" alt="Firma de quien recibe el paquete" width="200px" height="100px"/> </div> </p> </td> </tr> </tr> </table> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> ¡Gracias por preferirnos! <br /> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    }

    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      this.openSnackbar('Customer notified Correctly!!');
    });

  }


  submit() {

    if (this.signatureImg === undefined || this.signatureImg === null || this.signatureImg === '') {
      this.openSnackbar('Please sign the package');
      return;
    }

    if (this.data.selectedPackages.length === 1) {
      this.data.selectedPackages[0].status = '7';
      this.data.selectedPackages[0].deliveryInfo = this.customerCtrl.value;
      this.warehouseService.updateWarehouseItem(this.data.selectedPackages[0]).subscribe(
        (resp: ServiceResponse) => {
          if (resp.ok) {
            if (this.notificationCtrl.value) {
              this.sendNotification(this.data.selectedPackages);
            }
            this.warehouseService.isGuideComplete(this.data.selectedPackages[0].guide, "7").subscribe(
              (respIsComplete: ServiceResponse) => {
                if (respIsComplete.ok) {
                  if (respIsComplete.data) {
                    const guidetoUpdate = new GuidesEnt({});
                    guidetoUpdate._id = this.data.selectedPackages[0].guide;
                    guidetoUpdate.status = '7';
                    this.guideService.updateGuide(guidetoUpdate).subscribe(
                      (respGuideUpdated: ServiceResponse) => {
                        if (respGuideUpdated.ok) {
                          this.openSnackbar('All the packages of the guide have been delivered, the guide status has now changed to DELIVERED');
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      );
    }

    if (this.data.selectedPackages.length > 1) {

      for (let i = 0; i < this.data.selectedPackages.length; i++) {
        this.data.selectedPackages[i].status = '7';
        this.data.selectedPackages[i].deliveryInfo = this.signatureImg;
        this.warehouseService.updateWarehouseItem(this.data.selectedPackages[i]).subscribe(
          (resp: ServiceResponse) => {
            if (resp.ok) {

              if (i === this.data.selectedPackages.length - 1) {
                if (this.notificationCtrl.value) {
                  this.sendNotification(this.data.selectedPackages);
                }
                this.warehouseService.isGuideComplete(this.data.selectedPackages[i].guide, "7").subscribe(
                  (respIsComplete: ServiceResponse) => {
                    if (respIsComplete.ok) {
                      if (respIsComplete.data) {
                        const guidetoUpdate = new GuidesEnt({});
                        guidetoUpdate._id = this.data.selectedPackages[i].guide;
                        guidetoUpdate.status = '7';
                        this.guideService.updateGuide(guidetoUpdate).subscribe(
                          (respGuideUpdated: ServiceResponse) => {
                            if (respGuideUpdated.ok) {
                              this.openSnackbar('All the packages of the guide have been delivered, the guide status has now changed to DELIVERED');
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            }
          }
        );
      }
    }
    this.dialogRef.close();
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

}
