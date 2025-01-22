import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { WarehouseItemFull } from '../interfaces/warehouse-item-full.model';
import { PackageType } from 'src/app/pages/adminModules/package-type-registry/interfaces/package-type.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';

import { stagger80ms } from '../../../../../@vex/animations/stagger.animation';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '../../../../../@vex/animations/scale-in.animation';
import { fadeInRight400ms } from '../../../../../@vex/animations/fade-in-right.animation';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icMoney from '@iconify/icons-ic/monetization-on';
import icRule from '@iconify/icons-ic/twotone-rule';
import { TlPackagesModel } from 'src/app/pages/outgoingShippingModules/shipping-guides/interfaces/tl-packages.model';
import { Customer } from '../../customers-registry/interfaces/customer.model';
import { PickingListPackagesComponent } from './picking-list-packages/picking-list-packages.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WarehouseItemService } from 'src/app/services/warehouse-item.service';
import { PackageTypeService } from 'src/app/services/package-type.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MailService } from 'src/app/services/mail.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { TlCargoIdPipe } from 'src/app/pipes/tl-cargo-id/tl-cargo-id.pipe';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';
import { takeUntil } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Carrier } from 'src/app/pages/adminModules/curriers-registry/interfaces/carrier.model';
import { PackageTypeCreateUpdateComponent } from 'src/app/pages/adminModules/package-type-registry/package-type-create-update/package-type-create-update.component';
import { Rate } from 'src/app/pages/adminModules/rate-registry/interfaces/rate.model';
import { environment } from 'src/environments/environment';
import { RateService } from 'src/app/services/rate.service';


const base_url = environment.base_url;
const this_url = environment.this_url;

@Component({
  selector: 'vex-repacking-registry',
  templateUrl: './repacking-registry.component.html',
  styleUrls: ['./repacking-registry.component.scss'],
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})
export class RepackingRegistryComponent implements OnInit {

  protected packageTypes: PackageType[] = [];
  public packageTypesCtrl: FormControl = new FormControl('', [Validators.required]);
  public packageTypesFilterCtrl: FormControl = new FormControl('');
  public filteredPackageTypes: ReplaySubject<PackageType[]> = new ReplaySubject<PackageType[]>(0);
  @ViewChild('packageTypesSelect', { static: true }) packageTypesSelect: MatSelect;

  public nameCtrl: FormControl = new FormControl('');
  public customerCtrl: FormControl = new FormControl('');
  public typeCtrl: FormControl = new FormControl('');
  public volumeCtrl: FormControl = new FormControl('');
  public vlbCtrl: FormControl = new FormControl('');
  public statusCtrl: FormControl = new FormControl('');
  public weightCtrl: FormControl = new FormControl('', [Validators.required]);
  public costCtrl: FormControl = new FormControl('');
  public notesCtrl: FormControl = new FormControl('');
  public repackingCtrl: FormControl = new FormControl('');
  public notificationRePackCtrl: FormControl = new FormControl();

  public shipperNoteCtrl: FormControl = new FormControl('');
  public physicalLocationCtrl: FormControl = new FormControl('');


  protected _onDestroy = new Subject<void>();


  icMoreVert = icMoreVert;
  icClose = icClose;
  icMoney = icMoney;
  icRule = icRule;

  public imageRepackingToUpload: File;
  public previewRepackingStatus = false;
  public imageRepackingPreviewSrc = '';
  public urlRepacking = '';
  public repacking = false;

  public customerPackages: WarehouseItemFull[];
  public tlPackages: TlPackagesModel;
  public customer: Customer;

  public oldWeight = 0;
  public oldVolume = 0;
  public oldVolumeWeight = 0;

  public needPkgType = false;
  public packageFormGroup: FormGroup;
  public spinner = false;
  public spinnerRepack = false;
  public ratesDef: Rate[];

  urlItem = '';
  urlItem2 = '';
  tlCargoId = '';

