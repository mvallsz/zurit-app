import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import icAttachMoney from '@iconify/icons-ic/twotone-attach-money';
import icMoney from '@iconify/icons-ic/monetization-on';
import icRule from '@iconify/icons-ic/twotone-rule';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShippingEnt } from '../../../outgoingShippingModules/shipping-registry/interfaces/shipping.model';
import { GuidesService } from '../../../../services/guides.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import Swal from 'sweetalert2';
import { GuidesEntPop } from 'src/app/pages/outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';
import { GuidesEnt } from 'src/app/pages/outgoingShippingModules/shipping-guides/interfaces/guides-ent.model';
import { RateService } from 'src/app/services/rate.service';
import { Rate } from 'src/app/pages/adminModules/rate-registry/interfaces/rate.model';
import { environment } from "../../../../../environments/environment";
import { Quote } from '@angular/compiler';
import { QuotesService } from 'src/app/services/quotes.service';

const min_weight_air = environment.min_weight_air;
const min_weight_sea = environment.min_weight_sea;


@Component({
  selector: 'vex-assign-to-shipping',
  templateUrl: './assign-to-shipping.component.html',
  styleUrls: ['./assign-to-shipping.component.scss']
})
export class AssignToShippingComponent {

  icMoney = icMoney;
  icCard = icAttachMoney;
  icRule = icRule;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icPrint = icPrint;

  spinner = false;

  public ships: ShippingEnt[];
  public guide: GuidesEntPop;
  public rates: Rate[];

  public shippingsCtrl: FormControl = new FormControl('');
  public ratesCtrl: FormControl = new FormControl('');

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AssignToShippingComponent>,
    private guideService: GuidesService,
    private quoteService: QuotesService,
    private rateService: RateService,
    private snackBar: MatSnackBar) {
    this.ships = this.data.ships;
    this.guide = this.data.guide;

    this.rateService.getRateByType(this.guide.name.includes('AIR') ? 'AIR' : 'SEA').subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          this.rates = resp.data;
          this.ratesCtrl.setValue(this.guide.rate);
        } else {
          this.openSnackbar(`Error getting rates ${resp.msg}`);
        }
      }
    );
  }

  async costCalculate() {

    const typeShip = this.guide.name.includes('AIR') ? 'AIR' : 'SEA';
    let biggerWeight = 0;

    if (typeShip === "AIR") {
      biggerWeight = this.guide.finalWeight > this.guide.finalVlb ? this.guide.finalWeight : this.guide.finalVlb;
      if (biggerWeight < min_weight_air) {
        biggerWeight = min_weight_air;
      }
      this.guide.cost = parseFloat((biggerWeight * this.rates.filter(rate => rate._id === this.ratesCtrl.value)[0].rate).toFixed(2));
    } else {
      if (this.guide.finalVolume < min_weight_sea) {
        biggerWeight = min_weight_sea;
      } else {
        biggerWeight = this.guide.finalVolume;
      }
      this.guide.cost = parseFloat((biggerWeight * this.rates.filter(rate => rate._id === this.ratesCtrl.value)[0].rate).toFixed(2));
    }

  }

  async submit() {
    if (!this.shippingsCtrl.value) {
      this.openSnackbar('Please select a shipping');
      return;
    }

    this.spinner = true;
    this.guide.shipping = this.ships.filter(ship => ship._id === this.shippingsCtrl.value)[0];
    this.guide.quote = false;


    if (this.guide.rate !== this.ratesCtrl.value) {
      this.guide.rate = this.ratesCtrl.value;
      this.guide.rateAmount = this.rates.filter(rate => rate._id === this.ratesCtrl.value)[0].rate;
      await this.costCalculate();
    }

    this.guideService.updateGuide(this.guide).subscribe(
      (resp: ServiceResponse) => {
        if (resp.ok) {
          this.spinner = false;
          this.quoteService.getQuotes(0, 0, `&preGuideList=${this.guide._id}`).subscribe(
            (respQuotes: ServiceResponse) => {
              if (respQuotes.ok) {
                if (respQuotes.data.length > 0) {
                  respQuotes.data.forEach(quote => {
                    this.quoteService.deleteQuote(quote).subscribe(
                      (respDeleteQuote: ServiceResponse) => {
                        if (!respDeleteQuote.ok) {
                          this.openSnackbar(respDeleteQuote.msg);
                        } else {
                          this.openSnackbar('Guide updated successfully');
                        }
                      }
                    );
                  });
                }
              }
            }
          );
          this.dialogRef.close(resp.data);
        } else {
          this.openSnackbar(`Error updating guide ${resp.msg}`);
          this.spinner = false;
          this.dialogRef.close();
        }
      }
    );

  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CLOSE', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

}
