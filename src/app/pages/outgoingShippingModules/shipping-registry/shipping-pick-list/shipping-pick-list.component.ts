/* tslint:disable:no-shadowed-variable */
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import icMail from '@iconify/icons-ic/twotone-mail';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WarehouseItemService } from '../../../../services/warehouse-item.service';
import { WarehouseItemFull } from '../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { ShippingEnt } from '../interfaces/shipping.model';
import { ShippingService } from '../../../../services/shipping.service';
import { shippingStatus } from '../../../../../static-data/tlcargo-static-data';
import { GuidesEntPop } from '../../shipping-guides/interfaces/guides-ent-pop.model';
import { WarehouseItemFullWGuideInfoModel } from '../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full-w-guide-info.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxPrinterService } from 'ngx-printer';

@Component({
  selector: 'vex-shipping-pick-list',
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
  packageQ = 0;
  totalWeight = 0;
  totalVolume = 0;
  finalWeight = 0;
  finalVolume = 0;
  finalVlb = 0;
  totalVlb = 0;
  status = shippingStatus;
  statusPrint: any;
  departureDate: Date;

  constructor(@Inject(MAT_DIALOG_DATA) public shipping: ShippingEnt,
    private printerService: NgxPrinterService,
    private shippingService: ShippingService,
    private warehouseService: WarehouseItemService,
    private cd: ChangeDetectorRef) {
    this.statusPrint = this.status.filter(statusP => (statusP.id === this.shipping.status));
  }

  ngOnInit() {
    this.departureDate = new Date(this.shipping.departureDate);
    this.shippingService.getShippingGuidesAndPackageList(this.shipping._id.toString())
      .subscribe(resp => {

        this.guides = resp.data;
        this.packagesGuided = new Array();
        this.packages = new Array();
        this.finalWeight = this.guides.reduce((accumulator, data) => accumulator + data.finalWeight, 0);
        this.finalVolume = this.guides.reduce((accumulator, data) => accumulator + data.finalVolume, 0);
        this.finalVlb = this.guides.reduce((accumulator, data) => accumulator + data.finalVlb, 0);

        for (const guide of this.guides) {

          this.totalWeight += guide.finalWeight;
          this.totalVolume += guide.finalVolume;
          this.totalVlb += guide.finalVlb;

          this.packages = this.packages.concat(guide.packageList);
          let cont = 0;
          for (const tlPackage of guide.packageList) {
            if (cont === 0) {
              if (guide.type === '3') {
                const packageGuided = new WarehouseItemFullWGuideInfoModel({});
                packageGuided._id = guide._id.toString();
                packageGuided.shortDesc = 'Repacked - ' + guide.packageList[0].customer.name + ' - ' + guide.packageList[0].customer.tlCargoName;
                // tslint:disable-next-line:max-line-length
                packageGuided.measurement = 'H:' + guide.packageType[0].height + ' x W:' + guide.packageType[0].width + ' x L:' + guide.packageType[0].length;
                packageGuided.weight = String(guide.finalWeight);
                packageGuided.volume = String(guide.finalVolume);
                packageGuided.vlb = String(guide.finalVlb);
                packageGuided.guide = guide;
                packageGuided.guideFlag = true;
                this.packagesGuided.push(packageGuided);
              } else if (guide.type === '1') {
                const packageGuided = new WarehouseItemFullWGuideInfoModel({});
                packageGuided._id = guide._id.toString().substr(0, 10);
                packageGuided.shortDesc = guide.packageList[0].customer.name + ' - ' + guide.packageList[0].customer.tlCargoName;
                packageGuided.measurement = 'H:' + tlPackage.package.height + ' x W:' + tlPackage.package.width + ' x L:' + tlPackage.package.length;
                packageGuided.weight = String(guide.finalWeight);
                packageGuided.volume = String(guide.finalVolume);
                packageGuided.vlb = String(guide.finalVlb);
                packageGuided.guide = guide;
                packageGuided.guideFlag = true;
                this.packagesGuided.push(packageGuided);
              } else {
                const packageGuided = new WarehouseItemFullWGuideInfoModel({});
                packageGuided._id = guide._id.toString().substr(0, 10);
                packageGuided.shortDesc = guide.name;
                packageGuided.measurement = '';
                packageGuided.weight = String(guide.finalWeight);
                packageGuided.volume = String(guide.finalVolume);
                packageGuided.vlb = String(guide.finalVlb);
                packageGuided.guide = guide;
                packageGuided.guideFlag = true;
                this.packagesGuided.push(packageGuided);
              }
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

  }

  public toNumber(number: String) {
    return Number(number);
  }

  public reglasPDF(PDF): void {
    PDF.setFontSize(5);
    for (let i = 0; i < 220; i += 5) {
      PDF.text(i.toString(), i, 5);
    }
    for (let i = 0; i < 280; i += 5) {
      PDF.text(i.toString(), 1, i);
    }
  }

  public openPDF() {

    const shipId = `${this.shipping.type}-${this.shipping._id.toString().substring(0, 5)}${this.shipping._id.toString().substring(this.shipping._id.toString().toString().length - 5)}`;
    const PDF = new jsPDF('p', 'mm', 'letter');
    const img = new Image();
    img.src = 'assets/img/tlcargo/tl_cargo_3.png';
    PDF.addImage(img, 'png', 10, 10, 20, 20);

    PDF.setFontSize(12);
    PDF.text('TL Cargo', 175, 14);
    PDF.setFontSize(8);
    PDF.text('8520 NW 66th St', 175, 18);
    PDF.text('MIAMI, FL 33166.', 175, 22);
    PDF.text('UNITED STATES', 175, 26);
    PDF.text('Tel: (USA) 786-409-7088', 175, 30);
    PDF.text('Tel: (VE) 212-7204488', 175, 34);

    PDF.setFontSize(14);
    PDF.text(this.shipping.name + '\'s package List', 10, 45);
    // CABECERAS 1

    PDF.setFontSize(8);
    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(10, 55, 95, 8, 'F');

    PDF.setTextColor(255);
    PDF.setFont('helvetica', 'bold');
    PDF.text('Ship Departure Date', 15, 60);

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(110, 55, 95, 8, 'F');
    PDF.text('Ship Number', 115, 60);

    // CONTENIDO 1

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(10, 63, 95, 8, 'F');

    PDF.setTextColor(0);
    PDF.setFont('helvetica', 'normal');
    PDF.text(new Date(this.shipping.departureDate).toLocaleDateString('es-VE'), 15, 68);

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(110, 63, 95, 8, 'F');
    PDF.setFont('helvetica', 'normal');
    PDF.text(shipId + ' - ' + this.statusPrint[0].text, 115, 68);


    // CABECERAS 2

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(10, 75, 95, 8, 'F');

    PDF.setTextColor(255);
    PDF.setFont('helvetica', 'bold');
    PDF.text('Destination Warehouse: ', 15, 80);

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(110, 75, 95, 8, 'F');
    PDF.text('Details', 115, 80);

    // CONTENIDO 2

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(10, 83, 95, 38, 'F');

    PDF.setTextColor(0);
    PDF.setFont('helvetica', 'normal');
    PDF.text(this.shipping.arrivalHub.name, 15, 88);
    PDF.text('Tel: ' + this.shipping.arrivalHub.phoneNumber + ' - Email: ' + this.shipping.arrivalHub.mail, 15, 93);
    PDF.text(`${this.shipping.arrivalHub.street} - ${this.shipping.arrivalHub.city}`, 15, 98);
    PDF.text(`Zip Code: ${this.shipping.arrivalHub.zipcode}`, 15, 103);

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(110, 83, 95, 38, 'F');
    PDF.setFont('helvetica', 'normal');
    PDF.text(`Shipment Name: ${this.shipping.name}`, 115, 88);
    PDF.text(`Origin/Destination: ${this.shipping.departureHub.city} / ${this.shipping.arrivalHub.city}`, 115, 93);
    PDF.text(`Departure Date: ${this.shipping.departureDate}`, 115, 98);
    PDF.text(`Estimate Arrival Date: ${this.shipping.arrivalDate}`, 115, 103);
    PDF.text(`Guides / Packages: ${this.guides.length} / ${this.packageQ}`, 115, 108);
    PDF.text(`Weight / Vlb / Volume: ${this.totalWeight.toFixed(2)} lb / ${this.totalVlb.toFixed(2)} vlb. / ${this.totalVolume.toFixed(2)} ft3`, 115, 113);

    autoTable(PDF, {
      html: '#table1', theme: 'striped',
      startY: 100,
      useCss: true
    });

    PDF.save('pickList_' + shipId + '.pdf');
  }

  onPrint() {
    this.printerService.printDiv('printable');
  }

}
