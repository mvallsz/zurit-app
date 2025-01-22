import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { stagger80ms } from '../../../../../@vex/animations/stagger.animation';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '../../../../../@vex/animations/scale-in.animation';
import { fadeInRight400ms } from '../../../../../@vex/animations/fade-in-right.animation';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icRule from '@iconify/icons-ic/twotone-rule';
import { environment } from '../../../../../environments/environment';

import { Shipper } from '../../../adminModules/shipper-registry/interfaces/shipper.model';
import { Customer } from '../../customers-registry/interfaces/customer.model';
import { Carrier } from '../../../adminModules/curriers-registry/interfaces/carrier.model';
import { PackageType } from '../../../adminModules/package-type-registry/interfaces/package-type.model';
import { WarehouseItemFull } from '../interfaces/warehouse-item-full.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { WarehouseItem } from '../interfaces/warehouse-item.model';

import { WarehouseItemService } from '../../../../services/warehouse-item.service';
import { PackageTypeService } from '../../../../services/package-type.service';
import { CarrierService } from '../../../../services/carrier.service';
import { CustomerService } from '../../../../services/customer.service';
import { ShipperService } from '../../../../services/shipper.service';
import { FileUploadService } from '../../../../services/file-upload.service';

import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { PackageTypeCreateUpdateComponent } from '../../../adminModules/package-type-registry/package-type-create-update/package-type-create-update.component';
// tslint:disable-next-line:max-line-length
import { CarrierCreateUpdateComponent } from '../../../adminModules/curriers-registry/carrier-create-update/carrier-create-update.component';
import { ShipperCreateUpdateComponent } from '../../../adminModules/shipper-registry/shipper-create-update/shipper-create-update.component';
import { TempPackageRegistryComponent } from './temp-package-registry/temp-package-registry.component';
import { CustomerCreateUpdateComponent } from '../../customers-registry/customer-create-update/customer-create-update.component';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { PackageReceiptComponent } from 'src/app/pages/utility/package-receipt/package-receipt.component';


const base_url = environment.base_url;

