import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


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
import icCar from '@iconify/icons-ic/directions-car';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import icMoney from '@iconify/icons-ic/monetization-on';
import icMail from '@iconify/icons-ic/twotone-mail';

import { CarrierService } from '../../../../services/carrier.service';
import { Carrier } from '../interfaces/carrier.model';

@Component({
  selector: 'vex-carrier-create-update',
  templateUrl: './carrier-create-update.component.html',
  styleUrls: ['./carrier-create-update.component.scss']
})
export class CarrierCreateUpdateComponent implements OnInit {

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
  icCar = icCar;
  icArrow = icArrowDropDown;
  icMoney = icMoney;
  icMail = icMail;

  isOutgoing = false;
  public spinner = false;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<CarrierCreateUpdateComponent>,
              private fb: FormBuilder,
              private carrierService: CarrierService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
      this.isOutgoing = this.defaults.carrierType === '1';
    } else {
      this.defaults = {} as Carrier;
    }

    this.form = this.fb.group({
      _id: [this.defaults._id],
      name: [this.defaults.name || '', [Validators.required]],
      street: [this.defaults.street || '', [Validators.required]],
      city: [this.defaults.city || '', [Validators.required]],
      zipcode: [this.defaults.zipcode || '', [Validators.required]],
      phoneNumber: this.defaults.phoneNumber || '',
      email: this.defaults.email || '',
      notes: this.defaults.notes || '',
      carrierType: this.defaults.carrierType || 0,
      carrierRate: this.defaults.carrierRate || '',
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createCarrier();
    } else if (this.mode === 'update') {
      this.updateCarrier();
    }
  }

  createCarrier() {
    const carrier = this.form.value;
    this.spinner = true;
    if ('INVALID' !== this.form.status){
      this.carrierService.createCarriers(carrier).subscribe( (resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => this.openSnackbar(error.error.msg));
    } else {
      this.openSnackbar('Please fill all the required fields');
    }
  }

  updateCarrier() {
    const carrier = this.form.value;
    this.spinner = true;

    if ('INVALID' !== this.form.status){
      this.carrierService.updateCarriers(carrier).subscribe( (resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => this.openSnackbar(error.error.msg));
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

  openRate(){
    this.isOutgoing = this.form.controls.carrierType.value === '1';
  }
}
