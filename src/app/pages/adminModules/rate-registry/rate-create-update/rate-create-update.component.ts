import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDownload from '@iconify/icons-ic/twotone-cloud-download';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icOn from '@iconify/icons-ic/outline-toggle-on';
import icMoney from '@iconify/icons-ic/monetization-on';
import icAirplane from '@iconify/icons-ic/airplanemode-active';
import icDescription from '@iconify/icons-ic/twotone-description';
import icOfflineBolt from '@iconify/icons-ic/twotone-offline-bolt';

import { Rate } from '../interfaces/rate.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { RateService } from '../../../../services/rate.service';
import {Country} from '../../../warehousingModules/customers-registry/interfaces/country.model';
import {of, ReplaySubject, Subject} from 'rxjs';
import {MatSelect} from '@angular/material/select';
import {State} from '../../../warehousingModules/customers-registry/interfaces/state.model';
import {City} from '../../../warehousingModules/customers-registry/interfaces/city.model';
import countriesJson from '../../../../../static-data/countries.json';
import statesJson from '../../../../../static-data/states.json';
import citiesJson from '../../../../../static-data/cities.json';
import {take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'vex-rate-create-update',
  templateUrl: './rate-create-update.component.html',
  styleUrls: ['./rate-create-update.component.scss']
})
export class RateCreateUpdateComponent implements OnInit {

  protected countries: Country[] = [];
  public countryCtrl: FormControl = new FormControl( '', [ Validators.required ]);
  public countryFilterCtrl: FormControl = new FormControl();
  public filteredCountries: ReplaySubject<Country[]> = new ReplaySubject<Country[]>(0);
  @ViewChild('countrySelect', { static: true }) countrySelect: MatSelect;

  protected states: State[] = [];
  public stateCtrl: FormControl = new FormControl( '', [ Validators.required ] );
  public stateFilterCtrl: FormControl = new FormControl();
  public filteredStates: ReplaySubject<State[]> = new ReplaySubject<State[]>(0);
  @ViewChild('stateSelect', { static: true }) stateSelect: MatSelect;

  protected cities: City[] = [];
  public cityCtrl: FormControl = new FormControl( '', [ Validators.required ] );
  public cityFilterCtrl: FormControl = new FormControl();
  public filteredCities: ReplaySubject<City[]> = new ReplaySubject<City[]>(0);
  @ViewChild('citySelect', { static: true }) citySelect: MatSelect;

  public countriesJsonVar: Country[] = countriesJson;
  public statesJsonVar: State[] = statesJson;
  // @ts-ignore
  public citiesJsonVar: City[] = citiesJson;

  protected _onDestroy = new Subject<void>();
  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  selectedCountry: Country;
  selectedState: State;
  selectedCity: City;

  icMoreVert = icMoreVert;
  icClose = icClose;

  icPrint = icPrint;
  icDownload = icDownload;
  icDelete = icDelete;


  icMoney = icMoney;
  icDescription = icDescription;
  icAirplane = icAirplane;
  icOfflineBolt = icOfflineBolt;
  public spinner = false;
  selectCity = false;
  public selectCityCtrl: FormControl = new FormControl( '' );


  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<RateCreateUpdateComponent>,
              private fb: FormBuilder,
              private rateService: RateService,
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
      if (this.defaults.city){
        this.selectCityCtrl.setValue(true);
        // tslint:disable-next-line:max-line-length
        const selectedCountryArray: Country[] = this.countries.filter(country => country.name.toLowerCase().indexOf(this.defaults.city.country.name.toLowerCase()) > -1);
        this.selectedCountry = selectedCountryArray[0];

        this.getStates().subscribe(data => {
          this.states = data;
          this.filteredStates.next(this.states.filter(state => state.idCountry === this.selectedCountry.id));
        });

        // tslint:disable-next-line:max-line-length
        const selectedStateArray: State[] = this.states.filter(state => state.name.toLowerCase() === this.defaults.city.state.name.toLowerCase() && state.idCountry === this.selectedCountry.id);
        this.selectedState = selectedStateArray[0];

        this.getCities().subscribe(data => {
          this.cities = data;
          this.filteredCities.next(this.cities.filter(city => city.idState === this.selectedState.id));
        });

        // tslint:disable-next-line:max-line-length
        const selectedCitiesArray: City[] = this.cities.filter(city => (city.name.toLowerCase() === this.defaults.city.city.name.toLowerCase()  && city.idState === this.selectedState.id));
        this.selectedCity = selectedCitiesArray[0];

      }
    } else {
      this.defaults = {} as Rate;
    }

    this.form = this.fb.group({
      _id: [this.defaults._id],
      name: [this.defaults.name || '', [Validators.required]],
      rate: [this.defaults.rate || '', [Validators.required]],
      type: [this.defaults.type || '', [Validators.required]],
      status: this.defaults.status || '',
      notes: this.defaults.notes || ''
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createRate();
    } else if (this.mode === 'update') {
      this.updateRate();
    }
  }

  createRate() {
    const rate = new Rate(this.form.value);
    if (this.selectCityCtrl.value === true){
      if (this.countryCtrl.status === 'VALID' &&
          this.stateCtrl.status === 'VALID' &&
          this.cityCtrl.status === 'VALID') {
        rate.city = {};
        rate.city.city = this.selectedCity;
        rate.city.state = this.selectedState;
        rate.city.country = this.selectedCountry;
      } else {
        this.openSnackbar('You need to select a city to complete the creation process!');
        this.spinner = false;
        return;
      }

    }
    this.spinner = true;
    if ('INVALID' !== this.form.status) {
      this.rateService.createRates(rate).subscribe((resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => {
        this.openSnackbar(error.error.msg);
        this.spinner = false;
      });
    } else {
      this.openSnackbar('Please fill all the required fields');
    }
  }

  updateRate() {
    this.spinner = true;

    const rate = new Rate(this.form.value);
    if (this.selectCityCtrl.value === true){
      if (this.countryCtrl.status === 'VALID' &&
        this.stateCtrl.status === 'VALID' &&
        this.cityCtrl.status === 'VALID') {

        rate.city = {};
        rate.city.city = this.selectedCity;
        rate.city.state = this.selectedState;
        rate.city.country = this.selectedCountry;

      } else {
        this.openSnackbar('You need to select a city to complete the update process!');
        this.spinner = false;
        return;
      }
    }

    if ('INVALID' !== this.form.status) {
      if ( this.defaults.city && this.selectCityCtrl.value === false ) {
        rate.city = '';
      }
      this.rateService.updateRates(rate).subscribe( (resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => {
        this.dialogRef.close();
        this.openSnackbar(error.error.msg);
      });
    } else {
      this.openSnackbar('Please fill all the required fields');
    }
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

    const country: Country = this.countryCtrl.value;
    this.cityCtrl.setValue('');

    if (!country){
      return;
    }

    this.getStates().subscribe(
      states => {
        this.states = states.filter(state => state.idCountry === country.id );
        this.filteredStates.next(this.states.slice());
        this.stateFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterStates();
          });
        },
      err => {
        this.openSnackbar(err.error.msg);
      }
    );

  }

  findCities(){

    const city: City = this.stateCtrl.value;
    const state: State = this.stateCtrl.value;
    if (!city){
      return;
    }

    this.getCities().subscribe(
      cities => {
        this.cities = cities.filter(cityF => cityF.idState === state.id );
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
}
