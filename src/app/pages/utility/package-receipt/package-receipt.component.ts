import { Component, Inject, Injector, OnInit } from '@angular/core';
import icMail from '@iconify/icons-ic/twotone-mail';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { WarehouseItemFull } from '../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { ActivatedRoute, Params } from '@angular/router';
import { WarehouseItemService } from '../../../services/warehouse-item.service';
import { ServiceResponse } from '../../../interfaces/service-response.interface';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { TlCargoIdPipe } from 'src/app/pipes/tl-cargo-id/tl-cargo-id.pipe';
import { initPack } from 'src/static-data/tlcargo-static-data';
import { NgxPrinterService } from 'ngx-printer';



@Component({
  selector: 'vex-package-receipt',
  templateUrl: './package-receipt.component.html',
  styleUrls: ['./package-receipt.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class PackageReceiptComponent implements OnInit {

  base_url = environment.base_url;
  icMail = icMail;
  icPhone = icPhone;
  packageTL = new WarehouseItemFull(initPack);
  private dialogRef = null;
  private tlPackage: WarehouseItemFull;
  receptionDate = new Date();

  constructor(private injector: Injector,
    private printerService: NgxPrinterService,
    private rutaActiva: ActivatedRoute,
    private warehouseItemService: WarehouseItemService,
    private tlCargoIdPipe: TlCargoIdPipe) {
    this.dialogRef = this.injector.get(MatDialogRef, null);
    this.tlPackage = this.injector.get(MAT_DIALOG_DATA, null);

  }

  ngOnInit() {
    let warehouseId = 0;
    if (this.tlPackage) {
      warehouseId = this.tlPackage._id;
    } else {
      warehouseId = this.rutaActiva.snapshot.params.warehouseItem;
    }

    this.warehouseItemService.getWarehouseItemFullByIdToInvoice(warehouseId.toString())
      .subscribe((paq: ServiceResponse) => {
        this.packageTL = paq.data[0];
        this.receptionDate = new Date(this.packageTL.receptionDate);
      });

  }

  onPrint() {
    this.printerService.printDiv('printable');
  }

  public openPDF(): void {
    const tlCargoId = this.packageTL.tlCargoId;
    const DATA: any = document.getElementById('printable');
    const DATAIMG: any = document.getElementById('tlPackageImg');

    const PDF = new jsPDF('p', 'mm', 'letter');

    html2canvas(DATA).then((canvas) => {
      const fileWidth = 208;
      const fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      const position = 0;
      //fileHeight
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, 290);
      html2canvas(DATAIMG).then((canvas2) => {
        const fileWidth = 10;
        const fileHeight = (canvas2.height * fileWidth) / canvas2.width;
        const FILEURI2 = canvas2.toDataURL('image/png');
        const position2 = 15;
        //
        PDF.addImage(FILEURI2, 'PNG', 0, position2, fileWidth, fileHeight);
        PDF.save(tlCargoId + '.pdf');
      });
    });


  }

}
