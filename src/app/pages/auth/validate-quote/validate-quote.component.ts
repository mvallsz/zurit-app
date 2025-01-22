import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { ServiceResponse } from "src/app/interfaces/service-response.interface";
import { Customer } from "../../warehousingModules/customers-registry/interfaces/customer.model";
import { fadeInUp400ms } from "src/@vex/animations/fade-in-up.animation";
import { MailService } from "src/app/services/mail.service";

import { environment } from "../../../../environments/environment";
import { GuidesService } from "src/app/services/guides.service";
import { GuidesEnt } from "../../outgoingShippingModules/shipping-guides/interfaces/guides-ent.model";
import { GuidesEntPop } from "../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model";
import { initGuide } from "src/static-data/tlcargo-static-data";

import Swal from "sweetalert2";
import { FormControl } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { QuotesService } from "src/app/services/quotes.service";
import { Quote } from "../../accountingModules/shipping-quotes/interfaces/quote-containers.model";

const this_url = environment.this_url;
const admin_email = environment.admin_email;

@Component({
  selector: "vex-validate-quote",
  templateUrl: "./validate-quote.component.html",
  styleUrls: ["./validate-quote.component.scss"],
  animations: [fadeInUp400ms],
})
export class ValidateQuoteComponent implements OnInit {

  guide = new GuidesEntPop(initGuide);
  quote = new Quote({});
  public notificationCtrl: FormControl = new FormControl();

  isQuote = false;
  urlItem = "";
  urlItem2 = "";
  customer = new Customer(initGuide.customer);
  msg: string;

  public guideId;
  public quoteId;

  constructor(
    private mailService: MailService,
    private rutaActiva: ActivatedRoute,
    private guideService: GuidesService,
    private quoteService: QuotesService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.spinner.show("quoteSpinner");

    this.guideId = this.rutaActiva.snapshot.params.id;
    this.quoteId = this.rutaActiva.snapshot.params.quoteId;

    this.quoteService.getQuote(this.quoteId).subscribe(
      (respQ: ServiceResponse) => {
        if (respQ) {
          this.quote = respQ.data[0];
          if (this.quote.status === '0' || this.quote.status === '8' || this.quote.status === '9') {
            let msg = '';

            if (this.quote.status === '0') {
              msg = 'Hola, la cotización que nos estas indicando es invalida';
            } else if (this.quote.status === '9') {
              msg = 'Hola, la cotización que nos estas indicando ya esta pre aprobada en la modalidad Marítima';
            } else {
              msg = 'Hola, la cotización que nos estas indicando ya esta pre aprobada en la modalidad Aérea';
            }

            Swal.fire({
              title: 'Ups!!',
              icon: `${this.quote.status === '0' ? 'error' : 'warning'}`,
              text: msg,
              showDenyButton: true,
              denyButtonText: `Ir a la pagina principal`,
              confirmButtonText: `Contactar a soporte via WhatsApp`
            }).then((confirm) => {
              if (confirm.isConfirmed) {
                window.open("https://wa.link/knntyd", "_blank");
                window.location.href = "https://www.tlcargo.net";
              } else {
                window.location.href = "https://www.tlcargo.net";
              }
            });
          } else {
            this.guideService.getGuidetoInvoice(this.guideId).subscribe(
              (resp: ServiceResponse) => {
                if (resp.ok) {
                  this.guide = resp.data;
                  this.customer = resp.data.customer;
                  if (!this.guide.quote) {
                    Swal.fire({
                      title: 'Ups!!',
                      icon: "error",
                      text: 'Hola, el ID que nos estas indicando es invalido o ya esa cotización no existe, contacto con nuestro equipo técnico!!',
                      showDenyButton: true,
                      denyButtonText: `Ir a la pagina principal`,
                      confirmButtonText: `Contactar a soporte via WhatsApp`
                    }).then((confirm) => {
                      if (confirm.isConfirmed) {
                        window.open("https://wa.link/knntyd", "_blank");
                        window.location.href = "https://www.tlcargo.net";
                      } else {
                        window.location.href = "https://www.tlcargo.net";
                      }
                    });
                  } else {
                    if (this.guide.status === '0' || this.guide.status === '8') {
                      Swal.fire({
                        title: 'Ups!!',
                        icon: `${this.guide.status === '0' ? 'error' : 'warning'}`,
                        text: `Hola, la cotización que nos estas indicando ${this.guide.status === '0' ? 'es invalida' : 'ya esta pre aprobada'}, contacto con nuestro equipo técnico!!`,
                        showDenyButton: true,
                        denyButtonText: `Ir a la pagina principal`,
                        confirmButtonText: `Contactar a soporte via WhatsApp`
                      }).then((confirm) => {
                        if (confirm.isConfirmed) {
                          window.open("https://wa.link/knntyd", "_blank");
                          window.location.href = "https://www.tlcargo.net";
                        } else {
                          window.location.href = "https://www.tlcargo.net";
                        }
                      });
                    } else {
                      this.spinner.hide("quoteSpinner");
                      this.isQuote = true;
                    }
                  }
                } else {
                  Swal.fire({
                    title: 'Ups!!',
                    icon: "error",
                    text: 'Hola, el ID que nos estas indicando es invalido o ya esa cotización no existe, contacto con nuestro equipo técnico!!',
                    showDenyButton: true,
                    denyButtonText: `Ir a la pagina principal`,
                    confirmButtonText: `Contactar a soporte via WhatsApp`
                  }).then((confirm) => {
                    if (confirm.isConfirmed) {
                      window.open("https://wa.link/knntyd", "_blank");
                      window.location.href = "https://www.tlcargo.net";
                    } else {
                      window.location.href = "https://www.tlcargo.net";
                    }
                  });
                }
              }, (error) => {
                Swal.fire({
                  title: 'Ups!!',
                  icon: "error",
                  text: 'Hola, el ID que nos estas indicando es invalido o ya esa cotización no existe, contacto con nuestro equipo técnico!!',
                  showDenyButton: true,
                  denyButtonText: `Ir a la pagina principal`,
                  confirmButtonText: `Contactar a soporte via WhatsApp`
                }).then((confirm) => {
                  if (confirm.isConfirmed) {
                    window.open("https://wa.link/knntyd", "_blank");
                    window.location.href = "https://www.tlcargo.net";
                  } else {
                    window.location.href = "https://www.tlcargo.net";
                  }
                });
              }
            );
          }
        } else {
          Swal.fire({
            title: 'Ups!!',
            icon: "error",
            text: 'Hola, el ID que nos estas indicando es invalido o ya esa cotización no existe, contacto con nuestro equipo técnico!!',
            showDenyButton: true,
            denyButtonText: `Ir a la pagina principal`,
            confirmButtonText: `Contactar a soporte via WhatsApp`
          }).then((confirm) => {
            if (confirm.isConfirmed) {
              window.open("https://wa.link/knntyd", "_blank");
              window.location.href = "https://www.tlcargo.net";
            } else {
              window.location.href = "https://www.tlcargo.net";
            }
          });
        }
      }
    );




  }

