import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Shipper } from '../interfaces/shipper.model';
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

import { ShipperService } from '../../../../services/shipper.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ServiceResponse} from '../../../../interfaces/service-response.interface';

@Component({
  selector: 'vex-shipper-create-update',
  templateUrl: './shipper-create-update.component.html',
  styleUrls: ['./shipper-create-update.component.scss']
})
export class ShipperCreateUpdateComponent implements OnInit {

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

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<ShipperCreateUpdateComponent>,
              private fb: FormBuilder,
              private shipperService: ShipperService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {} as Shipper;
    }

    this.form = this.fb.group({
      _id: [this.defaults._id],
      name: [this.defaults.name || '', [Validators.required]],
      email: [this.defaults.email || '', [Validators.required]],
      phoneNumber: [this.defaults.phoneNumber || '', [Validators.required]],
      onlyShipper: [!this.defaults.onlyShipper] || false
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createShipper();
    } else if (this.mode === 'update') {
      this.updateShipper();
    }
  }

  createShipper() {
    const shipper = this.form.value;
    this.spinner = true;
    if ('INVALID' !== this.form.status) {
      shipper.isShipper = true;
      shipper.onlyShipper = !shipper.onlyShipper;
      this.shipperService.createShipper(shipper).subscribe( (resp: ServiceResponse) => {
        this.spinner = false;
        this.dialogRef.close(shipper);
        this.openSnackbar(resp.msg);
      }, (error) => {
        this.spinner = false;
        this.dialogRef.close(shipper);
        this.openSnackbar(error.error.msg);
      });
    } else {
      this.openSnackbar('Please fill all the required fields');
    }

  }

  updateShipper() {
    const shipper = this.form.value;
    this.spinner = true;
    if ('INVALID' !== this.form.status) {
      if (this.defaults.onlyShipper === shipper.onlyShipper) {
        shipper.onlyShipper = !shipper.onlyShipper;
      }

      this.shipperService.updateShipper(shipper).subscribe( (resp: ServiceResponse) => {
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
}
