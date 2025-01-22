import { Component, Inject, Injector, OnInit } from '@angular/core';
import icMail from '@iconify/icons-ic/twotone-mail';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { GuidesEntPop } from '../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model';
import { GuidesService } from '../../../services/guides.service';
import { initGuide, paymentGuideStatus } from '../../../../static-data/tlcargo-static-data';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '../../../services/address.service';
import { Address } from '../../warehousingModules/customers-registry/interfaces/address.model';
import { PaymentBitacoraInterface } from '../../../interfaces/payment-bitacora-data-table.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import autoTable from 'jspdf-autotable';
import { WarehouseItemFull } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { NgxPrinterService } from 'ngx-printer';

@Component({
  selector: 'vex-guide-invoice',
  templateUrl: './guide-invoice.component.html',
  styleUrls: ['./guide-invoice.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class GuideInvoiceComponent implements OnInit {

  icMail = icMail;
  icPhone = icPhone;
  paymentGuideStatus = paymentGuideStatus;
  guide: GuidesEntPop = new GuidesEntPop(initGuide);
  q: string;
  finalCost = 0;
  previewClass = '';
  statusText = '';
  creationDate: Date;
  addressBook: Address[];
  billingAddress: Address;
  discountRegistry: PaymentBitacoraInterface[];
  totalDiscount = 0;
  paidAmount = 0;
  prefixType = '';

  private dialogRef = null;
  private data: any;
  private tlPackage: WarehouseItemFull;
  private tlGuide: number;
  private type;
  private protected

  constructor(private printerService: NgxPrinterService,
    private injector: Injector,
    private rutaActiva: ActivatedRoute,
    private guideService: GuidesService,
    private addressService: AddressService) {
    this.dialogRef = this.injector.get(MatDialogRef, null);
    this.data = this.injector.get(MAT_DIALOG_DATA, null);
  }

  ngOnInit() {
    this.creationDate = new Date();
    this.billingAddress = new Address({});

    if (this.data) {
      if (this.data.guide) {
        this.tlGuide = this.data.guide._id;
      }

      if (this.data.tlPackage) {
        this.tlPackage = this.data.tlPackage;
        this.tlGuide = this.tlPackage.guide;
      }

    }

    if (this.rutaActiva.snapshot.params._id) {
      this.tlGuide = this.rutaActiva.snapshot.params._id;
    }

    this.guideService.getGuidetoInvoice(this.tlGuide.toString()).subscribe(resp => {
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

        this.discountRegistry = this.guide.paymentBitacora.filter(pbRegistry => pbRegistry.discount > 0);
        this.totalDiscount = this.discountRegistry.reduce((accumulator, currentValue) => accumulator + currentValue.discount, 0);
        if (this.guide.paymentStatus === '3') {
          this.paidAmount = this.guide.paymentBitacora.filter(pbRegistry => pbRegistry.paidAmount > 0)
            .reduce((accumulator, currentValue) => accumulator + currentValue.paidAmount, 0);
        } else {
          this.paidAmount = 0;
        }

        this.creationDate = new Date(this.guide.creationDate);
        this.previewClass = this.selectStatusById(this.guide.paymentStatus).previewClass;
        this.statusText = this.selectStatusById(this.guide.paymentStatus).text;
        this.calculateQ();
      });
    });
  }

  onPrint() {
    this.printerService.printDiv('printable');
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.paymentGuideStatus.filter(status => status.id === statusId);
    return selectedStatusArray[0];
  }

  calculateQ() {

    if (this.prefixType === 'AIR') {
      if (this.guide.finalWeight > this.guide.finalVlb) {
        this.q = this.guide.finalWeight.toFixed(2).toString() + ' lb.';
        this.finalCost = Number(this.guide.rate.rate) * Number(this.guide.finalWeight);
      } else {
        this.q = this.guide.finalVlb.toFixed(2).toString() + ' vlb.';
        this.finalCost = Number(this.guide.rate.rate) * Number(this.guide.finalVlb);
      }

    } else {
      this.q = this.guide.finalVolume.toFixed(2).toString();
      this.finalCost = Number(this.guide.rate.rate) * Number(this.guide.finalVolume);
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

    const guideId = this.guide.tlCargoId;
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

    const DATA: any = document.getElementById('guideBarCode');

    html2canvas(DATA).then((canvas) => {
      const FILEURI = canvas.toDataURL('image/png');
      PDF.addImage(FILEURI, 'PNG', 10, 35, 140, 10);
      PDF.save('invoice_' + guideId + '.pdf');
    });

    // CABECERAS 1

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(10, 55, 95, 8, 'F');

    PDF.setTextColor(255);
    PDF.setFont('helvetica', 'bold');
    PDF.text('Fecha', 15, 60);
    PDF.text('Fecha de vencimiento', 30, 60);
    PDF.text('Numero de recibo', 70, 60);

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(110, 55, 95, 8, 'F');
    PDF.text('Terminos de pago', 115, 60);

    // CONTENIDO 1

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(10, 63, 95, 8, 'F');

    PDF.setTextColor(0);
    PDF.setFont('helvetica', 'normal');
    PDF.text(new Date(this.guide.creationDate).toLocaleDateString('es-VE'), 15, 68);
    PDF.text(new Date(this.guide.creationDate).toLocaleDateString('es-VE'), 30, 68);
    PDF.setFont('helvetica', 'bold');
    PDF.text(guideId, 70, 68);

    PDF.setDrawColor(255);
    PDF.setFillColor(235, 245, 255);
    PDF.rect(110, 63, 95, 8, 'F');
    PDF.setFont('helvetica', 'normal');
    PDF.text('Pago en entrega', 115, 68);


    // CABECERAS 2

    PDF.setDrawColor(255);
    PDF.setFillColor(104, 203, 208);
    PDF.rect(10, 75, 95, 8, 'F');

    PDF.setTextColor(255);
    PDF.setFont('helvetica', 'bold');
    PDF.text('Facturar a: ', 15, 80);

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
    PDF.text('Origen / Destino: ' + this.guide.quote ? 'MIAMI' : this.guide.shipping.departureHub.city + ' / ' + this.guide.quote ? 'CCS' : this.guide.shipping.arrivalHub.city, 115, 93);
    PDF.text('Fecha de creación: ' + this.guide.creationDate, 115, 98);
    PDF.text('House Bill: ' + guideId, 115, 103);
    PDF.text('Paquetes / Peso: ' + this.guide.packageList.length + ' / ' + peso, 115, 108);
    PDF.text('Nombre del envio: ' + this.guide.shipping.name, 115, 113);

    autoTable(PDF, {
      html: '#table1', theme: 'striped',
      styles: {
        fontSize: 10
      },
      startY: 130,
      useCss: true
    });

    autoTable(PDF, {
      html: '#table2', theme: 'plain',
      startY: 195,
      useCss: true
    });


  }

  toNumber(value: string) {
    return Number(value);
  }
}
