import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';

import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import icClose from "@iconify/icons-ic/twotone-close";
import icRule from "@iconify/icons-ic/twotone-rule";

import { WarehouseItemFull } from 'src/app/pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WarehouseItemService } from 'src/app/services/warehouse-item.service';
import { GuidesCreateUpdateComponent } from '../guides-create-update.component';

import { stagger80ms } from "../../../../../../@vex/animations/stagger.animation";
import { fadeInUp400ms } from "../../../../../../@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "../../../../../../@vex/animations/scale-in.animation";
import { fadeInRight400ms } from "../../../../../../@vex/animations/fade-in-right.animation";
import { Carrier } from 'src/app/pages/adminModules/curriers-registry/interfaces/carrier.model';
import { PackageType } from 'src/app/pages/adminModules/package-type-registry/interfaces/package-type.model';
import { TempPackageRegistryComponent } from 'src/app/pages/warehousingModules/warehouse-inventory/registry-package-create-update/temp-package-registry/temp-package-registry.component';

import { environment } from '../../../../../../environments/environment';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';

const base_url = environment.base_url;

@Component({
  selector: 'vex-split-package',
  templateUrl: './split-package.component.html',
  styleUrls: ['./split-package.component.scss'],
  animations: [stagger80ms, fadeInUp400ms, scaleIn400ms, fadeInRight400ms],
})
export class SplitPackageComponent implements OnInit {

  @ViewChildren(TempPackageRegistryComponent) children: QueryList<TempPackageRegistryComponent>;

  icMoreVert = icMoreVert;
  icClose = icClose;
  icRule = icRule;

  public spinner = false;
  public spinner2 = false;
  public splitPackages: WarehouseItemFull[] = new Array();

  public packageFormGroup: FormGroup;

  public volumeCtrl: FormControl = new FormControl("");
  public vlbCtrl: FormControl = new FormControl("");
  public weightCtrl: FormControl = new FormControl("", [Validators.required]);
  spinnerSplit: boolean;
  needPkgType: any;
  packageTypesCtrl: any;

  public invoiceUrl: string = "-";
  public imageUrl: string = "-";

  constructor(
    @Inject(MAT_DIALOG_DATA) public tlPackage: WarehouseItemFull,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<GuidesCreateUpdateComponent>,
    private warehouseItemService: WarehouseItemService,
    private snackbar: MatSnackBar,

  ) {

    this.packageFormGroup = this.fb.group({
      height: ["", [Validators.required]],
      width: ["", [Validators.required]],
      length: ["", [Validators.required]],
    });

    if (this.tlPackage.invoiceUrl) {
      this.invoiceUrl = `${base_url}/uploads/invoices/${this.tlPackage.invoiceUrl}`;
    }

    if (this.tlPackage.imageUrl) {
      this.imageUrl = `${base_url}/uploads/packages/${this.tlPackage.imageUrl}`;
    } else {
      this.imageUrl = `${base_url}/uploads/packages/-`;
    }


  }

  ngOnInit(): void {
    console.log(this.tlPackage);
  }

  keyPressNumbersWithDecimal(event, input: string) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = this.packageFormGroup.get(input).value.indexOf(".");
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  keyPressNumbersWithDecimalFC(event, input: FormControl) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = input.value.indexOf(".");
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  calculaVolume_HxWxL() {
    const height = this.packageFormGroup.get("height").value;
    const width = this.packageFormGroup.get("width").value;
    const length = this.packageFormGroup.get("length").value;

    if (height !== null && width !== null && length !== null) {
      this.volumeCtrl.setValue(((height * width * length) / 1756).toFixed(2));
      this.vlbCtrl.setValue(((height * width * length) / 166).toFixed(2));
    }
  }

  saveSplit() {
    this.spinner2 = true;
    this.warehouseItemService.createWarehouseItems(this.splitPackages).subscribe(
      (response: ServiceResponse) => {
        if (response.ok) {
          this.tlPackage.type = 1;
          this.tlPackage.status = '8';
          this.warehouseItemService.updateWarehouseItem(this.tlPackage).subscribe(
            (response: ServiceResponse) => {
              if (response.ok) {
                this.openSnackbar(response.msg);
                this.dialogRef.close({ newPackages: response.data, customer: this.tlPackage.customer });
              } else {
                this.openSnackbar(response.msg);
              }
              this.spinner2 = false;
            },
            (error) => {
              // Manejar el error del servicio aquí
            }
          );
        }
      },
      (error) => {
        // Manejar el error del servicio aquí
      }
    );

  }

  submitSplit() {
    this.spinnerSplit = true;
    let isValidForm = true;

    if (
      "INVALID" === this.packageFormGroup.status ||
      "INVALID" === this.weightCtrl.status ||
      "INVALID" === this.packageFormGroup.get("height").status ||
      "INVALID" === this.packageFormGroup.get("width").status ||
      "INVALID" === this.packageFormGroup.get("length").status
    ) {
      isValidForm = false;
      this.spinnerSplit = false;
    }


    const newPackage = new WarehouseItemFull({});

    let desc = `Split Package: came from: ${this.tlPackage.tlCargoId} `;

    newPackage.shortDesc = desc;
    newPackage.infoPackage = desc;
    newPackage.vlb = this.vlbCtrl.value;
    newPackage.volume = this.volumeCtrl.value;
    newPackage.weight = this.weightCtrl.value;
    newPackage.trackingId = "N/A";
    newPackage.carrier = new Carrier({});
    newPackage.type = 3;
    newPackage.status = "1";

    const height = this.packageFormGroup.get("height").value;
    const width = this.packageFormGroup.get("width").value;
    const length = this.packageFormGroup.get("length").value;

    newPackage.package = new PackageType({ height, width, length });
    newPackage.package.name = "TLCARGO_" + height + "x" + width + "x" + length;

    newPackage.shipper = this.tlPackage.shipper;
    newPackage.customer = this.tlPackage.customer;
    newPackage.infoCarrier = this.tlPackage.infoCarrier;
    newPackage.physicalLocation = this.tlPackage.physicalLocation;
    newPackage.imageUrl = this.tlPackage.imageUrl;
    newPackage.invoiceUrl = this.tlPackage.invoiceUrl;
    newPackage.splitPackage = this.tlPackage;
    newPackage.carrier = this.tlPackage.carrier;
    newPackage.notification = false;
    newPackage.notifiedTimes = 0;

    this.splitPackages.push(newPackage);
    this.spinnerSplit = false;
    this.resetSplit();
    this.children.forEach(child => child.OnResetParent(this.splitPackages));

  }

  resetSplit() {
    this.vlbCtrl.setValue("");
    this.volumeCtrl.setValue("");
    this.weightCtrl.setValue("");
    this.packageFormGroup.get("height").setValue("");
    this.packageFormGroup.get("width").setValue("");
    this.packageFormGroup.get("length").setValue("");
    this.packageFormGroup.markAsUntouched();
  }


  openSnackbar(message: string) {
    this.snackbar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }


}
