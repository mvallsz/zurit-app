import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { User } from '../../adminModules/users-registry/interfaces/users.model';
import * as CryptoJS from 'crypto-js';

import { environment } from "../../../../environments/environment";
import { MailService } from 'src/app/services/mail.service';

const NEWUSERSECRET = environment.NEWUSERSECRET;
const this_url = environment.this_url;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@Component({
  selector: 'vex-validate-user',
  templateUrl: './validate-user.component.html',
  styleUrls: ['./validate-user.component.scss']
})
export class ValidateUserComponent implements OnInit {

  usuarioValido: User;
  msg: string;
  constructor(private rutaActiva: ActivatedRoute,
    private userService: UsuarioService,
    private mailService: MailService) { }

  ngOnInit(): void {
    this.userService.activarUser(this.rutaActiva.snapshot.params.token).subscribe(
      (validResp: any) => {

        let bytes = CryptoJS.AES.decrypt(validResp.temp, NEWUSERSECRET);
        let decryptedPass = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        this.usuarioValido = validResp.user;
        this.usuarioValido.password = decryptedPass;
        this.sendNotification(this.usuarioValido);
        this.msg = validResp.msg;
      }
    );
  }

  sendNotification(user: User) {
    const mail: any = {};
    mail.from = 'TlCargo System Notification Service';
    mail.to = user.email;
    if (adminNotification) {
      mail.bcc = adminEmails;
    }
    mail.subject = 'User properly validated in TLCargo System';
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>Your Tlcargo account has been activated!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <h2>Hi ${user.name}!</h2> </td> </tr> <tr> <td style="padding: 20px"> <p style="text-align: center; font-size: 14pt"> Thank you for activating your account!<br /><br /> <br /> Here your temporal password, remember that you have to change it as soon as you enter the app.<br /> </p> </td> </tr> <tr> <td style="padding: 20px"> <div align="center" valign="middle" style=" background: #ff7a59; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; letter-spacing: -0.5px; line-height: 150%; padding-top: 15px; padding-right: 30px; padding-bottom: 15px; padding-left: 30px; border-radius: 10px; " > ${user.password} </div> <br /> <br /> </td> </tr> </table> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> Log In the App from the following link:<br /> <a style="text-decoration: none; font-weight: bolder" href="${this_url}" >${this_url}</a > </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTMLCreate(mail).subscribe((resp: any) => {
    });
  }

}
