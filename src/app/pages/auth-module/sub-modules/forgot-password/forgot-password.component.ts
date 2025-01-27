import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import icMail from '@iconify/icons-ic/twotone-mail';
import { MailService } from '../../../../services/mail.service';
import * as EmailValidator from 'email-validator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../../services/modules/admin-module/user.service';

import { environment } from "../../../../../environments/environment";
const this_url = environment.this_url;

@Component({
  selector: 'vex-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [fadeInUp400ms]
})
export class ForgotPasswordComponent implements OnInit {

  form: FormGroup;
  spinner = false;
  icMail = icMail;
  token = '';
  email = '';
  name = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private mailService: MailService,
    private snackBar: MatSnackBar,
    private usuarioService: UsuarioService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });
  }

  send() {
    if (this.isValidEmail('email')) {

      this.spinner = true;
      this.usuarioService.getEmailToken(this.form.get('email').value)
        .subscribe((respToken: any) => {
          this.token = respToken.data;
          this.spinner = true;
          this.openSnackbar('Check your email for next steps');
          this.sendNotification(respToken.user[0].email, respToken.user[0].name, this.token);
          this.router.navigate(['/']);
        }, (error) => {
          this.openSnackbar(error.error.msg);
          this.spinner = false;
        });
      this.spinner = false;
    }
  }

  sendNotification(email: string, name: string, token: string) {
    const mail: any = {};
    mail.from = 'TlCargo System Notification Service';
    mail.to = email;
    mail.subject = 'Forgot your password?';
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head><link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>TLCargo System Registration</title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <a class="subtle-link" href="#">View in Browser</a> </td> <tr> </table> <! Banner --> <table role="presentation" width="100%"> <tr> <td bgcolor="#00A4BD" align="center" style="color: white;"> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="200px" align="middle"> <h1> Reset your password! </h1> </td> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="10px" style="padding: 30px 30px 30px 60px; text-align: center"> <tr> <td> <h2> Hi ${name}</h2> <p> you have to copy the following URL in the browser and follow the next steps. </p> ${this_url}/#/reset-password/${token} </td> </tr> </table> <table role="presentation" bgcolor="#F5F8FA" width="100%" > <tr> <td align="left" style="padding: 30px 30px;"> <p style="color:#99ACC2"> Made with &hearts; at DogHoundTechnology </p> </td> </tr> </table> </div> </body> </html>`;
    this.mailService.sendHTMLCreate(mail).subscribe((resp: any) => {

    });
  }

  isValidEmail(field: string) {
    if (EmailValidator.validate(this.form.get(field).value)) {
      return true;
    } else {

      this.openSnackbar(`Error: email is invalid`);
      this.spinner = false;
      return false;
    }

  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 20000,
      horizontalPosition: 'center'
    });
  }

}
