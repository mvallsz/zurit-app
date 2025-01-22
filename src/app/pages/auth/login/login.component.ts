import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { UsuarioService } from '../../../services/usuario.service';
import { NavigationService } from '../../../../@vex/services/navigation.service';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';


@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInUp400ms
  ]
})
export class LoginComponent implements OnInit {

  form: FormGroup;

  inputType = 'password';
  visible = false;
  spinner = false;

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;
  user: any;

  constructor(private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    localStorage.removeItem('menu');
    this.form = this.fb.group({
      email: [localStorage.getItem('email') || '', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  send() {
    this.spinner = true;

    this.usuarioService.login(this.form.value)
      .subscribe(resp => {
        if (resp.ok) {
          this.user = resp.data.user;

          this.spinner = false;

          this.openSnackbar('We are redirecting you to your user dashboard');

          if (this.form.get('remember').value) {
            localStorage.setItem('email', this.form.get('email').value);
          } else {
            localStorage.removeItem('email');
          }
          if (this.user.status === 4) {
            const sesion = {
              email: resp.user.email,
              token: resp.token,
              status: '1'
            };

            this.usuarioService.saveToken(sesion).subscribe((respS: ServiceResponse) => {
              if (respS.ok) {
                this.router.navigateByUrl('/reset-password/' + resp.token);
              } else {
                this.openSnackbar(respS.msg);
              }
            });
            return;
          }

          switch (this.user.role) {
            case 'ROOT':
              this.router.navigateByUrl('/app');
              break;
            case 'ADMIN':
              this.router.navigateByUrl('/app');
              break;

            case 'ACCA-ROLE':
              this.router.navigateByUrl('/app/guides-invoices');
              break;
            case 'WARE-ROLE':
              this.router.navigateByUrl('/app/guides');
              break;
            case 'DELI-ROLE':
              this.router.navigateByUrl('/app/guides');
              break;
            default:
              this.router.navigateByUrl('/app');
              break;
          }
        } else {
          this.spinner = false;
          this.openSnackbar(resp.msg);
          this.cd.detectChanges();
        }
      }, (error) => this.openSnackbar(error.error.msg));
  }

  openSnackbar(message: string) {
    this.snackbar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
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
}