  aceptarCotizacion() {

    if (this.guide.name.includes('AIR')) {
      this.quote.status = '2';
    } else {
      this.quote.status = '3';
    }

    this.quoteService.updateQuote(this.quote).subscribe(
      (respUpd: ServiceResponse) => {
        if (respUpd.ok) {
          this.sendNotification(this.guide);
          Swal.fire({
            title: 'Tu cotización paso a un estado de PRE-APROBADO!!',
            icon: "success",
            text: 'A la brevedad nuestro equipo generará la nueva guía, una vez generada, llegara a tu bandeja un correo con el detalle, te vamos a redireccionar a nuestra pagina principal!!'
          }).then(() => { window.location.href = "https://www.tlcargo.net"; });

        }
        this.spinner.hide("quoteSpinner");
      }
    );

  }

  sendNotification(guide: GuidesEntPop) {
    const guidetoUpdate: GuidesEnt = new GuidesEnt(guide);

    this.urlItem = `${this_url}/#/guide-receipt/${guide._id}`;
    this.urlItem2 = `${this_url}/#/guide-package-list/${guide._id}`;

    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = admin_email;
    mail.subject = `[ADMIN] La cotización ${this.quote.tlCargoId}" ha sido Pre-Aprobada por el cliente"`;
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
      <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; }
      .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }
      .datagrid table td, .datagrid table th { padding: 3px 10px; }
      .datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; }
      .datagrid table thead th:first-child { border: none; }
      .datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }
      .datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }
      .datagrid table tbody td:first-child { border-left: none; }
      .datagrid table tbody tr:last-child td { border-bottom: none; }
      a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; }
      h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; }
       #email { margin: auto; width: 600px; background-color: white; }
       button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head>
       <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word">
       <! View in Browser Link --> <div id="email">
       <table align="right" role="presentation">
       <tr>
       <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr>
       </table> <! Banner -->
       <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
       <tr> <td bgcolor="white" align="center" style="color: black;"> <br>
       <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle">
       <h2>Ha sido pre-aprobada por el cliente la cotización ${this.quote.tlCargoId}.</h2>
       </td> </tr>
       <tr> <td>
       <p style="text-align: center; font-size: 14pt;">Ingresa al sistema y revisa la sección de cotizaciones.</p>
       <p style="text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px;">
       Para gestionar la creación de la guía, por favor ingresar a la seción de cotizaciones, revisar la información de la cotización y procede a la creación de la guía utilizando la opción <b>Convert to Guide</b> .
       </p>
       </td>
       </tr>
       </table>
        <! First Row -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%">
        <tr>
        <td style="text-align: center; padding-left: 15px; padding-right: 15px;">
        <div style="background: #59ace4; border-radius: 20px; color: white;padding: 15px;">
        <h2 style="font-size: 16pt"> Tipo de cotización: ${guide.name.includes('AIR') ? 'Aérea' : 'Marítima'} </h2>
        <h2 style="font-size: 16pt"> Costo total de la Cotización: </h2>
        <h3 style="font-size: 18pt"> ${guide.cost.toLocaleString("en", { style: "currency", currency: "USD" })} </h3>
        </div>
        </td>
        </tr>
        <tr>
        <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;">
        <p> Para revisar los paquetes asociados a la guía haz click en el siguiente enlace:<br/>${this.urlItem2
      } </p> <p> Descarga el invoice acá:<br/>${this.urlItem
      }</p> </td> </tr>
      <tr>
      <td style=" text-align: center; background-color: #85C1E9;">
      <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp;
      <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp;
      <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp;
      <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a>
      </td> </tr>
      </table>
      <table bgcolor="#5DADE2" width="100%" >
       <tr> <td align="left" style="padding:15px;">
      <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;

    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {

        console.log("Customer notified Correctly!!");
      } else {
        console.log("We have some problems sending the notification!!");
      }
    });
  }
}
