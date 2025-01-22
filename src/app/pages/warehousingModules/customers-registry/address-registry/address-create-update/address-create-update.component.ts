import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatSelect} from '@angular/material/select';

import { take, takeUntil} from 'rxjs/operators';
import { of, ReplaySubject, Subject} from 'rxjs';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDownload from '@iconify/icons-ic/twotone-cloud-download';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icPerson from '@iconify/icons-ic/twotone-person';
import icMyLocation from '@iconify/icons-ic/twotone-my-location';
import icEditLocation from '@iconify/icons-ic/twotone-edit-location';
import icMail from '@iconify/icons-ic/twotone-mail';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';

import countriesJson from '../../../../../../static-data/countries.json';
import statesJson from '../../../../../../static-data/states.json';
import citiesJson from '../../../../../../static-data/cities.json';

import { Address } from '../../interfaces/address.model';
import { Country } from '../../interfaces/country.model';
import { State } from '../../interfaces/state.model';
import { City } from '../../interfaces/city.model';
import { ServiceResponse } from '../../../../../interfaces/service-response.interface';

import { AddressService } from '../../../../../services/address.service';

@Component({
  selector: 'vex-address-create-update',
  templateUrl: './address-create-update.component.html',
  styleUrls: ['./address-create-update.component.scss']
})
export class AddressCreateUpdateComponent implements OnInit {

  protected countries: Country[] = [];
  public countryCtrl: FormControl = new FormControl();
  public countryFilterCtrl: FormControl = new FormControl( '', [ Validators.required ] );
  public filteredCountries: ReplaySubject<Country[]> = new ReplaySubject<Country[]>(0);
  @ViewChild('countrySelect', { static: true }) countrySelect: MatSelect;

  protected states: State[] = [];
  public stateCtrl: FormControl = new FormControl();
  public stateFilterCtrl: FormControl = new FormControl( '', [ Validators.required ] );
  public filteredStates: ReplaySubject<State[]> = new ReplaySubject<State[]>(0);
  @ViewChild('stateSelect', { static: true }) stateSelect: MatSelect;

  protected cities: City[] = [];
  public cityCtrl: FormControl = new FormControl();
  public cityFilterCtrl: FormControl = new FormControl( '', [ Validators.required ] );
  public filteredCities: ReplaySubject<City[]> = new ReplaySubject<City[]>(0);
  @ViewChild('citySelect', { static: true }) citySelect: MatSelect;

  protected _onDestroy = new Subject<void>();
  public selectionCtrl: FormControl = new FormControl();

  public countriesJsonVar: Country[] = countriesJson;
  public statesJsonVar: State[] = statesJson;
  // @ts-ignore
  public citiesJsonVar: City[] = citiesJson;

  mode: 'create' | 'update' = 'create';

  icMoreVert = icMoreVert;
  icClose = icClose;

  icPrint = icPrint;
  icDownload = icDownload;
  icDelete = icDelete;

  icPerson = icPerson;
  icMyLocation = icMyLocation;
  icEditLocation = icEditLocation;
  icPhone = icPhone;
  icMail = icMail;
  icArrowDropDown = icArrowDropDown;
  createAddressForm: FormGroup;
  selectedCountry: Country;
  selectedState: State;
  selectedCity: City;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<AddressCreateUpdateComponent>,
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

    if (this.defaults.address) {
      this.mode = 'update';

      // tslint:disable-next-line:max-line-length
      const selectedCountryArray: Country[] = this.countries.filter(country => country.name.toLowerCase().indexOf(this.defaults.country.toLowerCase()) > -1);
      this.selectedCountry = selectedCountryArray[0];

      this.getStates().subscribe(data => {
        this.states = data;
        this.filteredStates.next(this.states.filter(state => state.idCountry === this.selectedCountry.id));
      });

      // tslint:disable-next-line:max-line-length
      const selectedStateArray: State[] = this.states.filter(state => state.name.toLowerCase() === this.defaults.state.toLowerCase() && state.idCountry === this.selectedCountry.id);
      this.selectedState = selectedStateArray[0];

      this.getCities().subscribe(data => {
        this.cities = data;
        this.filteredCities.next(this.cities.filter(city => city.idState === this.selectedState.id));
      });

      // tslint:disable-next-line:max-line-length
      const selectedCitiesArray: City[] = this.cities.filter(city => (city.name.toLowerCase() === this.defaults.city.toLowerCase()  && city.idState === this.selectedState.id));
      this.selectedCity = selectedCitiesArray[0];

    } else {
      const customerId = this.defaults._id;
      this.defaults = {} as Address;
      this.defaults.customerId = customerId;
    }

    this.selectionCtrl.setValue('address');

    this.createAddressForm = new FormGroup({
      _id: new FormControl(this.defaults._id),
      address: new FormControl(this.defaults.address || '', Validators.required),
      address2: new FormControl(this.defaults.address2 || ''),
      zipcode: new FormControl(this.defaults.zipcode || '', Validators.required),
      status: new FormControl(this.defaults.status || '', Validators.required),
      type: new FormControl(this.defaults.type || '', Validators.required),
      customerId: new FormControl(this.defaults.customerId)
    });


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

  findStates(){

    const state: State = this.stateCtrl.value;
    const country: Country = this.countrySelect.value;
    this.cityCtrl.setValue('');
    this.createAddressForm.get('address').setValue('');
    this.createAddressForm.get('address2').setValue('');
    this.createAddressForm.get('zipcode').setValue('');

    if (!country){
      return;
    }

    this.getStates().subscribe(
      states => {
        // tslint:disable-next-line:no-shadowed-variable
        this.states = states.filter(state => state.idCountry === country.id );
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

  findCities(){

    const city: City = this.stateCtrl.value;
    const state: State = this.stateSelect.value;
    this.createAddressForm.get('address').setValue('');
    this.createAddressForm.get('address2').setValue('');
    this.createAddressForm.get('zipcode').setValue('');

    if (!city){
      return;
    }

    this.getCities().subscribe(
      cities => {
        // tslint:disable-next-line:no-shadowed-variable
        this.cities = cities.filter(city => city.idState === state.id );
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
      this.createAddress();
    } else if (this.mode === 'update') {
      this.updateAddress();
    }
  }

  createAddress() {
    const address: Address = this.createAddressForm.value;
    address.country = this.countrySelect.value.name;
    address.state = this.stateSelect.value.name;
    address.city = this.citySelect.value.name;
    this.addressService.createAddress(address).subscribe( (resp: ServiceResponse) => {
      this.dialogRef.close(address);
      this.openSnackbar(resp.msg);
    }, (error) => this.openSnackbar(error.error.msg));
  }

  updateAddress() {
    const address = this.createAddressForm.value;
    address.country = this.countrySelect.value.name;
    address.state = this.stateSelect.value.name;
    address.city = this.citySelect.value.name;
    this.addressService.updateAddress(address).subscribe( (resp: any) => {
      this.dialogRef.close(resp.data);
      this.openSnackbar(resp.msg);
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
