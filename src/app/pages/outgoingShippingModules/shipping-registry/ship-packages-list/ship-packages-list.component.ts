import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { GuidesEntPop } from "../../shipping-guides/interfaces/guides-ent-pop.model";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { TableColumn } from "../../../../../@vex/interfaces/table-column.interface";
import { initPack, initShipping, packageStatus, shippingSettleStatus, shippingStatus } from "../../../../../static-data/tlcargo-static-data";

import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import { SelectionModel } from "@angular/cdk/collections";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icFolder from "@iconify/icons-ic/twotone-folder";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import { stagger40ms } from "../../../../../@vex/animations/stagger.animation";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icCheck from "@iconify/icons-ic/twotone-checklist";

import { MatSnackBar } from "@angular/material/snack-bar";
import { GuidesService } from "../../../../services/guides.service";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import Swal from "sweetalert2";
import { WarehouseItemService } from "../../../../services/warehouse-item.service";
import icPrint from "@iconify/icons-ic/twotone-print";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { NgxSpinnerService } from "ngx-spinner";
import { WarehouseItemFull } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { AssignToPalletComponent } from "../settle-shipping/assign-to-pallet/assign-to-pallet.component";
import { AssignToDeliveryComponent } from "../assign-to-delivery/assign-to-delivery.component";
import { ShippingService } from "../../../../services/shipping.service";
import icClose from "@iconify/icons-ic/twotone-close";
import { GuidesEnt } from "../../shipping-guides/interfaces/guides-ent.model";

import { CustomerSignatureComponent } from "../customer-signature/customer-signature.component";
import { environment } from "../../../../../environments/environment";
import { MailService } from "../../../../services/mail.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ShippingEnt } from "../interfaces/shipping.model";
import { MACRO_05 } from "@zxing/library/esm/core/datamatrix/encoder/constants";
import { GuidesCreateUpdateComponent } from "../../shipping-guides/guides-create-update/guides-create-update.component";
import { RegistryPackageCreateUpdateComponent } from "src/app/pages/warehousingModules/warehouse-inventory/registry-package-create-update/registry-package-create-update.component";

const this_url = environment.this_url;
const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@UntilDestroy()
@Component({
  selector: "vex-ship-packages-list",
  templateUrl: "./ship-packages-list.component.html",
  styleUrls: ["./ship-packages-list.component.scss"],
  animations: [fadeInUp400ms, stagger40ms],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: "standard",
      } as MatFormFieldDefaultOptions,
    },
  ],
})
export class ShipPackagesListComponent implements OnInit, AfterViewInit {
  urlItem = "";
  currentDevice: MediaDeviceInfo = null;

  layoutCtrl = new FormControl("boxed");

  shipping: ShippingEnt = new ShippingEnt(initShipping);
  guides: GuidesEntPop[];
  guide: GuidesEntPop;
  packages: WarehouseItemFull[] = [new WarehouseItemFull(initPack)];

