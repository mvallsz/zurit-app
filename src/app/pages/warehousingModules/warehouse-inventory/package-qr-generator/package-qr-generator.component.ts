import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { NgxPrinterService } from "ngx-printer";

@Component({
  selector: "vex-package-qr-generator",
  templateUrl: "./package-qr-generator.component.html",
  styleUrls: ["./package-qr-generator.component.scss"],
})
export class PackageQrGeneratorComponent implements OnInit {
  constructor(private printerService: NgxPrinterService,
    @Inject(MAT_DIALOG_DATA) public defaults: any) { }

  ngOnInit(): void { }


  onPrint() {
    this.printerService.printDiv("printable");
  }

  public openPDF(): void {

    const PDF = new jsPDF("p", "mm", "a5", true);
    const size = this.defaults.tlPackages.length;
    for (let i = 0; i < size; i++) {
      const qrId = "QR-" + i;
      const DATA: any = document.getElementById(qrId);
      html2canvas(DATA).then((canvas) => {
        const FILEURI = canvas.toDataURL("image/png");
        PDF.addImage(FILEURI, "PNG", 4, 5, 140, 200, '', 'FAST');
        if (i < (size - 1)) {
          PDF.addPage("a5", "p");
        }

        if (i === (size - 1)) {
          const printWindow = window.open();

          // Set the source to the PDF URL
          printWindow.document.write('<iframe src="' + PDF.output('bloburl') + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');

          // Wait for the PDF to load
          printWindow.document.close();
          //var blobPDF = new Blob([PDF.output()], { type: 'application/pdf' });
          //const pdfUrl = URL.createObjectURL(blobPDF);
          //const printWindow = window.open(pdfUrl);

        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  public printPDF(pdfFile: Blob) {
    // Create an object URL for the file
    const pdfUrl = URL.createObjectURL(pdfFile);

    // Create a new window or iframe
    const printWindow = window.open();

    // Set the source to the PDF URL
    printWindow.document.write('<iframe src="' + pdfUrl + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');

    // Wait for the PDF to load
    printWindow.document.close();
    printWindow.onload = function () {
      // Call the print function
      printWindow.print();
    };
  }
}

