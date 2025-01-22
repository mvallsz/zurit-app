/* tslint:disable:whitespace no-trailing-whitespace */
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import {
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import * as EmailValidator from "email-validator";

import { MatSnackBar } from "@angular/material/snack-bar";

import { fadeInUp400ms } from "../../../../@vex/animations/fade-in-up.animation";

import icVisibility from "@iconify/icons-ic/twotone-visibility";
import icVisibilityOff from "@iconify/icons-ic/twotone-visibility-off";

import { UsuarioService } from "../../../services/usuario.service";
import { MailService } from "../../../services/mail.service";

import { User } from '../../adminModules/users-registry/interfaces/users.model';
import { Country } from "../../warehousingModules/customers-registry/interfaces/country.model";
import { ReplaySubject, Subject, of } from "rxjs";
import { MatSelect } from "@angular/material/select";
import { State } from "../../warehousingModules/customers-registry/interfaces/state.model";
import { City } from "../../warehousingModules/customers-registry/interfaces/city.model";

import countriesJson from "../../../../static-data/countries.json";
import statesJson from "../../../../static-data/states.json";
import citiesJson from "../../../../static-data/cities.json";

import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import icClose from "@iconify/icons-ic/twotone-close";
import icPrint from "@iconify/icons-ic/twotone-print";
import icDownload from "@iconify/icons-ic/twotone-cloud-download";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icPerson from "@iconify/icons-ic/twotone-person";
import icMyLocation from "@iconify/icons-ic/twotone-my-location";
import icLocationCity from "@iconify/icons-ic/twotone-location-city";
import icEditLocation from "@iconify/icons-ic/twotone-edit-location";
import icMail from "@iconify/icons-ic/twotone-mail";
import { Address } from "../../warehousingModules/customers-registry/interfaces/address.model";
import { take, takeUntil } from "rxjs/operators";
import { Customer } from "../../warehousingModules/customers-registry/interfaces/customer.model";
import { CustomerService } from "src/app/services/customer.service";
import { AddressService } from "src/app/services/address.service";
import { ServiceResponse } from "src/app/interfaces/service-response.interface";
import { RegisterForm } from "src/app/interfaces/register-form.interface";
import Swal from "sweetalert2";

import { environment } from "../../../../environments/environment";
const this_url = environment.this_url;
const available_countries = environment.available_countries;


@Component({
  selector: "vex-register",
  templateUrl: "./customer-register.component.html",
  styleUrls: ["./customer-register.component.scss"],
  animations: [fadeInUp400ms],
})
export class CustomerRegisterComponent implements OnInit {
  protected countries: Country[] = [];
  public countryCtrl: FormControl = new FormControl("", [Validators.required]);
  public countryFilterCtrl: FormControl = new FormControl();
  public filteredCountries: ReplaySubject<Country[]> = new ReplaySubject<
    Country[]
  >(0);
  @ViewChild("countrySelect", { static: true }) countrySelect: MatSelect;

  protected states: State[] = [];
  public stateCtrl: FormControl = new FormControl("", [Validators.required]);
  public stateFilterCtrl: FormControl = new FormControl();
  public filteredStates: ReplaySubject<State[]> = new ReplaySubject<State[]>(0);
  @ViewChild("stateSelect", { static: true }) stateSelect: MatSelect;

  protected cities: City[] = [];
  public cityCtrl: FormControl = new FormControl("", [Validators.required]);
  public cityFilterCtrl: FormControl = new FormControl();
  public filteredCities: ReplaySubject<City[]> = new ReplaySubject<City[]>(0);
  @ViewChild("citySelect", { static: true }) citySelect: MatSelect;

  protected _onDestroy = new Subject<void>();
  public selectionCtrl: FormControl = new FormControl();

  public countriesJsonVar: Country[] = countriesJson;
  public statesJsonVar: State[] = statesJson;
  // @ts-ignore
  public citiesJsonVar: City[] = citiesJson;

  countryNameSelected = "";

  countriesJ: {};
  statesJ: {};
  citiesJ: {};

  form: FormGroup;
  mode: "create" | "update" = "create";

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

  selectedCountry: Country;
  selectedState: State;
  selectedCity: City;

  public addressCtrl: FormControl = new FormControl("", [Validators.required]);
  public address2Ctrl: FormControl = new FormControl("");
  public zipcodeCtrl: FormControl = new FormControl("");

  public termsCtrl: FormControl = new FormControl("", [Validators.required]);
  public nameCtrl: FormControl = new FormControl("", [Validators.required]);
  public emailCtrl: FormControl = new FormControl("", [Validators.required]);
  public phoneNumberCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);

  public passwordCtrl: FormControl = new FormControl("", [Validators.required]);
  public passwordConfirmCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);

  public address: Address;
  public spinner = false;

  isFormOk = true;
  inputType = "password";
  visible = false;

  passwordOptions = {
    placement: "bottom",
    theme: "pro",
    heading: "Requerimientos de seguridad",
    successMessage: "Wow! Password is Strong.",
    password: {
      type: "range",
      min: 8,
      max: 15,
    },
    shadow: false,
    offset: 15,
  };

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  public final_url = this_url;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private usuarioService: UsuarioService,
    private mailService: MailService,
    private customerService: CustomerService,
    private addressService: AddressService
  ) { }

  ngOnInit() {
    this.getCountries().subscribe(
      (data) => {
        this.countries = data;

        this.filteredCountries.next(this.countries.slice());
        this.countryFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCountries();
          });
      },
      (error) => {
        this.openSnackbar(error.error.msg);
      }
    );
  }

  getCountries() {
    return of(this.countriesJsonVar.map((country) => new Country(country)).filter((country) => available_countries.includes(country.name)));
  }

  getStates() {
    return of(this.statesJsonVar.map((state) => new State(state)));
  }

  getCities() {
    return of(this.citiesJsonVar.map((city) => new City(city)));
  }

  protected setInitialCountry() {
    this.filteredCountries
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.countrySelect.compareWith = (a: Country, b: Country) =>
          a && b && a.id === b.id;
      });
  }

  protected filterCountries() {
    if (!this.countries) {
      return;
    }
    let search = this.countryFilterCtrl.value;
    if (!search) {
      this.filteredCountries.next(this.countries.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredCountries.next(
      this.countries.filter(
        (country) => country.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  protected setInitialState() {
    this.filteredStates
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.stateSelect.compareWith = (a: State, b: State) =>
          a && b && a.id === b.id;
      });
  }

  protected filterStates() {
    if (!this.states) {
      return;
    }
    let search = this.stateFilterCtrl.value;
    if (!search) {
      this.filteredStates.next(this.states.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredStates.next(
      this.states.filter(
        (state) => state.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  protected setInitialCity() {
    this.filteredCities
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.citySelect.compareWith = (a: City, b: City) =>
          a && b && a.id === b.id;
      });
  }

  protected filterCities() {
    if (!this.cities) {
      return;
    }
    let search = this.cityFilterCtrl.value;
    if (!search) {
      this.filteredCities.next(this.cities.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredCities.next(
      this.cities.filter((city) => city.name.toLowerCase().indexOf(search) > -1)
    );
  }

  findStates() {
    const state: State = this.stateCtrl.value;
    const country: Country = this.countrySelect.value;
    this.cityCtrl.setValue("");

    if (!country) {
      return;
    }

    this.getStates().subscribe(
      (states) => {
        // tslint:disable-next-line:no-shadowed-variable
        this.states = states.filter((state) => state.idCountry === country.id);
        this.filteredStates.next(this.states.slice());
        this.stateFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterStates();
          });

        //   this.setInitialState();
      },
      (err) => {
        this.openSnackbar(err.error.msg);
      }
    );
  }

  findCities() {
    const city: City = this.stateCtrl.value;
    const state: State = this.stateSelect.value;
    if (!city) {
      return;
    }

    this.getCities().subscribe(
      (cities) => {
        // tslint:disable-next-line:no-shadowed-variable
        this.cities = cities.filter((city) => city.idState === state.id);
        this.filteredCities.next(this.cities.slice());
        this.cityFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCities();
          });

        this.setInitialCity();
      },
      (err) => {
        this.openSnackbar(err.error.msg);
      }
    );
  }

  async send() {
    if (
      this.isValidField(this.addressCtrl, "Dirección") &&
      this.isValidField(this.nameCtrl, "Nombre") &&
      this.isValidField(this.emailCtrl, "Correo electrónico") &&
      this.isValidField(this.phoneNumberCtrl, "Numero telefónico") &&
      this.isValidField(this.passwordCtrl, "Password") &&
      this.isValidField(this.cityCtrl, "Ciudad") &&
      this.isValidField(this.passwordConfirmCtrl, "Confirmación de password")
    ) {
      if (await this.isValidEmail(this.emailCtrl)) {
        if (
          this.isPasswordsMatch(
            this.passwordCtrl.value,
            this.passwordConfirmCtrl.value
          )
        ) {
          if (this.isTermsAccepted()) {
            this.createCustomer();
          }
        }
      }
    }
  }

  sendNotification(user: User, token: string) {
    const mail: any = {};

    mail.from = "TlCargo System Notification Service";
    mail.to = user.email;
    mail.subject = "Completa la creación del casillero en TLCARGO";
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } .buttonReg { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> </tr> <tr></tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>¡Casi listos con tu casillero TL CARGO!</h2> </td> </tr> <tr> <td bgcolor="#5DADE2" align="center" style="color: white"> <h2>Hola ${user.name}!</h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <div style="text-align: justify; font-size: large; padding: 20px"> Gracias por crear un casillero con nosotros, en TLCargo somos Lideres en el manejo de mercancia para pequeñas y medianas empresas, brindamos un servicios Puerta a Puerta a toda Venezuela y Latinoamerica.<br /><br /> Para poder habilitar tu cuenta es necesario que confirmes tu correo electrónico a continuación <br /> <br /> <div align="center" valign="middle" style=" background: #ff7a59; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; letter-spacing: -0.5px; line-height: 150%; padding-top: 15px; padding-right: 30px; padding-bottom: 15px; padding-left: 30px; border-radius: 10px; " > <a href="${this_url}/#/active-customer/${token}" target="_blank" style="color: #ffffff; text-decoration: none" > Confirma tu correo </a> </div> </div> </td> </tr> <tr> <td style="text-align: center; font-size: small"> <a href="${this_url}/assets/docs/Condiciones Generales TLCargo 2023.pdf" target="_blank" style="color: #000; text-decoration: underline" > Acá puedes encontrar nuestros términos y condiciones </a> <br /> <br /> </td> </tr> <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> ¡Gracias por preferirnos! <br /> <a style="color: #000; text-decoration: none" href="https://www.tlcargo.net" >www.tlcargo.net</a > </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts; </span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTMLCreate(mail).subscribe((resp: any) => {
      setTimeout(() => {
        window.location.href = "https://www.tlcargo.net";
      }, 3000);
    });
  }

  async isValidEmail(field: FormControl) {
    if (EmailValidator.validate(field.value)) {
      return true;
    } else {
      this.openSnackbar(`Error: El correo es invalido`);
      this.spinner = false;
      return false;
    }
  }

  isValidField(field: FormControl, msg: String) {
    if (!field.valid && !(field.status === "VALID")) {
      this.openSnackbar(`Error: Campo ${msg} es invalido o esta vacio`);
      this.spinner = false;
      return false;
    } else {
      return true;
    }
  }

  isTermsAccepted() {
    if (!this.termsCtrl.value) {
      this.openSnackbar(
        `Debes aceptar los terminos y condiciones para poder continuar`
      );
      this.spinner = false;
      return false;
    } else {
      return true;
    }
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 20000,
      horizontalPosition: "center",
    });
  }

  createUser(customer: Customer) {
    let user: RegisterForm;

    user = {
      email: this.emailCtrl.value,
      name: this.nameCtrl.value,
      password: this.passwordCtrl.value,
      phone: this.phoneNumberCtrl.value,
      role: "CUST_ROLE",
    };

    this.usuarioService.crearUser(user).subscribe(
      (resp: any) => {
        Swal.fire(
          "Revisa tu correo y sigue las instrucciones para validar tu casillero",
          "",
          "info"
        );
        this.sendNotification(resp.user, resp.token);
      },
      (error) => {
        this.openSnackbar(error.error.msg);
      }
    );
  }

  createCustomer() {
    this.spinner = true;
    const customer: Customer = {} as Customer;

    customer.name = this.nameCtrl.value;
    customer.email = this.emailCtrl.value;
    customer.isShipper = true;
    customer.notes = "Generado por registro de clientes";
    customer.phoneNumber = this.phoneNumberCtrl.value;

    this.address = new Address({});
    this.address.country = this.countryCtrl.value.name;
    this.address.state = this.stateCtrl.value.name;
    this.address.city = this.cityCtrl.value.name;
    this.address.address = this.addressCtrl.value;
    this.address.address2 = this.address2Ctrl.value;
    this.address.zipcode = this.zipcodeCtrl.value;

    this.usuarioService
      .validarEmail(this.emailCtrl.value)
      .subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.customerService.createCustomerIntra(customer).subscribe(
            (respC: ServiceResponse) => {
              if (respC.ok) {
                this.address.customerId = respC.data._id;
                this.addressService.createAddressIntra(this.address).subscribe(
                  (respAdd: ServiceResponse) => {
                    this.spinner = false;
                    this.createUser(respC.data);
                  },
                  (error) => {
                    this.spinner = false;
                    this.openSnackbar(error.error.msg);
                  }
                );
              } else {
                this.spinner = false;
                this.openSnackbar(resp.msg);
              }
            },
            (error) => {
              this.spinner = false;
              this.openSnackbar(error.error.msg);
            }
          );
        } else {
          this.spinner = false;
          this.openSnackbar(resp.msg);
        }
      });
  }

  isPasswordsMatch(pass1: string, pass2: string): boolean {
    if (pass1 !== pass2) {
      this.openSnackbar("Los passwords no coinciden");
      return false;
    } else {
      return true;
    }
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = "password";
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = "text";
      this.visible = true;
      this.cd.markForCheck();
    }
  }
}