  @Input()
  columns: TableColumn<WarehouseItemFull>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "Actions", property: "actions", type: "button", visible: true },
    {
      label: "Container",
      property: "shipContainer",
      type: "text",
      visible: true,
    },
    { label: "Assigned To", property: "delivery", type: "text", visible: true },
    { label: "Status", property: "status", type: "text", visible: true },
    { label: "Guide Id", property: "guideId", type: "text", visible: true },
    { label: "Package Id", property: "tlCargoId", type: "text", visible: true },
    { label: "Piece", property: "guideCounter", type: "text", visible: true },
    { label: "Short Desc", property: "shortDesc", type: "text", visible: true },
    { label: "Volume", property: "volume", type: "text", visible: true },
    { label: "Weight", property: "weight", type: "text", visible: true },
    {
      label: "Reception Date",
      property: "receptionDate",
      type: "text",
      visible: true,
      cssClasses: ["text-secondary", "font-medium"],
    },
  ];

  status = packageStatus;
  shipStatus = shippingSettleStatus;
  shipStatusNo = shippingStatus;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<WarehouseItemFull> | null;
  selection = new SelectionModel<WarehouseItemFull>(true, []);
  searchCtrl = new FormControl();

  icPhone = icPhone;
  icMail = icMail;
  icMap = icMap;
  icEdit = icEdit;
  icSearch = icSearch;
  icDelete = icDelete;
  icAdd = icAdd;
  icFilterList = icFilterList;
  icMoreHoriz = icMoreHoriz;
  icFolder = icFolder;
  icCheck = icCheck;
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icList = icListAlt;
  icClose = icClose;

  scanOn = false;
  scanOk = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private rutaActiva: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private shippingService: ShippingService,
    private guidesService: GuidesService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private guideService: GuidesService,
    private packageService: WarehouseItemService,
    private mailService: MailService
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {

    const shippingId = this.rutaActiva.snapshot.params.shippingId;

    this.spinner.show("packagesSpinner");
    this.dataSource = new MatTableDataSource();

    this.shippingService.getShippingById(shippingId).subscribe((resp: ServiceResponse) => {
      this.shipping = resp.data[0];
      if (this.shipping.guidesCount === 0) {
        Swal.fire({
          title: "No guides found",
          icon: "info",
          text: "The shipping has no guides, please create a guide first to access this functionality",
          confirmButtonText: "Ok",
        }).then(() => {
          this.router.navigate(["/app/ships"]);
        });
      }
      this.guidesService.getPopGuideByShippingId(this.shipping._id.toString())
        .subscribe((respGuides: ServiceResponse) => {
          if (respGuides.ok) {
            this.guides = respGuides.data.filter((guide) => !guide.quote);

            let index = 0;
            for (const guide of this.guides) {
              if (index === 0) {
                this.packages = guide.packageList.map((packageItem) => { return { ...packageItem, guideId: guide.tlCargoId } });
              } else {
                this.packages = this.packages.concat(guide.packageList.map((packageItem) => { return { ...packageItem, guideId: guide.tlCargoId } }));
              }
              index++;
            }

            this.dataSource.data = this.packages;
            this.sort.sort({ id: "guideId", start: "desc" } as MatSortable);
            this.dataSource.sort = this.sort;
          }
          this.spinner.hide("packagesSpinner");
        });
    });

    this.searchCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onFilterChange(value));

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.sort({ id: "creationDate", start: "desc" } as MatSortable);
    this.dataSource.sort = this.sort;
    this.cd.detectChanges();
  }


  selectShipStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.shipStatus.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  selectShipStatusNoById(statusId: string) {
    const selectedStatusArray: any[] = this.shipStatusNo.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  openScanner() {
    this.scanOn = true;
  }

  closeScanner() {
    this.scanOn = false;
    this.updateShippingPackageInfo();
  }

  scanSuccessHandler(qrCode: string) {
    if (!this.scanOk) {
      const qrSplit = qrCode.split("/");
      const packageId = qrSplit[qrSplit.length - 1];
      const guideId = qrSplit[qrSplit.length - 2];
      if (this.isObjectId(guideId) && this.isObjectId(packageId)) {
        this.scanOk = true;
        this.guideService.getGuide(guideId)
          .subscribe((resp: ServiceResponse) => {
            if (resp.ok) {
              this.shippingService.getShippingById(resp.data[0].shipping._id)
                .subscribe((respS: ServiceResponse) => {
                  if (respS.ok) {
                    this.guide = resp.data[0];
                    if (+this.guide.paymentStatus === 2 && +this.guide.status >= 4) {
                      this.packageService.getWarehouseItemFullById(packageId)
                        .subscribe((respW: ServiceResponse) => {
                          switch (+respS.data[0].status) {
                            case 1:
                              if (respW.data[0].shipContainer === "Loose Packages") {
                                Swal.fire({
                                  title: `The status of the shipping is IN PROCESS, you need to assign this Package to a container!, Yes to proceed with the assignment`,
                                  showDenyButton: true,
                                  confirmButtonText: "Yes!",
                                  denyButtonText: `No!`,
                                  width: "400px",
                                  heightAuto: false,
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    this.assignToPallet(respW.data[0]);
                                    this.scanOk = false;
                                  }
                                });
                              } else {
                                Swal.fire({
                                  icon: "error",
                                  title: "Oops...",
                                  text: "The status of the shipping is IN PROCESS, there is nothing more to do with this package at the moment...",
                                });
                                setTimeout(() => {
                                  this.scanOk = false;
                                }, 1000);
                              }

                              break;
                            case 2:
                              Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "The status of the shipping is ON TRANSIT, you have to wait for the shipment arrive to the destination hub to process the package...",
                              });
                              setTimeout(() => {
                                this.scanOk = false;
                              }, 1000);
                              break;
                            case 3:
                              switch (+respW.data[0].status) {
                                case 4:
                                  this.receivePackage(respW.data[0]);
                                  break;
                                case 5:
                                  Swal.fire({
                                    title: `What do you want to do with this package?`,
                                    showDenyButton: true,
                                    confirmButtonText: "Assign a delivery",
                                    confirmButtonColor: "#17A9A7",
                                    denyButtonColor: "#17A9A7",
                                    denyButtonText: `Deliver the package`,
                                    width: "500px",
                                    heightAuto: false,
                                  }).then((resultComplete) => {
                                    if (resultComplete.isConfirmed) {
                                      this.checkPackagesFormGuide(this.guide).then(
                                        (respCheck) => {
                                          if (respCheck) {
                                            this.openAssignDelivery(
                                              this.guide.packageList
                                            );
                                          } else {
                                            this.openAssignDelivery(respW.data);
                                          }
                                        }
                                      );

                                      setTimeout(() => {
                                        this.scanOk = false;
                                      }, 1000);
                                    } else {
                                      this.checkPackagesFormGuide(this.guide).then(
                                        (respCheck) => {
                                          if (respCheck) {
                                            this.openSignaturePad(
                                              this.guide.packageList,
                                              this.guides
                                            );
                                          } else {
                                            this.openSignaturePad(
                                              respW.data,
                                              this.guides
                                            );
                                          }
                                        }
                                      );

                                      setTimeout(() => {
                                        this.scanOk = false;
                                      }, 1000);
                                    }
                                  });
                                  break;
                                case 6:
                                  Swal.fire({
                                    title: `What do you want to do with this package?`,
                                    showDenyButton: true,
                                    confirmButtonText: "Assign a delivery",
                                    confirmButtonColor: "#17A9A7",
                                    denyButtonColor: "#17A9A7",
                                    denyButtonText: `Deliver the package`,
                                    width: "500px",
                                    heightAuto: false,
                                  }).then((resultComplete) => {
                                    if (resultComplete.isConfirmed) {
                                      this.checkPackagesFormGuide(this.guide).then(
                                        (respCheck) => {
                                          if (respCheck) {
                                            this.openAssignDelivery(
                                              this.guide.packageList
                                            );
                                          } else {
                                            this.openAssignDelivery(respW.data);
                                          }
                                        }
                                      );

                                      setTimeout(() => {
                                        this.scanOk = false;
                                      }, 1000);
                                    } else {
                                      this.checkPackagesFormGuide(this.guide).then(
                                        (respCheck) => {
                                          if (respCheck) {
                                            this.openSignaturePad(
                                              this.guide.packageList,
                                              this.guides
                                            );
                                          } else {
                                            this.openSignaturePad(
                                              respW.data,
                                              this.guides
                                            );
                                          }
                                        }
                                      );

                                      setTimeout(() => {
                                        this.scanOk = false;
                                      }, 1000);
                                    }
                                  });
                                  break;
                                case 7:
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "This package is already delivered",
                                  });
                                  setTimeout(() => {
                                    this.scanOk = false;
                                  }, 1000);
                                  break;
                                default:
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "The status of the package is not IN TRANSIT or superior, to process the package ...",
                                  });
                                  setTimeout(() => {
                                    this.scanOk = false;
                                  }, 1000);
                                  break;
                              }
                              break;
                            case 4:
                              switch (+respW.data[0].status) {
                                case 5:
                                  Swal.fire({
                                    title: `What do you want to do with this package?`,
                                    showDenyButton: true,
                                    confirmButtonText: "Assign a delivery",
                                    confirmButtonColor: "#17A9A7",
                                    denyButtonColor: "#17A9A7",
                                    denyButtonText: `Deliver the package`,
                                    width: "500px",
                                    heightAuto: false,
                                  }).then((resultComplete) => {
                                    if (resultComplete.isConfirmed) {
                                      this.checkPackagesFormGuide(this.guide).then(
                                        (respCheck) => {
                                          if (respCheck) {
                                            this.openAssignDelivery(this.guide.packageList);
                                          } else {
                                            this.openAssignDelivery(respW.data);
                                          }
                                        }
                                      );

                                      setTimeout(() => {
                                        this.scanOk = false;
                                      }, 1000);
                                    } else {
                                      this.checkPackagesFormGuide(this.guide).then(
                                        (respCheck) => {
                                          if (respCheck) {
                                            this.openSignaturePad(
                                              this.guide.packageList,
                                              this.guides
                                            );
                                          } else {
                                            this.openSignaturePad(
                                              respW.data,
                                              this.guides
                                            );
                                          }
                                        }
                                      );

                                      setTimeout(() => {
                                        this.scanOk = false;
                                      }, 1000);
                                    }
                                  });
                                  break;
                                case 6:
                                  this.openSignaturePad(respW.data, this.guides);
                                  setTimeout(() => {
                                    this.scanOk = false;
                                  }, 1000);
                                  break;
                                case 7:
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "This package is already delivered",
                                  });
                                  setTimeout(() => {
                                    this.scanOk = false;
                                  }, 1000);
                                  break;
                                default:
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "The status of the package is not ON DESTINATION or ON ROUTE",
                                  });
                                  setTimeout(() => {
                                    this.scanOk = false;
                                  }, 1000);
                                  break;
                              }
                              break;
                          }
                        });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title:
                          "Oops... The payment status of the guide is not paid!!",
                        text: "If you want to deliver the packages guide or assign it to a route, it is necessary to process the payment.",
                      });

                      setTimeout(() => {
                        this.scanOk = false;
                      }, 1000);
                    }
                  } else {
                    this.openSnackbar(resp.msg);
                  }
                });
            } else {
              this.openSnackbar(resp.msg);
            }
          });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "QR CODE not suported!!",
        });
      }
    }
  }

  isObjectId(num) {
    if (num.length !== 24) {
      return false;
    } else {
      return Boolean(num.match(/^[a-zA-Z0-9_.-]*$/i));
    }
  }

  updateShippingPackageInfo() {
    this.spinner.show("packagesSpinner");
    this.shippingService
      .getShippingGuidesAndPackageList(this.shipping._id.toString())
      .subscribe((resp: ServiceResponse) => {
        let finalPackageList = new Array();
        for (const guide of resp.data) {
          finalPackageList = finalPackageList.concat(guide.packageList.map((packageItem) => { return { ...packageItem, guideId: guide.tlCargoId } }));
        }

        this.dataSource.data = finalPackageList;
        this.cd.detectChanges();
        this.spinner.hide("packagesSpinner");
      });
  }

  async checkPackagesFormGuide(guide: GuidesEntPop): Promise<boolean> {
    let canProcessAll = true;
    let respCheck = false;
    if (guide.packageList.length > 1) {
      for (const tlPackagefromList of guide.packageList) {
        if (tlPackagefromList.status < "5") {
          canProcessAll = false;
        }
      }
      if (canProcessAll) {
        await Swal.fire({
          title: `This package is part of a guide with more packages!!`,
          text: `You want to deliver or assign all the guide (${guide.tlCargoId}) packages to route??`,
          showDenyButton: true,
          confirmButtonText: "Yes!",
          denyButtonText: `No!`,
          width: "500px",
          heightAuto: false,
        }).then((resultCompleteToAll) => {
          respCheck = resultCompleteToAll.isConfirmed;
        });
      }
    }
    return respCheck;
  }

  receivePackage(tlPackages: WarehouseItemFull[]) {

    let packageToShow = "";

    if (!Array.isArray(tlPackages)) {
      tlPackages = [tlPackages];
    }

    for (const tlPackage of tlPackages) {
      const guide = this.guides.filter((guideItem) => guideItem._id === tlPackage.guide)[0];
      packageToShow += `[Guide: ${guide.tlCargoId} / Pkg: ${tlPackage.tlCargoId} / Piece: ${tlPackage.guideCounter}]<br>`;
    }

    packageToShow = packageToShow.slice(0, -4);


    Swal.fire({
      title: `You are about to record the following packages in the deposit:`,
      html: packageToShow,
      showDenyButton: true,
      confirmButtonText: "Yes!",
      denyButtonText: `No!`,
      width: "500px",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        for (const tlPackage of tlPackages) {
          tlPackage.status = "5";
          this.packageService.updateWarehouseItem(tlPackage).subscribe(
            (respFromUpdate: ServiceResponse) => {
              if (respFromUpdate.ok) {
                const guide = this.guides.filter((guideItem) => guideItem._id === tlPackage.guide)[0];
                this.sendNotification(tlPackage, guide);
                this.openSnackbar("Customer notified correctly!");

                if (guide.packageList.length > 1) {
                  this.packageService.isGuideComplete(tlPackage.guide.toString(), "5").subscribe(
                    (respIsComplete: ServiceResponse) => {
                      if (respIsComplete.ok) {
                        if (respIsComplete.data) {
                          const guideToUpdate = new GuidesEnt({});
                          guideToUpdate.status = "5";
                          guideToUpdate._id = tlPackage.guide;

                          this.guideService.updateGuide(guideToUpdate).subscribe(
                            (respGuideUpdated: ServiceResponse) => {
                              if (respGuideUpdated.ok) {
                                this.openSnackbar("All the packages of the guide have been received in the warehouse, the guide status has now changed to ON DESTINATION");
                              } else {
                                this.openSnackbar(respGuideUpdated.msg);
                              }
                            });
                        }
                      }
                    });
                } else {

                  const guideToUpdate = new GuidesEnt({});
                  guideToUpdate.status = "5";
                  guideToUpdate._id = tlPackage.guide;

                  this.guideService.updateGuide(guideToUpdate).subscribe(
                    (respGuideUpdated: ServiceResponse) => {
                      if (respGuideUpdated.ok) {
                        this.openSnackbar("All the packages of the guide have been received in the warehouse, the guide status has now changed to ON DESTINATION");
                      } else {
                        this.openSnackbar(respGuideUpdated.msg);
                      }
                    });
                }

                this.openSnackbar("The package status has now changed to ON DESTINATION");
                setTimeout(() => {
                  this.scanOk = false;
                }, 1000);
              }
            }
          );
        }
        this.selection.clear();
      }
    });
  }

  changeShipStatus() {

    let packageToShow = "";
    Swal.fire({
      title: `You are about to change the status of the shipping: ${this.shipping.name} to ${this.selectShipStatusNoById('3').text}!!`,
      showDenyButton: true,
      confirmButtonText: "Yes!",
      denyButtonText: `No!`,
      width: "500px",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.shipping.status = "3";
        this.shippingService.updateShipping(this.shipping).subscribe(
          (respFromUpdate: ServiceResponse) => {
            if (respFromUpdate.ok) {
              this.openSnackbar("Updated shipping correctly!");
            }
          }
        );
      }
    });
  }

  deliverPackage(tlPackages: WarehouseItemFull[]) {

    if (!Array.isArray(tlPackages)) {
      tlPackages = [tlPackages];
    }

    const guide = this.guides.filter((guideItem) => guideItem._id === tlPackages[0].guide)[0];

    for (let i = 0; i < tlPackages.length; i++) {

      if (guide._id != tlPackages[i].guide) {
        Swal.fire({
          icon: "error",
          title:
            "Oops... You cannot deliver multiple packages of different guides at the same time!!",
          text: "Select only the packages of the same guide.",
        });
        return;
      }
    }

    for (const tlPackage of tlPackages) {

      if (guide.paymentStatus != '2') {
        Swal.fire({
          icon: "error",
          title:
            "Oops... The payment status of the guide is not paid!!",
          text: "If you want to deliver the packages guide or assign it to a route, it is necessary to process the payment.",
        });
        return;
      }
    }

    this.checkPackagesFormGuide(guide).then(
      (respCheck) => {
        if (respCheck) {
          this.openSignaturePad(
            guide.packageList,
            this.guides
          );
        } else {
          this.openSignaturePad(
            tlPackages,
            this.guides
          );
        }
      });
  }

  assignToPallet(tlPackages: WarehouseItemFull[]) {
    if (this.shipping.shippingManifest.length === 1) {
      Swal.fire({
        icon: "error",
        title:
          "Oops... There are no containers in this shipment!!",
        html: `In order to assign packages to containers, it is necessary that there are at least one container in the shipment.<br>
                Create it here: <a style="text-decoration: none; font-weight: bolder; cursor: pointer; color: red;" href="${this_url}/#/app/ships/settle/${this.shipping._id}">Assign containers</a>`,
      });
    } else {
      this.dialog
        .open(AssignToPalletComponent, {
          data: {
            tlPackages,
            pallets: this.shipping.shippingManifest,
            shipping: this.shipping,
          },
          width: "500px",
        })
        .afterClosed()
        .subscribe(() => {
          this.selection.clear();
          this.updateShippingPackageInfo();
        });
    }

  }

  async assignADelivery(tlPackages: WarehouseItemFull[]) {

    let packageArray: WarehouseItemFull[] = [];
    if (!Array.isArray(tlPackages)) {
      tlPackages = [tlPackages];
    }

    for (const tlPackage of tlPackages) {

      const guide = this.guides.filter((guideItem) => guideItem._id === tlPackage.guide)[0];
      await this.checkPackagesFormGuide(guide).then(
        (respCheck) => {
          if (respCheck) {
            packageArray = packageArray.concat(guide.packageList);
          } else {
            packageArray.push(tlPackage);
          }
        });
    }

    this.dialog
      .open(AssignToDeliveryComponent, {
        data: {
          tlPackages: packageArray,
          shipping: this.shipping,
          guides: this.guides,
        },
        width: "700px",
      })
      .afterClosed()
      .subscribe(() => {
        this.selection.clear();
        this.updateShippingPackageInfo();
      });
  }

  openAssignDelivery(tlPackages: WarehouseItemFull[]) {


    if (!Array.isArray(tlPackages)) {
      tlPackages = [tlPackages];
    }

    this.dialog
      .open(AssignToDeliveryComponent, {
        data: {
          tlPackages: tlPackages,
          shipping: this.shipping,
          guides: this.guides,
        },
        width: "700px",
      })
      .afterClosed()
      .subscribe(() => {
        this.selection.clear();
        this.updateShippingPackageInfo();
      });
  }

  checkPackagesStatus(tlPackages: WarehouseItemFull[], status: string, equal: boolean, gt: boolean, lt: boolean) {

    if (!Array.isArray(tlPackages)) {
      tlPackages = [tlPackages];
    }
    let canProcessAll = false;

    for (const tlPackage of tlPackages) {
      if (equal) {
        if (gt && lt) {
          if (tlPackage.status === status) {
            canProcessAll = true;
          }
        } else if (lt && !gt) {
          if (tlPackage.status >= status) {
            canProcessAll = true;
          }
        } else if (gt && !lt) {
          if (tlPackage.status <= status) {
            canProcessAll = true;
          }
        } else {
          if (tlPackage.status !== status) {
            canProcessAll = true;
          }
        }
      } else {
        if (gt && lt) {
          if (tlPackage.status === status) {
            canProcessAll = true;
          }
        } else if (lt && !gt) {
          if (tlPackage.status > status) {
            canProcessAll = true;
          }
        } else if (gt && !lt) {
          if (tlPackage.status < status) {
            canProcessAll = true;
          }
        } else {
          if (tlPackage.status !== status) {
            canProcessAll = true;
          }
        }
      }
    }
    return canProcessAll;
  }

  openSignaturePad(tlPackages: WarehouseItemFull[], guides: GuidesEntPop[]) {
    this.dialog
      .open(CustomerSignatureComponent, {
        data: {
          shipping: this.shipping,
          selectedPackages: tlPackages,
          guides,
        },
        width: "500px",
      })
      .afterClosed()
      .subscribe((updatedShipping) => {
        this.selection.clear();
        this.updateShippingPackageInfo();
      });
  }


  updateGuide(guideId: string) {
    const guide = this.guides.filter((guideItem) => guideItem._id.toString() === guideId)[0];
    this.dialog
      .open(GuidesCreateUpdateComponent, {
        data: guide,
        height: "500px",
        width: "1024px",
      });
  }

  updatePac(pac: WarehouseItemFull) {
    this.dialog
      .open(RegistryPackageCreateUpdateComponent, {
        data: pac,
        height: "600px",
      });
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  sendNotification(
    tlPackage: WarehouseItemFull,
    guide: GuidesEntPop
  ) {

    this.urlItem = `${this_url}/#/warehouse-item-receipt/${tlPackage._id}`;
    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = guide.customer.email;
    if (adminNotification) {
      mail.bcc = adminEmails;
    }
    mail.subject = `Hemos recibido el Paquete ${tlPackage.tlCargoId} / ${guide.tlCargoId} en nuestros almacenes en Caracas`;
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> </tr> <tr></tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <br /> <h2>¡Recepción de paquete en almacen en Caracas!</h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style="background-color: #5dade2; color: white"> <h2 style="font-size: 14pt">Hola ${guide.customer.name}</h2> <p style="font-size: 12pt"> Hemos recibido tu paquete en nuestras instalaciones en Caracas, abajo el detalle </p> </td> </tr> <tr> <td style=" text-align: justify; font-size: 10pt; padding-left: 20px; padding-top: 20px; " > <b>ID de la guia:</b> ${guide.tlCargoId} </td> </tr> <tr> <td style=" text-align: justify; font-size: 10pt; padding-left: 20px; padding-top: 20px; " > <b>ID del paquete:</b> ${tlPackage.tlCargoId}, paquete ${tlPackage.guideCounter} de la guia </td> </tr> <tr> <td style=" text-align: justify; font-size: 10pt; padding-left: 20px; padding-top: 10px; " > <b>ID Tracking:</b> ${tlPackage.trackingId} </td> </tr> <tr> <td style=" text-align: justify; font-size: 10pt; padding-left: 20px; padding-top: 10px; " > <b>Descripción:</b> ${tlPackage.shortDesc} </td> </tr> <tr> <td style=" text-align: justify; font-size: 10pt; padding-left: 20px; padding-top: 10px; " > <b>Fecha de recepción:</b> ${new Date(tlPackage.receptionDate).toLocaleDateString('ve-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })} </td> </tr> <tr> <td style=" text-align: justify; font-size: 10pt; padding-left: 20px; padding-top: 10px; " > <b>Peso y volumen:</b> ${tlPackage.weight} libras, <span style="font-size: 8pt"> ${Number(+tlPackage.weight / 2.2046).toFixed(2)} Kgs. </span> / ${tlPackage.volume} pies<sup>3</sup> </td> </tr> <tr> <td style="text-align: center; font-size: 8pt; padding: 10px"> <hr /> <p> Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br />${this.urlItem} </p> <hr /> <p> Tu paquete va a entrar en nuestros procesos de entrega local, aunque si estas en Caracas lo puedes retirar por nuestras <a href="https://maps.app.goo.gl/7GXcobVWNCu9MShx6" >oficinas</a> cuando gustes. </p> <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15554650.068626555!2d-84.29088907217479!3d17.86102954636453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a59ca76b2bb29%3A0x2ad7927aa28f1d3b!2stlcargo!5e0!3m2!1ses!2sve!4v1700341532019!5m2!1ses!2sve" width="300" height="225" style="border: 0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ></iframe> </td> </tr> <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> ¡Gracias por preferirnos!<br /> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <br /> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 30px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      this.openSnackbar("Customer notified Correctly!!");
    });

  }
}
