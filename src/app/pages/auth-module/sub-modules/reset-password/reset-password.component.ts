import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../../admin-module/sub-modules/users/models/users.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../../services/modules/admin-module/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';

import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { RegisterForm } from '../../../../interfaces/register-form.interface';

@Component({
  selector: 'vex-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  isFormOk = true;
  inputType = 'password';
  visible = false;
  spinner = false;

  passwordOptions = {
    placement: 'bottom',
    theme: 'pro',
    password: {
      type: 'range',
      min: 8,
      max: 15,
    },
    shadow: false,
    offset: 15,
  };

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  usuarioValido: User;
  msg: string;
  constructor(private router: Router,
    private rutaActiva: ActivatedRoute,
    private userService: UsuarioService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {

    const token = this.rutaActiva.snapshot.params.token;
    this.form = this.fb.group({
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });

    this.userService.checkToken(token).subscribe((resp: any) => {
      this.userService.validarUser(resp.data).subscribe((validResp: any) => {
        this.usuarioValido = validResp.user;
        this.msg = validResp.msg;
        localStorage.setItem('token', token);
      }, (error) => this.toDoOnlyOnError(error));
    }, (error) => this.toDoOnlyOnError(error));
  }

  toDoOnlyOnError(error) {
    this.openSnackbar(`${error.error.msg} , redirecting you...`);
    this.router.navigate(['/']);
  }

  send() {

    if (this.isValidField('passwordConfirm') &&
      this.isValidField('password') &&
      this.isPasswordsMatch(this.form.get('password').value, this.form.get('passwordConfirm').value)) {

      this.spinner = true;
      const reqPassUpdate = { _id: this.usuarioValido._id.toString(), password: this.form.get('password').value };

      this.userService.actualizarPassword(reqPassUpdate).subscribe((validResp: any) => {
        localStorage.removeItem('token');
        this.openSnackbar(validResp.msg);
        this.router.navigate(['/']);
      }, (error) => this.toDoOnlyOnError(error));

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
    this.snackBar.open(message, 'CERRAR', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

  isPasswordsMatch(pass1: string, pass2: string): boolean {
    if (pass1 !== pass2) {
      this.openSnackbar('the passwords do not match');
      return false;
    } else {
      return true;
    }
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
}
