import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from '../interfaces/customer.model';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../../../services/customer.service';
import { Country } from '../interfaces/country.model';
import { of, ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { State } from '../interfaces/state.model';
import { City } from '../interfaces/city.model';
import countriesJson from '../../../../../static-data/countries.json';
import statesJson from '../../../../../static-data/states.json';
import citiesJson from '../../../../../static-data/cities.json';
import { take, takeUntil } from 'rxjs/operators';
import { AddressService } from '../../../../services/address.service';
import { Address } from '../interfaces/address.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import * as EmailValidator from "email-validator";

@Component({
  selector: 'vex-customer-create-update',
  templateUrl: './customer-create-update.component.html',
  styleUrls: ['./customer-create-update.component.scss']
})
export class CustomerCreateUpdateComponent implements OnInit {
  protected countries: Country[] = [];
  public countryCtrl: FormControl = new FormControl('', [Validators.required]);
  public countryFilterCtrl: FormControl = new FormControl();
  public filteredCountries: ReplaySubject<Country[]> = new ReplaySubject<Country[]>(0);
  @ViewChild('countrySelect', { static: true }) countrySelect: MatSelect;

  protected states: State[] = [];
  public stateCtrl: FormControl = new FormControl('', [Validators.required]);
  public stateFilterCtrl: FormControl = new FormControl();
  public filteredStates: ReplaySubject<State[]> = new ReplaySubject<State[]>(0);
  @ViewChild('stateSelect', { static: true }) stateSelect: MatSelect;

  protected cities: City[] = [];
  public cityCtrl: FormControl = new FormControl('', [Validators.required]);
  public cityFilterCtrl: FormControl = new FormControl();
  public filteredCities: ReplaySubject<City[]> = new ReplaySubject<City[]>(0);
  @ViewChild('citySelect', { static: true }) citySelect: MatSelect;

  protected _onDestroy = new Subject<void>();
  public selectionCtrl: FormControl = new FormControl();

  public countriesJsonVar: Country[] = countriesJson;
  public statesJsonVar: State[] = statesJson;
  // @ts-ignore
  public citiesJsonVar: City[] = citiesJson;

  countryNameSelected = '';

  countriesJ: {};
  statesJ: {};
  citiesJ: {};

  form: FormGroup;
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

  selectedCountry: Country;
  selectedState: State;
  selectedCity: City;

  public addressCtrl: FormControl = new FormControl('', [Validators.required]);
  public address2Ctrl: FormControl = new FormControl('', [Validators.required]);
  public zipcodeCtrl: FormControl = new FormControl('', [Validators.required]);

  public nameCtrl: FormControl = new FormControl('', [Validators.required]);
  public emailCtrl: FormControl = new FormControl('', [Validators.required]);
  public phoneNumberCtrl: FormControl = new FormControl('', [Validators.required]);
  public notesCtrl: FormControl = new FormControl();
  public isShipperCtrl: FormControl = new FormControl();

  public address: Address;
  public spinner = false;
  constructor(@Inject(MAT_DIALOG_DATA) public defaults: Customer,
    private dialogRef: MatDialogRef<CustomerCreateUpdateComponent>,
    private customerService: CustomerService,
    private addressService: AddressService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {

    this.getCountries().subscribe(
      data => {
        this.countries = data;

        this.filteredCountries.next(this.countries.slice());
        this.countryFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCountries();
          });
      }, error => {
        this.openSnackbar(error.error.msg);
      }
    );

    if (this.defaults) {
      this.mode = 'update';


      this.nameCtrl.setValue(this.defaults.name || '');
      this.emailCtrl.setValue(this.defaults.email || '');
      this.phoneNumberCtrl.setValue(this.defaults.phoneNumber || '');
      this.notesCtrl.setValue(this.defaults.notes || '');
      this.isShipperCtrl.setValue(this.defaults.isShipper || false);

      this.addressService.getAddress(this.defaults._id.toString())
        .subscribe((resp: ServiceResponse) => {
          if (resp.data.length > 0) {
            this.address = resp.data[0];
            // tslint:disable-next-line:max-line-length
            const selectedCountryArray: Country[] = this.countries.filter(country => country.name.toLowerCase().indexOf(this.address.country.toLowerCase()) > -1);
            this.selectedCountry = selectedCountryArray[0];

            this.getStates().subscribe(data => {
              this.states = data;
              this.filteredStates.next(this.states.filter(state => state.idCountry === this.selectedCountry.id));
            });

            // tslint:disable-next-line:max-line-length
            const selectedStateArray: State[] = this.states.filter(state => state.name.toLowerCase() === this.address.state.toLowerCase() && state.idCountry === this.selectedCountry.id);
            this.selectedState = selectedStateArray[0];

            this.getCities().subscribe(data => {
              this.cities = data;
              this.filteredCities.next(this.cities.filter(city => city.idState === this.selectedState.id));
            });

            // tslint:disable-next-line:max-line-length
            const selectedCitiesArray: City[] = this.cities.filter(city => (city.name.toLowerCase() === this.address.city.toLowerCase() && city.idState === this.selectedState.id));
            this.selectedCity = selectedCitiesArray[0];

            this.addressCtrl.setValue(this.address.address);
            this.address2Ctrl.setValue(this.address.address2);
            this.zipcodeCtrl.setValue(this.address.zipcode);
          } else {
            this.openSnackbar('No Address registered for this customer, please add one');
          }
        });

    } else {
      this.defaults = {} as Customer;
    }

  }

  getCountries() {
    return of(this.countriesJsonVar.map(country => new Country(country)));
  }

  getStates() {
    return of(this.statesJsonVar.map(state => new State(state)));
  }

  getCities() {
    return of(this.citiesJsonVar.map(city => new City(city)));
  }

  protected setInitialCountry() {
    this.filteredCountries
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.countrySelect.compareWith = (a: Country, b: Country) => a && b && a.id === b.id;
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
      this.countries.filter(country => country.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected setInitialState() {
    this.filteredStates
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.stateSelect.compareWith = (a: State, b: State) => a && b && a.id === b.id;
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
      this.states.filter(state => state.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected setInitialCity() {
    this.filteredCities
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.citySelect.compareWith = (a: City, b: City) => a && b && a.id === b.id;
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
      this.cities.filter(city => city.name.toLowerCase().indexOf(search) > -1)
    );
  }

  findStates() {

    const state: State = this.stateCtrl.value;
    const country: Country = this.countrySelect.value;
    this.cityCtrl.setValue('');

    if (!country) {
      return;
    }

    this.getStates().subscribe(
      states => {
        // tslint:disable-next-line:no-shadowed-variable
        this.states = states.filter(state => state.idCountry === country.id);
        this.filteredStates.next(this.states.slice());
        this.stateFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterStates();
          });

        //   this.setInitialState();

      },
      err => {
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
      cities => {
        // tslint:disable-next-line:no-shadowed-variable
        this.cities = cities.filter(city => city.idState === state.id);
        this.filteredCities.next(this.cities.slice());
        this.cityFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCities();
          });

        this.setInitialCity();

      },
      err => {
        this.openSnackbar(err.error.msg);
      }
    );

  }

  save() {
    if (this.mode === 'create') {
      this.createCustomer();
    } else if (this.mode === 'update') {
      this.updateCustomer();
    }
  }

  async send() {
    if (
      this.isValidField(this.addressCtrl, "Address") &&
      this.isValidField(this.nameCtrl, "Name") &&
      this.isValidField(this.emailCtrl, "Email") &&
      this.isValidField(this.phoneNumberCtrl, "Phone Number") &&
      this.isValidField(this.cityCtrl, "City")
    ) {
      if (await this.isValidEmail(this.emailCtrl)) {
        if (this.mode === 'create') {
          this.createCustomer();
        } else if (this.mode === 'update') {
          this.updateCustomer();
        }
      }
    }
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
      this.openSnackbar(`Error: ${msg} It is invalid or empty`);
      this.spinner = false;
      return false;
    } else {
      return true;
    }
  }

  createCustomer() {
    this.spinner = true;
    const customer: Customer = {} as Customer;

    customer.name = this.nameCtrl.value;
    customer.email = this.emailCtrl.value;
    customer.isShipper = this.isShipperCtrl.value;
    customer.notes = this.notesCtrl.value;
    customer.phoneNumber = this.phoneNumberCtrl.value;

    this.address = new Address({});
    this.address.country = this.countryCtrl.value.name;
    this.address.state = this.stateCtrl.value.name;
    this.address.city = this.cityCtrl.value.name;
    this.address.address = this.addressCtrl.value;
    this.address.address2 = this.address2Ctrl.value;
    this.address.zipcode = this.zipcodeCtrl.value;

    this.customerService.createCustomer(customer).subscribe((resp: ServiceResponse) => {
      if (resp.ok) {
        this.address.customerId = resp.data._id;
        this.addressService.createAddress(this.address).subscribe(
          (respAdd: ServiceResponse) => {
            this.spinner = false;
            this.dialogRef.close(resp.data);
            this.openSnackbar(resp.msg);
          }, (error) => {
            this.spinner = false;
            this.dialogRef.close(customer);
            this.openSnackbar(error.error.msg);
          }
        );
      } else {
        this.spinner = false;
        this.dialogRef.close();
        this.openSnackbar(resp.msg);
      }
    }, (error) => {
      this.spinner = false;
      this.dialogRef.close();
      this.openSnackbar(error.error.msg);
    });
  }

  updateCustomer() {
    const customer: Customer = {} as Customer;
    this.spinner = true;
    customer.name = this.nameCtrl.value;
    customer.email = this.emailCtrl.value;
    customer.isShipper = this.isShipperCtrl.value;
    customer.notes = this.notesCtrl.value;
    customer.phoneNumber = this.phoneNumberCtrl.value;
    customer._id = this.defaults._id;

    let isNewAddress = false;

    if (!this.address) {
      this.address = new Address({});
      isNewAddress = true;
    }
    this.address.country = this.countryCtrl.status !== 'INVALID' ? this.countryCtrl.value.name : '';
    this.address.state = this.stateCtrl.status !== 'INVALID' ? this.stateCtrl.value.name : '';
    this.address.city = this.cityCtrl.status !== 'INVALID' ? this.cityCtrl.value.name : '';
    this.address.address = this.addressCtrl.value;
    this.address.address2 = this.address2Ctrl.value;
    this.address.zipcode = this.zipcodeCtrl.value;

    this.customerService.updateCustomer(customer).subscribe((resp: ServiceResponse) => {
      this.address.customerId = resp.data._id;

      if (this.address.address !== '') {
        if (isNewAddress) {
          this.addressService.createAddress(this.address).subscribe(
            (respAdd: ServiceResponse) => {
              this.dialogRef.close(resp.data);
              this.openSnackbar(resp.msg);
              this.spinner = false;
            }, (error) => this.openSnackbar(error.error.msg)
          );
        } else {

          this.addressService.updateAddress(this.address).subscribe(
            (respAdd: ServiceResponse) => {
              this.dialogRef.close(resp.data);
              this.openSnackbar(resp.msg);
              this.spinner = false;
            }, (error) => this.openSnackbar(error.error.msg)
          );
        }
      } else {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
      }
    }, (error) => this.openSnackbar(error.error.msg));
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }
}
