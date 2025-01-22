import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDownload from '@iconify/icons-ic/twotone-cloud-download';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icBox from '@iconify/icons-ic/twotone-room';
import icRule from '@iconify/icons-ic/twotone-rule';
import icMyLocation from '@iconify/icons-ic/twotone-my-location';
import icEditLocation from '@iconify/icons-ic/twotone-edit-location';

import { PackageTypeService } from '../../../../services/package-type.service';

import { PackageType } from '../interfaces/package-type.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';

@Component({
  selector: 'vex-package-type-create-update',
  templateUrl: './package-type-create-update.component.html',
  styleUrls: ['./package-type-create-update.component.scss']
})
export class PackageTypeCreateUpdateComponent implements OnInit {

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
  icEditLocation = icEditLocation;
  icPhone = icPhone;

  public spinner = false;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any,
    private dialogRef: MatDialogRef<PackageTypeCreateUpdateComponent>,
    private fb: FormBuilder,
    private packageTypeService: PackageTypeService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {} as PackageType;
    }

    this.form = this.fb.group({
      _id: [this.defaults._id],
      type: [this.defaults.type || '', [Validators.required]],
      height: [this.defaults.height || '', [Validators.required]],
      width: [this.defaults.width || '', [Validators.required]],
      length: [this.defaults.length || '', [Validators.required]],
      notes: this.defaults.notes || ''
    });
  }

  save() {
    if (this.mode === 'create') {
      this.createPackageType();
    } else if (this.mode === 'update') {
      this.updatePackageType();
    }
  }

  generateNewName() {
    return this.form.controls.type.value + '_' +
      this.form.controls.height.value + 'x' +
      this.form.controls.width.value + 'x' +
      this.form.controls.length.value;
  }

  createPackageType() {
    this.spinner = true;
    const packageType = new PackageType(this.form.value);
    packageType.name = this.generateNewName();

    if ('INVALID' !== this.form.status) {
      this.packageTypeService.createPackageType(packageType).subscribe((resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => this.openSnackbar(error.error.msg));
    } else {
      this.openSnackbar('Please fill all the required fields');
    }
  }

  updatePackageType() {
    this.spinner = true;
    const packageType = new PackageType(this.form.value);
    packageType.name = this.generateNewName();
    if ('INVALID' !== this.form.status) {
      this.packageTypeService.updatePackageType(packageType).subscribe((resp: ServiceResponse) => {
        this.dialogRef.close(resp.data);
        this.openSnackbar(resp.msg);
        this.spinner = false;
      }, (error) => {
        this.dialogRef.close(packageType);
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
}
