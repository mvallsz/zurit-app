import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

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

import { WarehouseLocationService } from '../../../../services/warehouse-location.service';
import { ShippingService } from '../../../../services/shipping.service';
import { CarrierService } from '../../../../services/carrier.service';

import { ShippingEnt } from '../interfaces/shipping.model';
import { Warehouse } from '../../../adminModules/warehouse-location-registry/interfaces/warehouse.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { Carrier } from '../../../adminModules/curriers-registry/interfaces/carrier.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'vex-shipping-create-update',
  templateUrl: './shipping-create-update.component.html',
  styleUrls: ['./shipping-create-update.component.scss']
})
export class ShippingCreateUpdateComponent implements OnInit {

  protected departureHubs: Warehouse[] = [];
  public departureHubCtrl: FormControl = new FormControl();
  public departureHubFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredDepartureHub: ReplaySubject<Warehouse[]> = new ReplaySubject<Warehouse[]>(0);
  @ViewChild('departureHubSelect', { static: true }) departureHubSelect: MatSelect;

  protected arrivalHubs: Warehouse[] = [];
  public arrivalHubCtrl: FormControl = new FormControl();
  public arrivalHubFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredArrivalHub: ReplaySubject<Warehouse[]> = new ReplaySubject<Warehouse[]>(0);
  @ViewChild('arrivalHubSelect', { static: true }) arrivalHubSelect: MatSelect;

  protected carriers: Carrier[] = [];
  public carriersCtrl: FormControl = new FormControl();
  public carriersFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredCarrier: ReplaySubject<Carrier[]> = new ReplaySubject<Carrier[]>(0);
  @ViewChild('carrierSelect', { static: true }) carrierSelect: MatSelect;


  public nameCtrl: FormControl = new FormControl('', [Validators.required]);
  public typeCtrl: FormControl = new FormControl('', [Validators.required]);
  public departureDateCtrl: FormControl = new FormControl('', [Validators.required]);
  public arrivalDateCtrl: FormControl = new FormControl('', [Validators.required]);
  public notesCtrl: FormControl = new FormControl('',);

  protected _onDestroy = new Subject<void>();

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
  public spinner = false;

  myFilter = (d: Date | null): boolean => {
    const date = (d || new Date());
    const now = new Date();
    return date.setHours(0, 0, 0, 0) >= now.setHours(0, 0, 0, 0);
  }

  myFilter2 = (d: Date | null): boolean => {
    const date = (d || new Date());
    const now = new Date();
    return date.setHours(0, 0, 0, 0) > now.setHours(0, 0, 0, 0);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: ShippingEnt,
    private dialogRef: MatDialogRef<ShippingCreateUpdateComponent>,
    private warehouseLocationService: WarehouseLocationService,
    private shippingService: ShippingService,
    private carrierService: CarrierService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {

    this.warehouseLocationService.getWarehouse()
      .subscribe((resp: ServiceResponse) => {

        this.departureHubs = resp.data;
        this.filteredDepartureHub.next(this.departureHubs.slice());
        this.departureHubFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterDepartureHub();
          });

        this.arrivalHubs = resp.data;
        this.filteredArrivalHub.next(this.arrivalHubs.slice());
        this.arrivalHubFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterArrivalHub();
          });
      });

    this.carrierService.getOutgoingCarriers().subscribe((resp: ServiceResponse) => {
      this.carriers = resp.data;
      this.filteredCarrier.next(this.carriers.slice());
      this.carriersFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterCarrier();
        });
    });

    if (this.defaults) {
      this.mode = 'update';
      this.nameCtrl.setValue(this.defaults.name || '');
      this.typeCtrl.setValue(this.defaults.type || '');
      this.departureDateCtrl.setValue(this.defaults.departureDate || '');
      this.arrivalDateCtrl.setValue(this.defaults.arrivalDate || '');
      this.notesCtrl.setValue(this.defaults.notes || '');
      this.departureHubCtrl.setValue(this.defaults.departureHub._id);
      this.arrivalHubCtrl.setValue(this.defaults.arrivalHub._id);
      this.carriersCtrl.setValue(this.defaults.carrier._id);
    } else {
      this.defaults = {} as ShippingEnt;
    }

  }

  save() {
    if (this.mode === 'create') {
      this.createShipping();
    } else if (this.mode === 'update') {
      this.updateShipping();
    }
  }

  setDepartureDateonArrivalDateSelect() {

    this.myFilter2 = (d: Date | null): boolean => {
      const date = (d || new Date());
      return date.setHours(0, 0, 0, 0) > this.departureDateCtrl.value.setHours(0, 0, 0, 0);
    };

    this.arrivalDateCtrl.setValue(this.departureDateCtrl.value + 5);
  }
  createShipping() {
    this.spinner = true;
    const shipping: ShippingEnt = {} as ShippingEnt;

    shipping.name = this.nameCtrl.value;
    shipping.type = this.typeCtrl.value;
    shipping.notes = this.notesCtrl.value;
    shipping.departureDate = this.departureDateCtrl.value;
    shipping.arrivalDate = this.arrivalDateCtrl.value;
    shipping.arrivalHub = this.arrivalHubCtrl.value;
    shipping.departureHub = this.departureHubCtrl.value;
    shipping.carrier = this.carriersCtrl.value;

    this.shippingService.createShipping(shipping).subscribe((resp: any) => {
      this.dialogRef.close(resp.data);
      this.openSnackbar(resp.msg);
    }, (error) => this.openSnackbar(error.error.msg));

  }

  updateShipping() {
    this.spinner = true;
    const shipping: ShippingEnt = {} as ShippingEnt;

    shipping.name = this.nameCtrl.value;
    shipping.type = this.typeCtrl.value;
    shipping.notes = this.notesCtrl.value;
    shipping.departureDate = this.departureDateCtrl.value;
    shipping.arrivalDate = this.arrivalDateCtrl.value;
    shipping.arrivalHub = this.arrivalHubCtrl.value;
    shipping.departureHub = this.departureHubCtrl.value;
    shipping.carrier = this.carriersCtrl.value;
    shipping._id = this.defaults._id;

    if (+this.defaults.status < 2) {
      this.shippingService.updateShipping(shipping).subscribe((resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
      }, (error) => this.openSnackbar(error.error.msg));
    } else {
      Swal.fire(
        {
          icon: 'error',
          title: 'Oops...',
          text: 'You cannot modify the Shipping info once it becomes status IN TRANSIT'
        }
      );
    }

  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  protected filterDepartureHub() {
    if (!this.departureHubs) {
      return;
    }
    let search = this.departureHubFilterCtrl.value;
    if (!search) {
      this.filteredDepartureHub.next(this.departureHubs.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredDepartureHub.next(
      this.departureHubs.filter(departureHub => departureHub.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterArrivalHub() {
    if (!this.arrivalHubs) {
      return;
    }
    let search = this.arrivalHubFilterCtrl.value;
    if (!search) {
      this.filteredArrivalHub.next(this.arrivalHubs.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredArrivalHub.next(
      this.arrivalHubs.filter(arrivalHub => arrivalHub.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterCarrier() {
    if (!this.carriers) {
      return;
    }
    let search = this.carriersFilterCtrl.value;
    if (!search) {
      this.filteredCarrier.next(this.carriers.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredCarrier.next(
      this.carriers.filter(carrier => carrier.name.toLowerCase().indexOf(search) > -1)
    );
  }

  setInitialDepartureHub() {
    this.filteredDepartureHub
      .pipe(take(0), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.departureHubSelect.compareWith = (a: Warehouse, b: Warehouse) => a && b && a.name === b.name;
      });
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

}
