/* tslint:disable:no-shadowed-variable */
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import icMail from '@iconify/icons-ic/twotone-mail';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { WarehouseItemService } from '../../../services/warehouse-item.service';
import { WarehouseItemFull } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { ShippingService } from '../../../services/shipping.service';
import { shippingStatus } from '../../../../static-data/tlcargo-static-data';
import { GuidesEntPop } from '../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';
import { WarehouseItemFullWGuideInfoModel } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full-w-guide-info.model';
import { ActivatedRoute } from '@angular/router';
import { ShippingEnt } from '../../outgoingShippingModules/shipping-registry/interfaces/shipping.model';
import { QrGeneratorComponent } from '../../warehousingModules/warehouse-inventory/qr-generator/qr-generator.component';

@Component({
  selector: 'vex-shipping-pick-list-print',
  templateUrl: './shipping-pick-list.component.html',
  styleUrls: ['./shipping-pick-list.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class ShippingPickListComponent implements OnInit {

  icMail = icMail;
  icPhone = icPhone;

  guides: GuidesEntPop[];
  packages: WarehouseItemFull[];
  packagesGuided: WarehouseItemFullWGuideInfoModel[];
  shipping: ShippingEnt;
  packageQ = 0;
  totalWeight = 0;
  status = shippingStatus;
  statusPrint: any;

  constructor(private rutaActiva: ActivatedRoute,
    private shippingService: ShippingService,
    private warehouseService: WarehouseItemService,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.shippingService.getShippingById(this.rutaActiva.snapshot.params._id.toString())
      .subscribe((respS) => {
        this.shipping = respS.data;
        this.shippingService.getShippingGuidesAndPackageList(this.rutaActiva.snapshot.params._id.toString())
          .subscribe(resp => {
            this.guides = resp.data;
            this.packagesGuided = new Array();
            this.packages = new Array();

            for (const guide of this.guides) {
              this.packages = this.packages.concat(guide.packageList);
              let cont = 0;
              for (const tlPackage of guide.packageList) {
                if (cont === 0) {
                  const packageGuided = new WarehouseItemFullWGuideInfoModel({});
                  packageGuided._id = 'RPCK_' + guide._id.toString().substr(0, 10);
                  packageGuided.shortDesc = 'Repacked Guide';
                  // tslint:disable-next-line:max-line-length
                  packageGuided.measurement = 'H:' + guide.packageType[0].height + ' x W:' + guide.packageType[0].width + ' x L:' + guide.packageType[0].length;
                  packageGuided.weight = String(guide.finalWeight);
                  packageGuided.volume = String(guide.finalVolume);
                  packageGuided.vlb = String(guide.finalVlb);
                  packageGuided.guide = guide;
                  packageGuided.guideFlag = true;
                  this.packagesGuided.push(packageGuided);
                }
                cont++;
                const packageGuided = new WarehouseItemFullWGuideInfoModel(tlPackage);
                // tslint:disable-next-line:max-line-length
                packageGuided.measurement = 'H:' + tlPackage.package.height + ' x W:' + tlPackage.package.width + ' x L:' + tlPackage.package.length;
                packageGuided.guide = guide;
                packageGuided.guideFlag = false;
                this.packagesGuided.push(packageGuided);
              }
            }

            this.packageQ = this.packages.length;
            this.cd.detectChanges();
          });
      });
  }

  calculaTotalPeso(paquetes: WarehouseItemFull[]) {
    let totalPeso = 0;
    for (const paquete of paquetes) {
      totalPeso = totalPeso + Number(paquete.weight);
    }
    this.totalWeight = totalPeso;
  }

  onPrint() {
    window.print();
  }
}