  @ViewChildren(PickingListPackagesComponent) pickingListChildren: QueryList<PickingListPackagesComponent>;

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: WarehouseItemFull[],
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<RepackingRegistryComponent>,
    private warehouseItemService: WarehouseItemService,
    private packageTypeService: PackageTypeService,
    private customerService: CustomerService,
    private fileUploadService: FileUploadService,
    private mailService: MailService,
    private snackbar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private rateService: RateService,
    private tlCargoIdPipe: TlCargoIdPipe) {
  }

  ngOnInit() {

    this.packageFormGroup = this.fb.group({
      height: ['', [Validators.required]],
      width: ['', [Validators.required]],
      type: ['', [Validators.required]],
      length: ['', [Validators.required]]
    });

    this.customerCtrl.setValue(`${this.defaults[0].customer.name} - ${this.defaults[0].customer.tlCargoName}`);

    this.rateService.getRateByDefault().subscribe(
      (resp: ServiceResponse) => {
        this.ratesDef = resp.data;
      }
    );

    this.setPackage(this.defaults);

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

  onChange($event: MatSlideToggleChange) {

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


  setPackage(packages: WarehouseItemFull[]) {

    this.repacking = true;
    if (packages.length === 0) {
      this.repacking = false;
      this.repackingCtrl.setValue(false);
    }
    this.oldVolume = 0;
    this.oldWeight = 0;
    this.oldVolumeWeight = 0;

    for (const pac of this.defaults) {
      this.oldWeight = this.oldWeight + +pac.weight;
      this.oldVolume = this.oldVolume + +pac.volume;
      this.oldVolumeWeight = this.oldVolumeWeight + +pac.vlb;
    }

    this.oldWeight = parseFloat(this.oldWeight.toFixed(2));
    this.oldVolume = parseFloat(this.oldVolume.toFixed(2));
    this.oldVolumeWeight = parseFloat(this.oldVolumeWeight.toFixed(2));

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

  photoURL(type: string) {
    let url;
    url = this.imageRepackingPreviewSrc;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  previewRepackingImagen(file: File) {
    if (file) {
      this.imageRepackingToUpload = file;
      this.previewRepackingStatus = true;
      this.imageRepackingPreviewSrc = URL.createObjectURL(this.imageRepackingToUpload);
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

  openSnackbar(message: string) {
    this.snackbar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

  submitRepacking() {

    this.spinnerRepack = true;
    let isValidForm = true;

    if (this.needPkgType) {
      if (
        'INVALID' === this.weightCtrl.status ||
        'INVALID' === this.packageTypesCtrl.status) {
        isValidForm = false;
        this.spinnerRepack = false;
      }
    } else {
      if ('INVALID' === this.packageFormGroup.status ||
        'INVALID' === this.weightCtrl.status ||
        'INVALID' === this.packageFormGroup.get('height').status ||
        'INVALID' === this.packageFormGroup.get('width').status ||
        'INVALID' === this.packageFormGroup.get('type').status ||
        'INVALID' === this.packageFormGroup.get('length').status) {
        isValidForm = false;
        this.spinnerRepack = false;
      }
    }

    if (isValidForm) {
      const newPackage = new WarehouseItemFull({});
      let desc = 'Repacked: packages [';
      const customer = this.defaults[0].customer;
      const shipper = this.defaults[0].shipper;

      this.defaults.forEach((row: WarehouseItemFull) => {
        desc += `${row.tlCargoId}, `;
      });

      newPackage.shortDesc = desc.substring(0, desc.length - 2) + ']';
      newPackage.infoPackage = desc;
      newPackage.vlb = this.vlbCtrl.value;
      newPackage.volume = this.volumeCtrl.value;
      newPackage.weight = this.weightCtrl.value;
      newPackage.trackingId = 'N/A';
      newPackage.carrier = new Carrier({});
      newPackage.type = 2;
      newPackage.status = '1';

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

      newPackage.shipper = shipper;
      newPackage.customer = customer;
      newPackage.infoCarrier = this.shipperNoteCtrl.value;
      newPackage.physicalLocation = this.physicalLocationCtrl.value;
      newPackage.imageUrl = this.imageRepackingPreviewSrc;

      if (this.notificationRePackCtrl.value) {
        newPackage.notifiedTimes = 1;
        newPackage.notification = true;
      } else {
        newPackage.notification = false;
      }

      let warehouseCreationResp: ServiceResponse;
      this.warehouseItemService.createRepackedWarehouseItems(newPackage, this.defaults).subscribe((resp: ServiceResponse) => {
        warehouseCreationResp = resp;
        if (warehouseCreationResp.ok) {

          if (this.previewRepackingStatus) {
            this.fileUploadService.photoUpdate(this.imageRepackingToUpload, 'packages', warehouseCreationResp.data._id.toString())
              .then(img => {
              });
            this.openSnackbar('The repacked box was registered successfully, good job!!');
          } else {
            this.openSnackbar('The repacked box was registered successfully!!');
          }
          if (newPackage.notification) {
            this.sendRepackingNotification(warehouseCreationResp.data, this.defaults);
          }

          this.spinnerRepack = false;
          this.dialogRef.close({ data: warehouseCreationResp.data, paqs: this.defaults });

        } else {
          this.spinnerRepack = false;
          this.openSnackbar(resp.msg);
        }

      }, (error) => {
        this.spinnerRepack = false;
        this.openSnackbar(error.error.msg);
      });
    } else {
      this.openSnackbar('Fill all the required fields...');
    }


  }

  resetRePackage() {
    this.repackingCtrl.setValue(false);
    this.vlbCtrl.setValue('');
    this.volumeCtrl.setValue('');
    this.weightCtrl.setValue('');
    this.packageFormGroup.get('height').setValue('');
    this.packageFormGroup.get('width').setValue('');
    this.packageFormGroup.get('length').setValue('');
    this.shipperNoteCtrl.setValue('');
    this.physicalLocationCtrl.setValue('');
    this.notificationRePackCtrl.setValue(false);
    this.imageRepackingPreviewSrc = '';
    this.previewRepackingStatus = false;
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

  sendRepackingNotification(rePackage: WarehouseItemFull, rePackageSelected: WarehouseItemFull[]) {

    let oldVolumeValue = 0;
    let oldVlbValue = 0;
    let oldWeightValue = 0;

    let totalACost = 0;
    let totalMCost = 0;
    let finalACost = 0;
    let finalMCost = 0;
    let diffACost = 0;
    let diffMCost = 0;

    let packagesRows = '';
    let odd = 1;
    for (const packageWh of rePackageSelected) {
      this.tlCargoId = this.tlCargoIdPipe.transform(packageWh._id.toString(), 'TL');
      oldVlbValue += Number(packageWh.vlb);
      oldWeightValue += Number(packageWh.weight);
      oldVolumeValue += Number(packageWh.volume);

      if (odd % 2 === 0) {
        packagesRows += `<tr>
          <td>${this.tlCargoId}</td>
          <td>${packageWh.trackingId}</td>
          <td>${packageWh.shortDesc}</td>
          <td>${packageWh.weight} libras.</td>
          <td>${packageWh.vlb} vlb.</td>
          <td>${packageWh.volume} ft<sup>3</sup></td>
        </tr>`;
      } else {
        packagesRows += `<tr class="alt">
          <td>${this.tlCargoId}</td>
          <td>${packageWh.trackingId}</td>
          <td>${packageWh.shortDesc}</td>
          <td>${packageWh.weight} libras.</td>
          <td>${packageWh.vlb} vlb.</td>
          <td>${packageWh.volume} ft<sup>3</sup></td>
        </tr>`;
      }

      odd++;

    }

    let repackContent = `
    <tr>
    <td style="padding: 20px;;"> 
      <h2 style="font-size: 14pt;">Hola ${rePackage.customer.name}!</h2> 
      <p style="font-size: 12pt;" >Te confirmamos que hemos terminado el proceso de reempaque de los siguientes paquetes:</p>
      <div class="datagrid">
        <table>
          <thead>
            <tr>
              <th>Id</th>  
              <th>Tracking Id</th>  
              <th>Descripción</th>  
              <th>Peso</th>  
              <th>Vlb</th>  
              <th>Volumen</th>  
            </tr>
          </thead>
          <tbody>
            ${packagesRows}
          </tbody>
        </table>
      </div>
    </td>
  </tr>`;

    for (const rate of this.ratesDef) {
      if (rate.type === 'AIR') {
        if (oldVlbValue > oldWeightValue) {
          finalACost = Number(Number(oldVlbValue) * rate.rate);
        } else {
          finalACost = Number(Number(oldWeightValue) * rate.rate);
        }
      } else {
        finalMCost = Number(Number(oldVolumeValue) * rate.rate);
      }
    }

    totalACost = rePackage.vlb > rePackage.weight ? +rePackage.vlb * this.ratesDef.filter((row) => row.type === 'AIR')[0].rate : +rePackage.weight * this.ratesDef.filter((row) => row.type === 'AIR')[0].rate;
    totalMCost = +rePackage.volume * this.ratesDef.filter((row) => row.type === 'SEA')[0].rate;

    diffACost = finalACost - totalACost;
    diffMCost = finalMCost - totalMCost;

    this.urlItem = `${this_url}/#/warehouse-item-receipt/${rePackage._id}`;
    this.urlItem2 = `${this_url}/#/re-package-list/${rePackage._id}`;

    let repackTable = '';
    let saleTable = '';

    if (diffMCost > 2 || diffACost > 2) {

      saleTable = `<tr>
                    <td>
                      <div style="background: #67adf3; border-radius: 20px; padding: 20px">
                        <h3 style="font-size: 12pt;" >Si escoges la modalidad Aerea te ahorras</h3>
                        <h1 style="font-size: 24pt; padding: 15px;"> ${diffACost.toLocaleString('en', { style: 'currency', currency: 'USD' })} </h1>
                      </div>
                    </td>
                    <td >
                      <div style="background: #67adf3; border-radius: 20px; padding: 20px">
                        <h3 style="font-size: 12pt;" >Si escoges la modalidad Marítima te ahorras</h3>
                        <h1 style="font-size: 24pt; padding: 15px"> ${diffMCost.toLocaleString('en', { style: 'currency', currency: 'USD' })} </h1>
                      </div>
                    </td>
                  </tr>`;
    }

    repackTable = `<tr>
    <td>
        <table style="padding: 10px 10px 10px 10px; text-align: center" >
        ${saleTable}
          <tr>
              <td colspan="2">
                  <table style="width: 100%;">
                    <thead>
                      <tr>
                        <th style="width: 50%; background: #FF7A59; padding: 10px; font-size: 12pt;" colspan="2">Antes del Reempaque</th>
                        <th style="width: 50%; background: #59ff80; padding: 10px; font-size: 12pt;" colspan="2">Despues del Reempaque</th>
                      </tr>
                    </thead>
                    <tr style="text-align: left;">
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                        Peso volumétrico:
                      </td>
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                      ${oldVlbValue.toFixed(2)} vlb.
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                        Peso volumétrico: 
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                      ${Number(rePackage.vlb).toFixed(2)} vlb.
                      </td>
                    </tr>
                    <tr style="text-align: left;">
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                        Peso:
                      </td>
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                      ${oldWeightValue.toFixed(2)} libras <span style="font-size: 8pt;"> ${Number(oldWeightValue / 2.2046).toFixed(2)} Kgs.</span>
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                        Peso:
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                      ${Number(rePackage.weight).toFixed(2)} libras <span style="font-size: 8pt;"> ${Number(+rePackage.weight / 2.2046).toFixed(2)} Kgs.</span>
                      </td>
                    </tr>
                    <tr style="text-align: left;">
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                        Volumen
                      </td>
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                      ${oldVolumeValue.toFixed(2)} ft<sup>3</sup>
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                        Volumen: 
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                      ${Number(rePackage.volume).toFixed(2)} ft<sup>3</sup>
                      </td>
                    </tr>
                  </table>
              </td>
          </tr>
        </table>
    </td>
  </tr>`;


    const mail: any = {};
    mail.from = 'TLCargo tu servicio de transporte de carga';
    mail.to = rePackage.customer.email;
    mail.subject = 'Hemos reempacado alguno de tus paquetes!!';
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }.datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <br> <h2> Reempacamos algunos de tus paquetes!! </h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> ${repackContent} ${repackTable} <tr> <td style="text-align: center; font-size: 8pt; padding:5px;"> <hr> <p>Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br>${this.urlItem} </p> <hr> <p> Una vez que hayas confirmado la recepción y verificado que todo lo que has comprado esté correcto, por favor avísanos cuándo deseas que enviemos tus productos a Venezuela. Para ello, te pedimos que nos envíes un correo electrónico único con la lista de los números de recibo (TL-xxxx) y la confirmación de cuándo y en qué tipo de envío deseas que los despachemos. <br>Estamos aquí para ayudarte en todo el proceso. </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:15px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {

      if (resp.info.response.includes('250')) {
        this.openSnackbar('Customer notified Correctly!!');
      } else {
        this.openSnackbar('We have some problems sending the notification!!');
      }
    });
  }

}
