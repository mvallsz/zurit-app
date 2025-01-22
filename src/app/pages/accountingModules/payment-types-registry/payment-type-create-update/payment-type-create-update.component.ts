import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDownload from '@iconify/icons-ic/twotone-cloud-download';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icBox from '@iconify/icons-ic/twotone-room';
import icRule from '@iconify/icons-ic/twotone-rule';
import icMyLocation from '@iconify/icons-ic/twotone-my-location';
import icLocationCity from '@iconify/icons-ic/twotone-location-city';
import icEditLocation from '@iconify/icons-ic/twotone-edit-location';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ServiceResponse} from '../../../../interfaces/service-response.interface';
import {PaymentTypeService} from '../../../../services/payment-type.service';
import {PaymentType} from '../interfaces/payment-type.model';
import icMoney from '@iconify/icons-ic/monetization-on';
import icOfflineBolt from '@iconify/icons-ic/twotone-offline-bolt';

@Component({
  selector: 'vex-payment-type-create-update',
  templateUrl: './payment-type-create-update.component.html',
  styleUrls: ['./payment-type-create-update.component.scss']
})
export class PaymentTypeCreateUpdateComponent implements OnInit {

  static id = 100;

  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  icMoreVert = icMoreVert;
  icClose = icClose;

  icPrint = icPrint;
  icDownload = icDownload;
  icDelete = icDelete;

  icRule = icRule;
  icBox = icBox;
  icMyLocation = icMyLocation;
  icLocationCity = icLocationCity;
  icEditLocation = icEditLocation;
  icMoney = icMoney;
  icOfflineBolt = icOfflineBolt;
  icPhone = icPhone;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<PaymentTypeCreateUpdateComponent>,
              private fb: FormBuilder,
              private paymentTypeService: PaymentTypeService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {} as PaymentType;
    }

    this.form = this.fb.group({
      _id: [this.defaults._id],
      name: [this.defaults.name || '', [Validators.required]],
      type: [this.defaults.type || '', [Validators.required]],
      status: [this.defaults.status || '', [Validators.required]],
      notes: this.defaults.notes || ''
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createPaymentType();
    } else if (this.mode === 'update') {
      this.updatePaymentType();
    }
  }

  createPaymentType() {

    const paymentType = new PaymentType(this.form.value);

    if ('INVALID' !== this.form.status) {
      this.paymentTypeService.createPaymentType(paymentType).subscribe((resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
      }, (error) => this.openSnackbar(error.error.msg));
    } else {
      this.openSnackbar('Please fill all the required fields');
    }
  }

  updatePaymentType() {

    const paymentType = new PaymentType(this.form.value);

    if ('INVALID' !== this.form.status) {
      this.paymentTypeService.updatePaymentType(paymentType).subscribe((resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
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
