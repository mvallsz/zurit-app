import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import icAttachMoney from '@iconify/icons-ic/twotone-attach-money';
import icMoney from '@iconify/icons-ic/monetization-on';
import icRule from '@iconify/icons-ic/twotone-rule';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShippingEnt } from '../../interfaces/shipping.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { GuidesService } from '../../../../../services/guides.service';
import { ShippingService } from '../../../../../services/shipping.service';
import { PackageTypeService } from '../../../../../services/package-type.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  WarehouseItemFull
} from '../../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { WarehouseItemService } from '../../../../../services/warehouse-item.service';
import { ServiceResponse } from '../../../../../interfaces/service-response.interface';
import { ManifestData } from '../../../../../interfaces/manifest-data-table.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'vex-assign-to-pallet',
  templateUrl: './assign-to-pallet.component.html',
  styleUrls: ['./assign-to-pallet.component.scss']
})
export class AssignToPalletComponent implements OnInit {

  icMoney = icMoney;
  icCard = icAttachMoney;
  icRule = icRule;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icPrint = icPrint;

  spinner = false;
  public containers: ManifestData[];
  public containersF: ManifestData[];
  public containerToEdit: ManifestData;
  public packageToShow: string;
  public ship: ShippingEnt;

  public contaniersCtrl: FormControl = new FormControl('');

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AssignToPalletComponent>,
    private dialog: MatDialog,
    private warehouseService: WarehouseItemService,
    private guideService: GuidesService,
    private shippingService: ShippingService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    try {
      this.ship = this.data.shipping;
      this.containersF = this.data.pallets;
      this.containers = this.data.pallets.filter(x => x.shortDesc !== 'Loose Packages');

      if (Array.isArray(this.data.tlPackages)) {
        this.packageToShow = 'You chose the following packages: <br>';
        for (const tlPackage of this.data.tlPackages) {
          this.packageToShow += `[Guide: ${tlPackage.guideId} / Pkg: ${tlPackage.tlCargoId} / Piece: ${tlPackage.guideCounter}]<br>`;
        }

      } else {
        this.packageToShow = 'You chose the following packages: <br>';
        this.packageToShow += `[Guide: ${this.data.tlPackages.guideId} / Pkg: ${this.data.tlPackages.tlCargoId} / Piece: ${this.data.tlPackages.guideCounter}]<br>`;
      }

    } catch (e) {
      this.packageToShow = 'You chose the following packages: <br>';
      const packageId = `TL-${this.data.tlPackages[0]._id.toString().substring(0, 5)}${this.data.tlPackages[0]._id.toString().substring(this.data.tlPackages[0]._id.toString().toString().length - 5)}`;
      this.guideService.getGuide(this.data.tlPackages[0].guide).subscribe(
        (resp: ServiceResponse) => {
          this.shippingService.getShippingById(resp.data[0].shipping._id).subscribe(
            (respS: ServiceResponse) => {
              this.ship = respS.data[0];
              this.containers = respS.data[0].shippingManifest;
              const guideId = `${resp.data[0].shipping.type === 'AIR' ? 'HAWB' : 'HBOL'}-${resp.data[0]._id.toString().substring(0, 5)}${resp.data[0]._id.toString().substring(resp.data[0]._id.toString().toString().length - 5)}`;
              this.packageToShow += `[Guide: ${guideId} / Pkg: ${packageId} / Piece: ${this.data.tlPackages.guideCounter}]<br>`;
            }
          );
        }
      );
    }
  }

  updateShipContainers(oldShipContainer: String, newShipContainer: String, tlPackage: WarehouseItemFull) {

    const indexOld = this.containersF.indexOf(this.containersF.filter(container => (container.shortDesc === oldShipContainer))[0]);
    const indexNew = this.containersF.indexOf(this.containersF.filter(container => (container.shortDesc === newShipContainer))[0]);

    const containerOld = this.containersF[indexOld];
    const containerNew = this.containersF[indexNew];

    containerNew.finalVlb += Number(tlPackage.vlb);
    containerNew.finalVolume += Number(tlPackage.volume);
    containerNew.finalWeight += Number(tlPackage.weight);

    containerOld.finalVlb -= Number(tlPackage.vlb);
    containerOld.finalVolume -= Number(tlPackage.volume);
    containerOld.finalWeight -= Number(tlPackage.weight);

    this.ship.shippingManifest = this.containersF;

    this.shippingService.updateShipping(this.ship).subscribe(
      (respShip: ServiceResponse) => {
        if (respShip.ok) {
          this.openSnackbar(`Shipping Manifest update correctly!`);
          this.spinner = false;
          this.dialogRef.close();
        } else {
          this.openSnackbar(`Error updating shipping ${respShip.msg}`);
          this.spinner = false;
          this.dialogRef.close();
        }
      }
    );
  }

  submit() {
    this.spinner = true;
    if (Array.isArray(this.data.tlPackages)) {
      for (let i = 0; i < this.data.tlPackages.length; i++) {

        const oldShipContainer = this.data.tlPackages[i].shipContainer;
        this.data.tlPackages[i].shipContainer = this.contaniersCtrl.value;

        this.warehouseService.updateWarehouseItem(this.data.tlPackages[i]).subscribe(
          (resp: ServiceResponse) => {
            if (resp.ok) {
              if (i === this.data.tlPackages.length - 1) {
                this.openSnackbar(`Shipping Manifest update correctly!`);
                this.spinner = false;
                this.dialogRef.close();
              }
            } else {
              if (i === this.data.tlPackages.length - 1) {
                this.openSnackbar(`Error updating shipping ${resp.msg}`);
                this.spinner = false;
                this.dialogRef.close();
              }
            }

          });
      }
    } else {
      this.data.tlPackages.shipContainer = this.contaniersCtrl.value;
      this.warehouseService.updateWarehouseItem(this.data.tlPackages).subscribe(
        (resp: ServiceResponse) => {
          if (resp.ok) {
            this.openSnackbar(`Shipping Manifest update correctly!`);
            this.spinner = false;
            this.dialogRef.close();
          } else {
            this.openSnackbar(`Error updating shipping ${resp.msg}`);
            this.spinner = false;
            this.dialogRef.close();
          }
        }
      );
    }
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

}