@Component({
  selector: 'vex-registry-package-dialog',
  templateUrl: './registry-package-create-update.component.html',
  styleUrls: ['./registry-package-create-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})

export class RegistryPackageCreateUpdateComponent implements OnInit {

  protected packageTypes: PackageType[] = [];
  public packageTypesCtrl: FormControl = new FormControl();
  public packageTypesFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredPackageTypes: ReplaySubject<PackageType[]> = new ReplaySubject<PackageType[]>(0);
  @ViewChild('packageTypesSelect', { static: true }) packageTypesSelect: MatSelect;

  protected shippers: Shipper[] = [];
  public shippersCtrl: FormControl = new FormControl();
  public shippersFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredShippers: ReplaySubject<Shipper[]> = new ReplaySubject<Shipper[]>(0);
  @ViewChild('shippersSelect', { static: true }) shippersSelect: MatSelect;

  protected carriers: Carrier[] = [];
  public carriersCtrl: FormControl = new FormControl();
  public carriersFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredCarriers: ReplaySubject<Carrier[]> = new ReplaySubject<Carrier[]>(0);
  @ViewChild('carriersSelect', { static: true }) carriersSelect: MatSelect;

  protected customers: Customer[] = [];
  public customersCtrl: FormControl = new FormControl();
  public customersFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredCustomers: ReplaySubject<Customer[]> = new ReplaySubject<Customer[]>(0);
  @ViewChild('customersSelect', { static: true }) customersSelect: MatSelect;


  public shortDescCtrl: FormControl = new FormControl('', [Validators.required]);
  public weightCtrl: FormControl = new FormControl('', [Validators.required]);
  public volumeCtrl: FormControl = new FormControl('', [Validators.required]);
  public vlbCtrl: FormControl = new FormControl('', [Validators.required]);
  public imageUrlCtrl: FormControl = new FormControl('');
  public infoCtrl: FormControl = new FormControl('');
  public trackingIdCtrl: FormControl = new FormControl('', [Validators.required]);
  public shipperNoteCtrl: FormControl = new FormControl('');
  public physicalLocationCtrl: FormControl = new FormControl('');
  public notificationCtrl: FormControl = new FormControl();
  public customerCtrl: FormControl = new FormControl();
  public carrierRepackCtrl: FormControl = new FormControl();

  public packageSlideToggle: FormControl = new FormControl(false);

  protected _onDestroy = new Subject<void>();

  packageFormGroup: FormGroup;

  mode: 'create' | 'update' = 'create';

  icMoreVert = icMoreVert;
  icClose = icClose;
  icRule = icRule;

  public imageToUpload: File;
  public previewStatus = false;
  public imagePreviewSrc = '';
  public url = '';
  public invoiceUrl = '';
  public needPkgType = false;
  public multiplePackages = false;
  public customerPackages: WarehouseItemFull[] = new Array();
  public rePackages: WarehouseItemFull[] = new Array();
  public spinner = false;
  public files: NgxFileDropEntry[] = [];
  public PackagesFiles: File[] = [];

  public searching = false;
  /** list of banks filtered after simulating server side search */
  public filteredServerSideCustomers: ReplaySubject<ServiceResponse> = new ReplaySubject<ServiceResponse>(1);

  @ViewChildren(TempPackageRegistryComponent) children: QueryList<TempPackageRegistryComponent>;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: WarehouseItemFull,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<RegistryPackageCreateUpdateComponent>,
    private warehouseItemService: WarehouseItemService,
    private packageTypeService: PackageTypeService,
    private carrierService: CarrierService,
    private customerService: CustomerService,
    private shipperService: ShipperService,
    private fileUploadService: FileUploadService,
    private snackbar: MatSnackBar,
    private sanitizer: DomSanitizer) {
  }

  // ANGULAR FUNCTIONS
  ngOnInit() {
    this.notificationCtrl.setValue(true);
    this.packageFormGroup = this.fb.group({
      height: ['', [Validators.required]],
      width: ['', [Validators.required]],
      length: ['', [Validators.required]],
      type: ['', [Validators.required]],
    });

    this.packageTypeService.getPackageType()
      .subscribe((resp: ServiceResponse) => {
        this.packageTypes = resp.data;
        this.filteredPackageTypes.next(this.packageTypes.slice());
        this.packageTypesFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterPackageType();
          });
      });

    this.carrierService.getIncomingCarriers()
      .subscribe((resp: ServiceResponse) => {
        this.carriers = resp.data;
        this.filteredCarriers.next(this.carriers.slice());
        this.carriersFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCarrier();
          });
      });

    this.shipperService.getShippers()
      .subscribe((resp: ServiceResponse) => {
        this.shippers = resp.data;
        this.filteredShippers.next(this.shippers.slice());
        this.shippersFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterShipper();
          });
      });

    this.needPkgType = false;
    this.packageSlideToggle.setValue(false);

    if (this.defaults) {
      this.mode = 'update';
      this.customerCtrl.setValue(this.defaults.customer.name + ' - ' + this.defaults.customer.tlCargoName);
      this.shortDescCtrl.setValue(this.defaults.shortDesc);
      this.weightCtrl.setValue(this.defaults.weight);
      this.volumeCtrl.setValue(this.defaults.volume);
      this.vlbCtrl.setValue(this.defaults.vlb);
      this.imageUrlCtrl.setValue(this.defaults.imageUrl);
      this.infoCtrl.setValue(this.defaults.infoPackage);
      this.trackingIdCtrl.setValue(this.defaults.trackingId);
      this.shipperNoteCtrl.setValue(this.defaults.infoCarrier);
      this.physicalLocationCtrl.setValue(this.defaults.physicalLocation);
      this.shippersCtrl.setValue(this.defaults.shipper._id);
      if (this.defaults.type === 2) {
        this.carrierRepackCtrl.setValue(this.defaults.carrier.name);

      } else {
        this.carriersCtrl.setValue(this.defaults.carrier._id);
      }
      this.customersCtrl.setValue(this.defaults.customer._id);
      this.packageTypesCtrl.setValue(this.defaults.package._id);

      if (!this.defaults.packageTypeSelected) {

        this.packageFormGroup.get('type').setValue(this.defaults.package.type);
        this.packageFormGroup.get('height').setValue(this.defaults.package.height);
        this.packageFormGroup.get('width').setValue(this.defaults.package.width);
        this.packageFormGroup.get('length').setValue(this.defaults.package.length);
        this.needPkgType = false;
        this.packageSlideToggle.setValue(false);
      } else {
        this.needPkgType = true;
        this.packageSlideToggle.setValue(true);
      }

      if (this.defaults.imageUrl === '') {
        this.url = `${base_url}/uploads/packages/-`;
      } else {
        this.url = `${base_url}/uploads/packages/${this.defaults.imageUrl}`;
      }

      if (this.defaults.invoiceUrl && this.defaults.invoiceUrl !== '') {
        this.invoiceUrl = `${base_url}/uploads/invoices/${this.defaults.invoiceUrl}`;
      }

      this.warehouseItemService.getWarehouseItemFullByRepackId(this.defaults._id.toString()).subscribe((resp: ServiceResponse) => {
        this.rePackages = resp.data;
        this.cd.detectChanges();
      });
    }
  }

  // FORM FUNCTIONS

  onChangePck($event: MatSlideToggleChange) {

    this.needPkgType = $event.checked;
    this.vlbCtrl.setValue('');
    this.volumeCtrl.setValue('');
    this.cd.detectChanges();

    if (this.needPkgType) {
      if (this.packageTypesCtrl.value !== null) {
        this.calculaVolume();
      }
    } else {
      this.calculaVolume_HxWxL();
    }
  }

  resetPackageForm() {
    this.packageTypesCtrl.reset();
    this.packageTypesCtrl.reset();
    this.shortDescCtrl.reset();
    this.trackingIdCtrl.reset();
    this.infoCtrl.reset();
    this.vlbCtrl.reset();
    this.volumeCtrl.reset();
    this.weightCtrl.reset();
    this.carriersCtrl.reset();
    this.packageSlideToggle.setValue(false);

    this.packageFormGroup.reset();
    this.needPkgType = false;
  }

  public getInvoice(type: string, name: string) {

  }

  public async onSubmitAddPackage() {

    let formOk = true;
    if (this.packageSlideToggle.value === true) {
      if (this.shortDescCtrl.value === '' ||
        this.vlbCtrl.value === '' ||
        this.volumeCtrl.value === '' ||
        this.weightCtrl.value === '' ||
        this.packageTypesCtrl.value === '' ||
        this.trackingIdCtrl.value === '' ||
        'INVALID' === this.carriersCtrl.status) {
        formOk = false;
      }
    } else {
      if (this.shortDescCtrl.value === '' ||
        this.vlbCtrl.value === '' ||
        this.volumeCtrl.value === '' ||
        this.weightCtrl.value === '' ||
        this.packageFormGroup.get('height').value === '' ||
        this.packageFormGroup.get('width').value === '' ||
        this.packageFormGroup.get('length').value === '' ||
        this.packageFormGroup.get('type').value === '' ||
        this.trackingIdCtrl.value === '' ||
        'INVALID' === this.carriersCtrl.status) {
        formOk = false;
      }
    }
    if (!formOk) {
      this.openSnackbar('You need to fill all the inputs related to the Package');
    } else {
      if (!this.multiplePackages) {
        this.multiplePackages = true;
      }

      const newPackage = new WarehouseItemFull({});

      newPackage.shortDesc = this.shortDescCtrl.value;
      newPackage.infoPackage = this.infoCtrl.value;
      newPackage.vlb = this.vlbCtrl.value;
      newPackage.volume = this.volumeCtrl.value;
      newPackage.weight = this.weightCtrl.value;
      newPackage.trackingId = this.trackingIdCtrl.value;
      newPackage.carrier = this.carriersCtrl.value;

      if (this.files.length > 0) {
        await this.invoiceToPackage(newPackage, this.files);
      }

      if (this.needPkgType) {
        newPackage.packageTypeSelected = this.needPkgType;
        newPackage.package = this.packageTypes.filter(pkg => (pkg._id === this.packageTypesCtrl.value))[0];
      } else {

        const height = this.packageFormGroup.get('height').value;
        const width = this.packageFormGroup.get('width').value;
        const length = this.packageFormGroup.get('length').value;
        const type = this.packageFormGroup.get('type').value;

        newPackage.package = new PackageType({ height, width, length, type });
        newPackage.package.name = 'TLCARGO_' + height + 'x' + width + 'x' + length;

      }

      this.customerPackages.push(newPackage);
      this.resetPackageForm();
      this.files = [];
      this.children.forEach(child => child.OnResetParent(this.customerPackages));

    }

  }

  reset() {

    this.shortDescCtrl.reset();
    this.imageUrlCtrl.reset();
    this.weightCtrl.reset();
    this.volumeCtrl.reset();
    this.trackingIdCtrl.reset();
    this.shippersCtrl.reset();
    this.carriersCtrl.reset();
    this.customersCtrl.reset();
    this.packageTypesCtrl.reset();
    this.shipperNoteCtrl.reset();
    this.notificationCtrl.reset();
    this.infoCtrl.reset();
    this.physicalLocationCtrl.reset();
    this.previewStatus = false;
    this.url = `${base_url}/uploads/packages/-`;
  }

  async submit() {
    this.spinner = true;
    let isValidForm = true;
    if (
      'INVALID' === this.shippersCtrl.status ||
      'INVALID' === this.customersCtrl.status) {
      isValidForm = false;
      this.spinner = false;
    }

    if (isValidForm) {

      if (this.mode !== 'update') {
        if (this.customerPackages.length === 0) {
          await this.onSubmitAddPackage();
        }
        for (const warehouseItemForm of this.customerPackages) {

          warehouseItemForm.imageUrl = this.imageUrlCtrl.value;
          warehouseItemForm.shipper = this.shippersCtrl.value;
          warehouseItemForm.customer = this.customersCtrl.value;
          warehouseItemForm.infoCarrier = this.shipperNoteCtrl.value;
          warehouseItemForm.physicalLocation = this.physicalLocationCtrl.value;

          if (this.notificationCtrl.value) {
            warehouseItemForm.notifiedTimes = 1;
            warehouseItemForm.notification = true;
          } else {
            warehouseItemForm.notification = false;
          }
        }
        let warehouseCreationResp: ServiceResponse;

        this.warehouseItemService.createWarehouseItems(this.customerPackages).subscribe((resp: ServiceResponse) => {
          warehouseCreationResp = resp;
          if (warehouseCreationResp.ok) {
            if (this.PackagesFiles.length > 0) {
              for (const tlPackage of warehouseCreationResp.data) {
                const invoiceToUpload = this.PackagesFiles.filter(file => (file.name === tlPackage.invoiceUrl))[0];
                this.fileUploadService.photoUpdate(invoiceToUpload, 'invoices', tlPackage._id.toString())
                  .then(resp => {
                    tlPackage.invoiceUrl = resp.newName;
                  });
              }
            }
            if (this.previewStatus) {
              for (const tlPackage of warehouseCreationResp.data) {
                this.fileUploadService.photoUpdate(this.imageToUpload, 'packages', tlPackage._id.toString())
                  .then(resp => {
                    tlPackage.imageUrl = resp.newName;
                  });
              }
            }

            if (this.customerPackages.length === 1) {
              this.dialogRef.close(resp.data);
              this.openSnackbar('The package registered successfully, good job!!');
            } else {
              this.dialogRef.close(resp.data);
              this.openSnackbar('Ufff!!... All packages registered successfully, good job!!');
            }
          } else {
            this.spinner = false;
            this.openSnackbar(resp.msg);
          }

        }, (error) => {
          this.spinner = false;
          this.openSnackbar(error.error.msg);
        });
      } else {
        if (this.needPkgType) {
          if (
            'INVALID' === this.shortDescCtrl.status ||
            'INVALID' === this.weightCtrl.status ||
            'INVALID' === this.packageTypesCtrl.status) {
            isValidForm = false;
            this.spinner = false;
          }
        } else {
          if ('INVALID' === this.packageFormGroup.status ||
            'INVALID' === this.shortDescCtrl.status ||
            'INVALID' === this.weightCtrl.status ||
            'INVALID' === this.packageFormGroup.get('height').status ||
            'INVALID' === this.packageFormGroup.get('width').status ||
            'INVALID' === this.packageFormGroup.get('length').status) {
            isValidForm = false;
            this.spinner = false;
          }
        }

        if (isValidForm) {
          const warehouseItemtoUpdate = new WarehouseItem({});
          warehouseItemtoUpdate.shortDesc = this.shortDescCtrl.value;
          warehouseItemtoUpdate.imageUrl = this.imageUrlCtrl.value;
          warehouseItemtoUpdate.weight = this.weightCtrl.value;
          warehouseItemtoUpdate.volume = this.volumeCtrl.value;
          warehouseItemtoUpdate.vlb = this.vlbCtrl.value;
          warehouseItemtoUpdate.trackingId = this.trackingIdCtrl.value;
          warehouseItemtoUpdate.shipper = this.shippersCtrl.value;
          warehouseItemtoUpdate.carrier = this.carriersCtrl.value;
          warehouseItemtoUpdate.customer = this.customersCtrl.value;
          warehouseItemtoUpdate.infoCarrier = this.shipperNoteCtrl.value;
          warehouseItemtoUpdate.infoPackage = this.infoCtrl.value;
          warehouseItemtoUpdate.physicalLocation = this.physicalLocationCtrl.value;
          warehouseItemtoUpdate.packageTypeSelected = this.needPkgType;

          warehouseItemtoUpdate.package = this.packageTypesCtrl.value;

          if (this.notificationCtrl.value) {
            warehouseItemtoUpdate.notifiedTimes = ++this.defaults.notifiedTimes;
            warehouseItemtoUpdate.notification = true;
          } else {
            warehouseItemtoUpdate.notification = false;
          }

          if (this.files.length > 0) {
            await this.invoiceToPackage(this.defaults, this.files);
          }

          if (this.needPkgType) {
            warehouseItemtoUpdate._id = this.defaults._id;
            this.warehouseItemService.updateWarehouseItem(warehouseItemtoUpdate).subscribe((resp: any) => {
              const warehouseCreated = new WarehouseItemFull(resp.data);

              if (this.PackagesFiles.length > 0) {
                const invoiceToUpload = this.PackagesFiles[0];
                this.fileUploadService.photoUpdate(invoiceToUpload, 'invoices', warehouseCreated._id.toString())
                  .then(resp => {
                    warehouseCreated.invoiceUrl = resp.newName;
                  });
              }

              if (this.previewStatus) {
                this.fileUploadService.photoUpdate(this.imageToUpload, 'packages', warehouseCreated._id.toString())
                  .then(resp => {
                    warehouseCreated.imageUrl = resp.newName;
                  });
              }
              this.spinner = false;
              this.dialogRef.close(warehouseCreated);
              this.openSnackbar(resp.msg);
            }, (error) => {
              this.spinner = false;
              this.openSnackbar(error.error.msg);
            });
          } else {
            const newPackageType = new PackageType({});
            const height = this.packageFormGroup.get('height').value;
            const width = this.packageFormGroup.get('width').value;
            const length = this.packageFormGroup.get('length').value;

            newPackageType.name = 'TLCARGO_' + height + 'x' + width + 'x' + length;
            newPackageType.width = width;
            newPackageType.height = height;
            newPackageType.length = length;
            newPackageType.notes = 'TLCARGO Autogenerated Package Type';

            this.packageTypeService.createPackageType(newPackageType).subscribe((resp: ServiceResponse) => {
              warehouseItemtoUpdate._id = this.defaults._id;
              warehouseItemtoUpdate.package = resp.data._id;
              this.warehouseItemService.updateWarehouseItem(warehouseItemtoUpdate).subscribe((respWI: any) => {
                const warehouseCreated = new WarehouseItemFull(respWI.data);

                if (this.PackagesFiles.length > 0) {
                  const invoiceToUpload = this.PackagesFiles[0];
                  this.fileUploadService.photoUpdate(invoiceToUpload, 'invoices', warehouseCreated._id.toString())
                    .then(resp => {
                      warehouseCreated.invoiceUrl = resp.newName;
                    });
                }

                if (this.previewStatus) {
                  this.fileUploadService.photoUpdate(this.imageToUpload, 'packages', warehouseCreated._id.toString())
                    .then(resp => {
                      warehouseCreated.imageUrl = resp.newName;
                    });
                }
                this.spinner = false;
                this.dialogRef.close(warehouseCreated);
                this.openSnackbar(respWI.msg);
              }, (error) => this.openSnackbar(error.error.msg));
            }, (error) => console.log(error.error.msg));

          }
        } else {
          this.openSnackbar('Please fill all the required fields');
          this.spinner = false;
        }
      }
    } else {
      this.openSnackbar('Please fill all the required fields');
      this.spinner = false;
    }
  }
  // BUSINESS FUNCTIONS

  openReceipt(pac: WarehouseItemFull) {
    this.dialog.open(PackageReceiptComponent, {
      data: pac,
      height: "800px",
      width: "1000px",
    });
  }

  createPackageType() {
    this.dialog.open(PackageTypeCreateUpdateComponent, {
      height: '500px'
    }).afterClosed().subscribe(() => {

      this.packageTypeService.getPackageType()
        .subscribe((resp: ServiceResponse) => {
          this.packageTypes = resp.data;
          this.filteredPackageTypes.next(this.packageTypes.slice());
          this.packageTypesFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterPackageType();
            });
        });
    });
  }

  createCarrier() {
    this.dialog.open(CarrierCreateUpdateComponent, {
      height: '500px'
    }).afterClosed().subscribe(() => {

      this.carrierService.getCarriers()
        .subscribe((resp: ServiceResponse) => {
          this.carriers = resp.data;
          this.filteredCarriers.next(this.carriers.slice());
          this.carriersFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterCarrier();
            });
        });
    });
  }

  createShipper() {
    this.dialog.open(ShipperCreateUpdateComponent).afterClosed().subscribe(() => {

      this.shipperService.getShippers()
        .subscribe((resp: ServiceResponse) => {
          this.shippers = resp.data;
          this.filteredShippers.next(this.shippers.slice());
          this.shippersFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterShipper();
            });
        });
    });
  }

  createCustomer() {
    this.dialog.open(CustomerCreateUpdateComponent, {
      height: '500px'
    }).afterClosed().subscribe(() => {

      this.customerService.getCustomers()
        .subscribe((resp: ServiceResponse) => {
          this.customers = resp.data;
          this.filteredCustomers.next(this.customers.slice());
          this.customersFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterCustomer();
            });
        });
    });
  }

  // UTILITY FUNCTIOS

  keyPressNumbersWithDecimal(event, input: string) {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = this.packageFormGroup.get(input).value.indexOf('.');
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  keyPressNumbersWithDecimalFC(event, input: FormControl) {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = input.value.indexOf('.');
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  calculaVolume() {
    const packageTypeSelected: PackageType[] = this.packageTypes.filter(packageType => packageType._id === this.packageTypesCtrl.value);
    if (this.packageTypesCtrl.value) {
      // tslint:disable-next-line:max-line-length
      this.volumeCtrl.setValue(((packageTypeSelected[0].height * packageTypeSelected[0].width * packageTypeSelected[0].length) / 1756).toFixed(2));
      // tslint:disable-next-line:max-line-length
      this.vlbCtrl.setValue(((packageTypeSelected[0].height * packageTypeSelected[0].width * packageTypeSelected[0].length) / 166).toFixed(2));
    }

  }

  calculaVolume_HxWxL() {

    const height = this.packageFormGroup.get('height').value;
    const width = this.packageFormGroup.get('width').value;
    const length = this.packageFormGroup.get('length').value;

    if (height !== null && width !== null && length !== null) {
      this.volumeCtrl.setValue(((height * width * length) / 1756).toFixed(2));
      this.vlbCtrl.setValue(((height * width * length) / 166).toFixed(2));
    }
  }

  photoURL() {
    return this.sanitizer.bypassSecurityTrustUrl(this.imagePreviewSrc);
  }

  previewImagen(file: File) {
    if (file) {

      const nameSplit = file.name.split('.');
      const extensionFile = nameSplit[nameSplit.length - 1];

      const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];

      if (validExtensions.includes(extensionFile)) {
        this.imageToUpload = file;
        this.previewStatus = true;
        this.imagePreviewSrc = URL.createObjectURL(this.imageToUpload);
      } else {
        this.openSnackbar('This type of file is not allowed');
      }
    }
  }

  protected filterPackageType() {
    if (!this.packageTypes) {
      return;
    }
    let search = this.packageTypesFilterCtrl.value;
    if (!search) {
      this.filteredPackageTypes.next(this.packageTypes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredPackageTypes.next(
      this.packageTypes.filter(packageType => packageType.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterShipper() {
    if (!this.shippers) {
      return;
    }
    let search = this.shippersFilterCtrl.value;
    if (!search) {
      this.filteredShippers.next(this.shippers.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredShippers.next(
      this.shippers.filter(shipper => shipper.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterCarrier() {
    if (!this.carriers) {
      return;
    }
    let search = this.carriersFilterCtrl.value;
    if (!search) {
      this.filteredCarriers.next(this.carriers.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredCarriers.next(
      this.carriers.filter(carrier => carrier.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filterCustomer() {
    if (!this.customers) {
      return;
    }
    const search = this.customersFilterCtrl.value;
    if (!search) {
      this.filteredCustomers.next(this.customers.slice());
      return;
    } else {
      if (search.length > 3) {
        this.customerService.getCustomersLite(`name=${search}&tlCargoName=${search}`)
          .subscribe((resp: ServiceResponse) => {
            this.customers = resp.data;
            this.filteredCustomers.next(this.customers.slice());
            return;
          });
      } else {
        this.filteredCustomers.next(this.customers.slice());
        return;
      }
    }
  }

  openSnackbar(message: string) {
    this.snackbar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
  }

  public async invoiceToPackage(tlPackage: WarehouseItemFull, files: NgxFileDropEntry[]) {
    for (const droppedFile of this.files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        tlPackage.invoiceUrl = droppedFile.relativePath;
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        await fileEntry.file((file: File) => {
          this.PackagesFiles.push(file);

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public fileOver(event) {
    console.log(event);
  }

  public fileLeave(event) {
    console.log(event);
  }

}
