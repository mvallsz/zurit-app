import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Warehouse } from '../interfaces/warehouse.model';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDownload from '@iconify/icons-ic/twotone-cloud-download';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icBuild from '@iconify/icons-ic/twotone-business-center';
import icMyLocation from '@iconify/icons-ic/twotone-my-location';
import icLocationCity from '@iconify/icons-ic/twotone-location-city';
import icEditLocation from '@iconify/icons-ic/twotone-edit-location';
import {MatSnackBar} from '@angular/material/snack-bar';
import {WarehouseLocationService} from '../../../../services/warehouse-location.service';
import {ServiceResponse} from '../../../../interfaces/service-response.interface';
import icMail from '@iconify/icons-ic/twotone-mail';

@Component({
  selector: 'vex-warehouse-location-create-update',
  templateUrl: './warehouse-location-create-update.component.html',
  styleUrls: ['./warehouse-location-create-update.component.scss']
})
export class WarehouseLocationCreateUpdateComponent implements OnInit {

  static id = 100;

  form: FormGroup;
  mode: 'create' | 'update' = 'create';

  icMoreVert = icMoreVert;
  icClose = icClose;

  icPrint = icPrint;
  icDownload = icDownload;
  icDelete = icDelete;

  icBuild = icBuild;
  icMyLocation = icMyLocation;
  icLocationCity = icLocationCity;
  icEditLocation = icEditLocation;
  icPhone = icPhone;
  icMail = icMail;
  public spinner = false;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
              private dialogRef: MatDialogRef<WarehouseLocationCreateUpdateComponent>,
              private fb: FormBuilder,
              private warehouseService: WarehouseLocationService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {} as Warehouse;
    }

    this.form = this.fb.group({
      _id: [this.defaults._id],
      name: [this.defaults.name || '', [Validators.required]],
      street: [this.defaults.street || '', [Validators.required]],
      city: [this.defaults.city || '', [Validators.required]],
      zipcode: [this.defaults.zipcode || '', [Validators.required]],
      mail: [this.defaults.mail || '', [Validators.required]],
      phoneNumber: [this.defaults.phoneNumber || '', [Validators.required]],
      labels: this.defaults.labels || '',
      notes: this.defaults.notes || ''
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createWarehouse();
    } else if (this.mode === 'update') {
      this.updateWarehouse();
    }
  }

  createWarehouse() {
    const warehouse = this.form.value;
    this.spinner = true;
    if ('INVALID' !== this.form.status) {
      this.warehouseService.createWarehouse(warehouse).subscribe( (resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => this.openSnackbar(error.error.msg));
    } else {
      this.openSnackbar('Please fill all the required fields');
    }
  }

  updateWarehouse() {
    const warehouse = this.form.value;
    this.spinner = true;
    if ('INVALID' !== this.form.status) {
      this.warehouseService.updateWarehouse(warehouse).subscribe( (resp: ServiceResponse) => {
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
