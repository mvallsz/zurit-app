import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as EmailValidator from 'email-validator';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDownload from '@iconify/icons-ic/twotone-cloud-download';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icPerson from '@iconify/icons-ic/twotone-person';
import icMyLocation from '@iconify/icons-ic/twotone-my-location';
import icLocationCity from '@iconify/icons-ic/twotone-location-city';
import icEditLocation from '@iconify/icons-ic/twotone-edit-location';
import icMail from '@iconify/icons-ic/twotone-mail';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';
import { MailService } from 'src/app/services/mail.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { RegisterForm } from 'src/app/interfaces/register-form.interface';
import { Roles } from '../interfaces/roles.model';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { User } from '../interfaces/users.model';

import { environment } from "../../../../../environments/environment";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { FileUploadService } from 'src/app/services/file-upload.service';
const this_url = environment.this_url;
const base_url = environment.base_url;

@Component({
  selector: 'vex-users-create-update',
  templateUrl: './users-create-update.component.html',
  styleUrls: ['./users-create-update.component.scss']
})
export class UsersCreateUpdateComponent implements OnInit {

  avatarPreview: string | ArrayBuffer;

  protected registro: RegisterForm;
  public roles: Roles[] = [];
  public rolesCtrl: FormControl = new FormControl();
  @ViewChild('rolesSelect', { static: true }) rolesSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  form: FormGroup;
  isFormOk = true;
  inputType = 'password';
  public visible = false;
  public spinner = false;

  mode: 'create' | 'update' = 'create';

  icMoreVert = icMoreVert;
  icClose = icClose;

  icPrint = icPrint;
  icDownload = icDownload;
  icDelete = icDelete;

  icPerson = icPerson;
  icMyLocation = icMyLocation;
  icLocationCity = icLocationCity;
  icEditLocation = icEditLocation;
  icPhone = icPhone;
  icMail = icMail;

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  imageUrl: any;

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private dialogRef: MatDialogRef<UsersCreateUpdateComponent>,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private usuarioService: UsuarioService,
    private imageService: FileUploadService,
    private sanitizer: DomSanitizer,
    private mailService: MailService,) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      avatar: [null]
    });
    this.usuarioService.getRoles().subscribe(
      (resp: ServiceResponse) => {
        this.roles = resp.data;
      }
    );

    if (this.data) {
      this.mode = 'update';
      this.form.get('name').setValue(this.data.name);
      this.form.get('email').setValue(this.data.email);
      this.form.get('phone').setValue(this.data.phone);
      this.rolesCtrl.setValue(this.data.role);
      if (this.data.avatar) {
        this.loadImage(this.data.avatar);
      }

    }
  }

  loadImage(imagePath: string): void {
    this.imageService.getImage(imagePath, 'users').subscribe((blob) => {
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.form.patchValue({
          avatar: file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  send() {
    if (this.isValidEmail('email') &&
      this.isValidField('phone') &&
      this.isValidField('name') &&
      this.rolesCtrl.valid) {

      this.spinner = true;
      this.registro = this.form.value;
      this.registro.role = this.rolesCtrl.value;

      const formData = new FormData();

      formData.append('name', this.registro.name);
      formData.append('email', this.registro.email);
      formData.append('phone', this.registro.phone);
      formData.append('role', this.registro.role);
      if (this.form.get('avatar').value) {
        formData.append('avatar', this.form.get('avatar').value);
      }

      if (this.mode === 'update') {
        formData.append('_id', this.data._id.toString());
        this.usuarioService.updateUser(formData)
          .subscribe((resp: ServiceResponse) => {
            this.spinner = true;
            this.openSnackbar('User updated successfully');
            this.spinner = false;
            this.dialogRef.close(resp.data);
          }, (error) => {
            this.openSnackbar(error.error.msg);
            this.spinner = false;
          });
      } else {
        this.usuarioService.crearUser(formData)
          .subscribe((resp: any) => {
            this.spinner = true;

            Swal.fire({
              title: '¡Usuario creado con éxito!',
              text: 'Se envio un correo electrónico al nuevo usuario con las instrucciones para activar su cuenta',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            //this.sendNotification(resp.user, resp.token);
            this.spinner = false;
            this.dialogRef.close(resp.user);
          }, (error) => {
            this.openSnackbar(error.error.msg);
            this.spinner = false;
          });
      }

    } else {
      this.openSnackbar("You must fill in all the fields");
    }

  }

  sendNotification(user: User, token: string) {
    const mail: any = {};
    mail.from = 'TlCargo System Notification Service';
    mail.to = user.email;
    mail.subject = 'Complete the user creation in TLCargo System';
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>Please validate your Tlcargo app account</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <h2>Hi ${user.name}!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt"> Thanks for signing up!<br /><br /> Your account has been created, we will send you the credentials so you can enter into the Tlcargo App once you have validated your account.<br /> Please click on the following link to validate your account:<br /> </p> </td> </tr> <tr> <td style="padding: 30px"> <div align="center" valign="middle" style=" background: #ff7a59; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; letter-spacing: -0.5px; line-height: 150%; padding-top: 15px; padding-right: 30px; padding-bottom: 15px; padding-left: 30px; border-radius: 10px; " > <a href="${this_url}/#/active-user/${token}" target="_blank" style="color: #ffffff; text-decoration: none" > Confirm your email </a> </div> <br /> <br /> </td> </tr> </table> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> <a style="text-decoration: none; font-weight: bolder" href="https://www.tlcargo.net" >www.tlcargo.net</a > </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
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

  isValidField(field: string) {
    if (!this.form.get(field).valid && !(this.form.status === 'VALID')) {
      this.openSnackbar(`Error: ${field} field is invalid or is empty`);
      this.spinner = false;
      return false;
    } else {
      return true;
    }
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 20000,
      horizontalPosition: 'center'
    });
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

}
