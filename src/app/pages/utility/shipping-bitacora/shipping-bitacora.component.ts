/* tslint:disable:no-shadowed-variable */
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import icMail from '@iconify/icons-ic/twotone-mail';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { WarehouseItemService } from '../../../services/warehouse-item.service';
import { WarehouseItemFull } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { ShippingService } from '../../../services/shipping.service';
import { initShipping, shippingStatus } from '../../../../static-data/tlcargo-static-data';
import { GuidesEntPop } from '../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';
import { WarehouseItemFullWGuideInfoModel } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full-w-guide-info.model';
import { ActivatedRoute } from '@angular/router';
import { ShippingEnt } from '../../outgoingShippingModules/shipping-registry/interfaces/shipping.model';
import { QrGeneratorComponent } from '../../warehousingModules/warehouse-inventory/qr-generator/qr-generator.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManifestData } from 'src/app/interfaces/manifest-data-table.interface';
import { NgxPrinterService } from 'ngx-printer';

@Component({
  selector: 'vex-shipping-bitacora-print',
  templateUrl: './shipping-bitacora.component.html',
  styleUrls: ['./shipping-bitacora.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class ShippingBitacoraComponent implements OnInit {

  icMail = icMail;
  icPhone = icPhone;
  type: string;

  packages: WarehouseItemFull[];
  shippingManifest: ManifestData[];

  shipping: ShippingEnt = new ShippingEnt(initShipping);
  packageQ = 0;
  totalWeight = 0;

  constructor(private printerService: NgxPrinterService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    this.shippingManifest = new Array<ManifestData>();
    this.packages = new Array<WarehouseItemFull>();

  }

  ngOnInit() {
    this.shipping = this.data.shipping;
    this.type = this.data.type;
    this.shippingManifest = this.shippingManifest.concat(this.shipping.shippingManifest.map(x => {
      const packageList = new Array<WarehouseItemFull>();
      x.packageList = packageList;
      return x;
    }));
    this.packages = this.data.packages;
    this.packageQ = this.packages.length;
    this.totalWeight = this.packages.reduce((a, b) => a + Number(b.weight), 0);
    this.orderShippingManifest();
  }

  orderShippingManifest() {

    for (const tlPackage of this.packages) {
      if (tlPackage.shipContainer) {
        if (this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === tlPackage.shipContainer)[0])].packageList) {
          this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === tlPackage.shipContainer)[0])].packageList.push(tlPackage);
        } else {
          const packageList = new Array<WarehouseItemFull>();
          packageList.push(tlPackage);
          this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === tlPackage.shipContainer)[0])].packageList = packageList;
        }
      } else {
        tlPackage.shipContainer = 'Loose Packages';
        this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === 'N/A')[0])].packageList.push(tlPackage);
        this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === 'N/A')[0])].finalVlb += Number(tlPackage.vlb);
        this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === 'N/A')[0])].finalVolume += Number(tlPackage.volume);
        this.shippingManifest[this.shippingManifest.indexOf(this.shippingManifest.filter(x => x.shortDesc === 'N/A')[0])].finalWeight += Number(tlPackage.weight);
      }
    }
    this.packages.sort((a, b) => a.shipContainer.localeCompare(b.shipContainer));
  }

  calculaTotalPeso(paquetes: WarehouseItemFull[]) {
    let totalPeso = 0;
    for (const paquete of paquetes) {

      totalPeso = totalPeso + Number(paquete.weight);
    }
    this.totalWeight = totalPeso;

  }

  onPrint() {
    this.printerService.printDiv('printable');
  }
}
