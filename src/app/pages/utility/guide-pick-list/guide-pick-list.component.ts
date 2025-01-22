import { ChangeDetectorRef, Component, Inject, Injector, OnInit } from '@angular/core';
import icMail from '@iconify/icons-ic/twotone-mail';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { GuidesEntPop } from '../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';
import { GuidesService } from '../../../services/guides.service';
import { WarehouseItemService } from '../../../services/warehouse-item.service';
import { WarehouseItemFull } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { PackageType } from '../../adminModules/package-type-registry/interfaces/package-type.model';
import { initGuide } from '../../../../static-data/tlcargo-static-data';
import { printHTML } from '@vivliostyle/print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '../../../services/address.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Address } from '../../warehousingModules/customers-registry/interfaces/address.model';
import { environment } from '../../../../environments/environment';
import autoTable from 'jspdf-autotable';
import { NgxPrinterService } from 'ngx-printer';

const this_url = environment.this_url;

@Component({
  selector: 'vex-guide-pick-list',
  templateUrl: './guide-pick-list.component.html',
  styleUrls: ['./guide-pick-list.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})

export class GuidePickListComponent implements OnInit {

  icMail = icMail;
  icPhone = icPhone;

  guide: GuidesEntPop = new GuidesEntPop(initGuide);
  packages: WarehouseItemFull[];
  packageType: PackageType;
  q: string;
  creationDate: Date;
  addressBook: Address[];
  billingAddress: Address;
  prefixType = '';
  urlItem = '';
  private dialogRef = null;
  private tlGuide: GuidesEntPop;
  private type = 'guide' || 'quote';

  constructor(private injector: Injector,
    private rutaActiva: ActivatedRoute,
    private printerService: NgxPrinterService,
    private guideService: GuidesService,
    private addressService: AddressService,
    private warehouseService: WarehouseItemService,
    private cd: ChangeDetectorRef) {
    this.dialogRef = this.injector.get(MatDialogRef, null);
    this.tlGuide = this.injector.get(MAT_DIALOG_DATA, null);
  }

  ngOnInit() {

    this.urlItem = `${this_url}/#/warehouse-item-receipt/`;
    this.creationDate = new Date();
    this.billingAddress = new Address({});

    if (this.tlGuide) {
      this.guide._id = this.tlGuide._id;
    } else {
      this.guide._id = this.rutaActiva.snapshot.params._id;
    }

    this.guideService.getGuidetoInvoice(this.guide._id.toString()).subscribe(resp => {
      this.guide = resp.data;
      if (this.guide.quote) {
        this.type = 'quote';
        this.prefixType = this.guide.name.includes('AIR') ? 'AIR' : 'SEA';
      } else {
        this.type = 'guide';
        this.prefixType = this.guide.shipping.type;
      }

      this.addressService.getAddressesToInvoice(this.guide.customer).subscribe((resp2) => {
        this.addressBook = resp2.data;
        this.billingAddress = this.addressBook.filter(address => address.type === '2')[0];
        if (!this.billingAddress) {
          this.billingAddress = this.addressBook.filter(address => address.type === '0')[0];
        }

        if (!this.billingAddress) {
          this.billingAddress = this.addressBook[0];
        }

        this.warehouseService.getWarehouseItemByPackageIds(this.guide.packageList)
          .subscribe(resp3 => {
            this.packages = resp3.data;
            this.cd.detectChanges();
          });
        this.creationDate = new Date(this.guide.creationDate);
        this.calculateQ();
      });


    });

  }

  calculateQ() {
    if (this.prefixType === 'AIR') {
      if (this.guide.finalWeight > this.guide.finalVlb) {
        this.q = this.guide.finalWeight.toString() + ' lb.';
      } else {
        this.q = this.guide.finalVlb.toString() + ' vlb.';
      }
    } else {
      this.q = this.guide.finalVolume.toString();
    }
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

    const guideId = `${(this.guide.shipping.type === 'AIR' ? 'HAWB' : 'HBOL')}-${this.guide._id.toString().substring(0, 5)}${this.guide._id.toString().substring(this.guide._id.toString().toString().length - 5)}`;
    const PDF = new jsPDF('p', 'mm', 'letter');
    const dirfact = `Dirección: ${this.billingAddress.address}, ${this.billingAddress.address2}`;
    const peso = Number(this.guide.finalWeight) > Number(this.guide.finalVlb) ? this.guide.finalWeight + 'libras' : this.guide.finalVlb + 'vlb';
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
    PDF.text('Listado de paquetes de la guia ' + guideId, 10, 45);
    // CABECERAS 1

    PDF.setFontSize(8);
    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(10, 55, 95, 8, 'F');

    PDF.setTextColor(255);
    PDF.setFont('helvetica', 'bold');
    PDF.text('Fecha de creación de guía', 15, 60);

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(110, 55, 95, 8, 'F');
    PDF.text('Numero de recibo de guía', 115, 60);

    // CONTENIDO 1

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(10, 63, 95, 8, 'F');

    PDF.setTextColor(0);
    PDF.setFont('helvetica', 'normal');
    PDF.text(new Date(this.guide.creationDate).toLocaleDateString('es-VE'), 15, 68);

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(110, 63, 95, 8, 'F');
    PDF.setFont('helvetica', 'normal');
    PDF.text(guideId, 115, 68);


    // CABECERAS 2

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(10, 75, 95, 8, 'F');

    PDF.setTextColor(255);
    PDF.setFont('helvetica', 'bold');
    PDF.text('Enviar a: ', 15, 80);

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(110, 75, 95, 8, 'F');
    PDF.text('Detalles del envío', 115, 80);

    // CONTENIDO 2

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(10, 83, 95, 38, 'F');

    PDF.setTextColor(0);
    PDF.setFont('helvetica', 'normal');
    PDF.text(this.guide.customer.name, 15, 88);
    PDF.text('Tel: ' + this.guide.customer.phoneNumber + ' - Email: ' + this.guide.customer.email, 15, 93);
    PDF.text(``, 15, 98);

    PDF.text((dirfact.length) < 58 ? dirfact : dirfact.substring(0, 58), 15, 101);
    if ((dirfact.length) > 58) {
      PDF.text(dirfact.substring(58), 15, 106);
      PDF.text(`${this.billingAddress.city} - ${this.billingAddress.state}, ${this.billingAddress.country}`, 15, 111);
      PDF.text(`Código Postal: ${this.billingAddress.zipcode}`, 15, 116);
    } else {
      PDF.text(`${this.billingAddress.city} - ${this.billingAddress.state}, ${this.billingAddress.country}`, 15, 106);
      PDF.text(`Código Postal: ${this.billingAddress.zipcode}`, 15, 111);
    }

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(110, 83, 95, 38, 'F');
    PDF.setFont('helvetica', 'normal');
    PDF.text('Recibe:' + this.guide.customer.name, 115, 88);
    PDF.text('Origen / Destino: ' + this.guide.shipping.departureHub.city + ' / ' + this.guide.shipping.arrivalHub.city, 115, 93);
    PDF.text('Fecha de creación: ' + this.guide.creationDate, 115, 98);
    PDF.text('House Bill: ' + guideId, 115, 103);
    PDF.text('Paquetes / Peso: ' + this.guide.packageList.length + ' / ' + peso, 115, 108);
    PDF.text('Nombre del envio: ' + this.guide.shipping.name, 115, 113);

    autoTable(PDF, {
      html: '#table1', theme: 'striped',
      styles: {
        fontSize: 8
      },
      startY: 125,
      useCss: true
    });

    autoTable(PDF, {
      html: '#table2', theme: 'striped',
      headStyles: {
        fillColor: [104, 203, 208]
      },
      styles: {
        fontSize: 8
      },
      startY: 150,
      useCss: false
    });

    autoTable(PDF, {
      html: '#table3', theme: 'plain',
      startY: 240,
      useCss: true
    });

    PDF.save('pickList_' + guideId + '.pdf');
  }

  onPrint() {
    this.printerService.printDiv('printable');
  }

}
