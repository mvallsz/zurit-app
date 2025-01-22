import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { SelectionModel } from "@angular/cdk/collections";
import { FormControl } from "@angular/forms";
import { MatSelect, MatSelectChange } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { TableColumn } from "../../../../@vex/interfaces/table-column.interface";
import { fadeInUp400ms } from "../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../@vex/animations/stagger.animation";

import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import icFolder from "@iconify/icons-ic/twotone-folder";
import icCheck from "@iconify/icons-ic/twotone-checklist";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import icPrint from "@iconify/icons-ic/twotone-print";
import icQR from "@iconify/icons-ic/baseline-qr-code";
import { shippingStatus } from "../../../../static-data/tlcargo-static-data";

import { ShippingEnt } from "./interfaces/shipping.model";
import { ServiceResponse } from "../../../interfaces/service-response.interface";

import { ShippingService } from "../../../services/shipping.service";
import { GuidesService } from "../../../services/guides.service";
import { NgxSpinnerService } from "ngx-spinner";

import { ShippingCreateUpdateComponent } from "./shipping-create-update/shipping-create-update.component";
import { ShippingPickListComponent } from "./shipping-pick-list/shipping-pick-list.component";
import { PickingListGuideComponent } from "./picking-list-guides/picking-list-guide.component";
import { QrGeneratorShipperComponent } from "./qr-generator-shipping/qr-generator-shipper.component";
import { SettleShippingComponent } from "./settle-shipping/settle-shipping.component";

import Swal from "sweetalert2";
import { ActivatedRoute } from "@angular/router";
import { WarehouseItemFull } from "../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { WarehouseItemService } from "../../../services/warehouse-item.service";
import { ShipPackagesListComponent } from "./ship-packages-list/ship-packages-list.component";
import { GuidesEntPop } from "../shipping-guides/interfaces/guides-ent-pop.model";
import { GuidesEnt } from "../shipping-guides/interfaces/guides-ent.model";
import { environment } from "../../../../environments/environment";
import { MailService } from "../../../services/mail.service";
import { CustomerSignatureComponent } from "./customer-signature/customer-signature.component";
import { MatOption } from "@angular/material/core";
import * as XLSX from "xlsx";
import { catchError, map, startWith, switchMap } from "rxjs/operators";

const this_url = environment.this_url;
const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;
const shipsFilters = environment.ships_filters;

@UntilDestroy()
@Component({
  selector: "vex-customer-registry",
  templateUrl: "./shipping-registry.component.html",
  styleUrls: ["./shipping-registry.component.scss"],
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
export class ShippingRegistryComponent implements OnInit, AfterViewInit {
  urlItem = "";
  layoutCtrl = new FormControl("boxed");
  shippings: ShippingEnt[];

  @Input()
  columns: TableColumn<ShippingEnt>[] = [
    {
      label: "Checkbox",
      property: "checkbox",
      type: "checkbox",
      visible: true,
    },
    { label: "Actions", property: "actions", type: "button", visible: true },
    {
      label: "Type",
      property: "type",
      type: "text",
      visible: true,
      cssClasses: ["font-medium"],
    },
    { label: "Shipping Name", property: "name", type: "text", visible: true },
    { label: "Guides Q'", property: "_id", type: "button", visible: true },
    { label: "Status", property: "status", type: "button", visible: true },
    {
      label: "Departure Date",
      property: "departureDate",
      type: "text",
      visible: true,
      cssClasses: ["text-secondary", "font-medium"],
    },
    {
      label: "Departure WH",
      property: "departureHub",
      type: "text",
      visible: false,
    },
    {
      label: "Arrival WH",
      property: "arrivalHub",
      type: "text",
      visible: true,
    },
    { label: "Created By", property: "user", type: "text", visible: true },
  ];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  filter = "";

  dataSource: MatTableDataSource<ShippingEnt> | null;
  selection = new SelectionModel<ShippingEnt>(true, []);
  searchCtrl = new FormControl();

  sinceDateCtrl = new FormControl();
  untilDateCtrl = new FormControl();

  status = shippingStatus;

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
  icArrowDropDown = icArrowDropDown;
  icPrint = icPrint;
  icList = icListAlt;
  icCheck = icCheck;
  icQR = icQR;

  public spinnerDown = false;
  totalData = 0;
  guide: GuidesEntPop;

  startDate: string;
  endDate: string;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("statusSelect") statusSelect: MatSelect;

  public dateSearch = false;
  public dateColor = 'primary';

  constructor(
    private spinner: NgxSpinnerService,
    private rutaActiva: ActivatedRoute,
    private dialog: MatDialog,
    private shippingService: ShippingService,
    private guideService: GuidesService,
    private packageService: WarehouseItemService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private mailService: MailService
  ) { }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    const guideId = this.rutaActiva.snapshot.params.guideId;
    const tlPackage = this.rutaActiva.snapshot.params.tlPackage;

    if (guideId) {
      this.guideService.getGuide(guideId).subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.guide = resp.data[0];
          this.shippingService
            .getShippingById(resp.data[0].shipping._id)
            .subscribe((respS: ServiceResponse) => {
              if (respS.ok) {
                this.packageService
                  .getWarehouseItemFullById(tlPackage)
                  .subscribe((respW: ServiceResponse) => {

                    switch (+respS.data[0].status) {
                      case 1:
                        this.openShipPkgList(
                          respS.data[0],
                          respW.data[0],
                          false
                        );
                        break;
                      case 2:
                        Swal.fire({
                          icon: "error",
                          title: "Oops...",
                          text: "The status of the shipping is not ON DESTINATION HUB",
                        });
                        break;
                      case 3:
                        if (respW.data[0].status < "4") {
                          Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "The status of the package is not IN TRANSIT",
                          });
                          this.openShipPkgList(respS.data[0], null, false);
                        } else if (respW.data[0].status > "4") {
                          Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "This package is already registered in the warehouse inventory",
                          });
                          this.openShipPkgList(respS.data[0], null, false);
                        } else {
                          Swal.fire({
                            title: `Do you want to register the package ${respW.data[0].guideCounter} of guide ${this.guide.tlCargoId} in the inventory?`,
                            showDenyButton: true,
                            confirmButtonText: "Yes!",
                            denyButtonText: `No!`,
                            width: "50%",
                            heightAuto: false,
                            input: "checkbox",
                            inputPlaceholder:
                              "Do you want to notified the customer?",
                          }).then((result) => {
                            /* Read more about isConfirmed, isDenied below */
                            if (result.isConfirmed) {
                              respW.data[0].status = "5";
                              this.packageService
                                .updateWarehouseItem(respW.data[0])
                                .subscribe(
                                  (respFromUpdate: ServiceResponse) => {
                                    if (respFromUpdate.ok) {
                                      this.packageService
                                        .isGuideComplete(
                                          respW.data[0].guide,
                                          "6"
                                        )
                                        .subscribe(
                                          (respIsComplete: ServiceResponse) => {
                                            if (respIsComplete.ok) {
                                              if (respIsComplete.data) {
                                                const guideToUpdate =
                                                  new GuidesEnt({});
                                                guideToUpdate.status = "5";
                                                guideToUpdate._id =
                                                  respW.data[0].guide;
                                                this.guideService
                                                  .updateGuide(guideToUpdate)
                                                  .subscribe(
                                                    (
                                                      respGuideUpdated: ServiceResponse
                                                    ) => {
                                                      if (respGuideUpdated.ok) {
                                                        this.openSnackbar(
                                                          "All the packages of the guide have been received in the warehouse, the guide status has now changed to ON DESTINATION"
                                                        );
                                                      }
                                                    }
                                                  );
                                              }
                                              if (result.value) {
                                                this.sendNotification(
                                                  respS.data[0].type,
                                                  respW.data[0],
                                                  null
                                                );
                                                this.openSnackbar(
                                                  "Customer notified correctly!"
                                                );
                                              }
                                            }
                                          }
                                        );
                                      this.openSnackbar(
                                        "The package status has now changed to ON DESTINATION"
                                      );
                                      this.openShipPkgList(
                                        respS.data[0],
                                        null,
                                        false
                                      );
                                    }
                                  }
                                );
                            }
                          });
                        }
                        break;
                      case 4:
                        if (respW.data[0].status === "5") {
                          this.openShipPkgList(
                            respS.data[0],
                            respW.data[0],
                            true
                          );
                        } else if (respW.data[0].status === "6") {
                          this.openSignaturePad(respS.data[0], respW.data[0]);
                        } else {
                          Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "The status of the package is not ON DESTINATION or ON ROUTE",
                          });
                          this.openShipPkgList(respS.data[0], null, false);
                        }
                        break;
                    }
                  });
              }
            });
        }
      });
    }

    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.getTableData$(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.filter,
            true,
            filterOptions
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((tlData: ServiceResponse) => {
          if (tlData == null) return [];
          this.totalData = tlData.total;
          return tlData.data;
        })
      )
      .subscribe((tlData) => {
        this.spinner.hide("shippingSpinner");
        this.shippings = tlData;
        this.dataSource = new MatTableDataSource(this.shippings);
        this.sort.sort({ id: "departureDate", start: "desc" } as MatSortable);
        this.dataSource.sort = this.sort;
      });
  }

  getTableData$(
    pageNumber: Number,
    pageSize: Number,
    filter: string,
    spinner: boolean,
    filterOptions: any
  ) {
    if (spinner) this.spinner.show("shippingSpinner");

    return this.shippingService.getShipsPag(
      pageNumber,
      pageSize,
      filter,
      filterOptions
    );
  }

  name = `TLCargo_ships${Date.now().toPrecision()}.xlsx`;

  exportToExcel(): void {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };
    this.spinnerDown = true;
    this.getTableData$(0, 0, this.filter, false, filterOptions).subscribe(
      (resp: ServiceResponse) => {
        let itemsToExport: ShippingEnt[];
        itemsToExport = new Array();
        if (resp.data.length > 0) {
          for (const item of resp.data) {
            itemsToExport.push(new ShippingEnt(item));
          }
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
            JSON.parse(JSON.stringify(itemsToExport))
          );
          const book: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(book, worksheet, "Sheet1");

          XLSX.writeFile(book, this.name);
          this.spinnerDown = false;
        } else {
          this.openSnackbar("There is nothing to download -.-");
          this.spinnerDown = false;
        }
      }
    );
  }

  showDate() {
    this.dateSearch = !this.dateSearch;
    this.dateColor = this.dateSearch ? 'accent' : 'primary';

    if (!this.dateSearch) {
      this.sinceDateCtrl.setValue("");
      this.untilDateCtrl.setValue("");
    } else {
      this.searchCtrl.setValue("");
    }
  }

  createShipping() {
    this.dialog
      .open(ShippingCreateUpdateComponent, {
        width: "600px",
      })
      .afterClosed()
      .subscribe((shipping: ShippingEnt) => {
        if (shipping) {
          this.spinner.show("shippingSpinner");
          this.shippingService.getShips().subscribe((resp: ServiceResponse) => {
            this.shippings = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide("shippingSpinner");
          });
        }
      });
  }

  openQRStick(shipping: ShippingEnt) {
    this.dialog.open(QrGeneratorShipperComponent, {
      data: shipping,
      height: "500px",
      width: "700px",
    });
  }

  settleShipping(shipping: ShippingEnt, tlPackage: WarehouseItemFull) {
    this.dialog
      .open(SettleShippingComponent, {
        data: { shipping, tlPackage },
        height: "800px",
        width: "1024px",
      })
      .afterClosed()
      .subscribe((updatedShipping) => {
        if (updatedShipping) {
          this.spinner.show("shippingSpinner");
          this.shippingService.getShips().subscribe((resp: ServiceResponse) => {
            this.shippings = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide("shippingSpinner");
          });
        }
      });
  }

  openPkgList(shipping: ShippingEnt) {
    this.dialog.open(ShippingPickListComponent, {
      data: shipping,
      height: "800px",
      width: "1000px",
    });
  }

  openShipPkgList(
    shipping: ShippingEnt,
    tlPackage: WarehouseItemFull,
    delivery: boolean
  ) {
    this.spinner.show("shippingSpinner");
    this.shippingService
      .getShippingGuidesAndPackageList(shipping._id.toString())
      .subscribe((resp: ServiceResponse) => {
        let finalPackageList = new Array();
        for (const guide of resp.data) {
          finalPackageList = finalPackageList.concat(guide.packageList);
        }
        this.spinner.hide("shippingSpinner");
        this.dialog
          .open(ShipPackagesListComponent, {
            data: {
              shipping,
              packageList: finalPackageList,
              selectedPackage: tlPackage,
              delivery,
            },
            height: "600px",
            width: "1200px",
          })
          .afterClosed()
          .subscribe((updatedShipping) => {
            this.spinner.show("shippingSpinner");
            this.shippingService
              .getShips()
              .subscribe((respS: ServiceResponse) => {
                this.shippings = respS.data;
                this.dataSource.data = respS.data;
                this.spinner.hide("shippingSpinner");
              });
          });
      });
  }

  openSignaturePad(shipping: ShippingEnt, tlPackage: WarehouseItemFull) {
    this.spinner.show("shippingSpinner");
    this.shippingService
      .getShippingGuidesAndPackageList(shipping._id.toString())
      .subscribe((resp: ServiceResponse) => {
        let finalPackageList = new Array();
        for (const guide of resp.data) {
          finalPackageList = finalPackageList.concat(guide.packageList);
        }
        this.spinner.hide("shippingSpinner");
        this.dialog
          .open(CustomerSignatureComponent, {
            data: {
              shipping,
              packageList: finalPackageList,
              selectedPackage: tlPackage,
            },
            width: "500px",
          })
          .afterClosed()
          .subscribe((updatedShipping) => {
            this.spinner.show("shippingSpinner");
            this.shippingService
              .getShips()
              .subscribe((respS: ServiceResponse) => {
                this.shippings = respS.data;
                this.dataSource.data = respS.data;
                this.spinner.hide("shippingSpinner");
              });
          });
      });
  }

  updateShipping(shipping: ShippingEnt) {
    this.dialog
      .open(ShippingCreateUpdateComponent, {
        data: shipping,
        width: "600px",
      })
      .afterClosed()
      .subscribe((updatedShipping) => {
        if (updatedShipping) {
          this.spinner.show("shippingSpinner");
          this.shippingService.getShips().subscribe((resp: ServiceResponse) => {
            this.shippings = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide("shippingSpinner");
          });
        }
      });
  }

  deleteShipping(shipping: ShippingEnt) {

    if (+shipping.status >= 2) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You cannot delete a Shipping that is not in the state IN PROCESS",
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: `Are you sure you want to delete the Shipping ${shipping.type}-${shipping.name}?`,
        text: "You won't be able to revert this, also all the guides related with this shipping will be removed, and the packages restore to Warehouse!",
        showDenyButton: true,
        confirmButtonText: `Yes!`,
        denyButtonText: `No!`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.shippingService.deleteShipping(shipping).subscribe(
            (resp: any) => {
              this.shippings.splice(
                this.shippings.findIndex(
                  (existingShipping) => existingShipping._id === shipping._id
                ),
                1
              );
              this.selection.deselect(shipping);
              this.dataSource.data = this.shippings;
              this.openSnackbar(resp.msg);
            },
            (error) => this.openSnackbar(error.error.msg)
          );
        }
      });

    }
  }

  deleteShippings(shippings: ShippingEnt[]) {
    /**
     * Here we are updating our local array.
     * You would probably make an HTTP request here.
     */
    shippings.forEach((c) => this.deleteShipping(c));
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }

    this.spinner.show("shippingSpinner");

    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    value = value.trim();
    value = value.toLowerCase();

    if (value === "") {
      if (this.dateSearch) {
        if (this.sinceDateCtrl.value && this.untilDateCtrl.value) {
          this.filter = `&sinceDate=${this.sinceDateCtrl.value}&untilDate=${this.untilDateCtrl.value}`;
        } else {
          this.openSnackbar("Please select a date range");
        }

      } else {
        this.searchCtrl.setValue("");
        this.filter = "";
      }
    } else {
      this.filter = "";
      for (const shipeFilter of shipsFilters) {
        this.filter += `&${shipeFilter}=${value}`;
      }
    }

    this.getTableData$(
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.filter,
      false,
      filterOptions
    ).subscribe((resp: ServiceResponse) => {
      this.totalData = resp.total;
      this.shippings = resp.data;
      this.dataSource.data = this.shippings;
      this.spinner.hide("shippingSpinner");
    });
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  selectStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.status.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  onStatusChange(change: MatSelectChange, row: ShippingEnt) {

    const index = this.dataSource.data.findIndex((c) => c === row);

    if (change.value) {
      if (+change.value.id >= 2) {
        if (+row.status >= 3 && +change.value.id != 4) {

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "You cannot change the status of the Shipping once it becomes status ON DESTINATION HUB",
          });

        } else if (+row.status === 4) {

          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "You cannot change the status of the Shipping once it becomes status ON DESTINATION WH",
          });

        } else {

          this.shippings[index].status = change.value.id;
          this.shippingService.updateShipping(this.shippings[index])
            .subscribe(
              (respUS: ServiceResponse) => {
                if (respUS.ok) {
                  this.spinner.show("shippingSpinner");
                  this.shippingService.getShips().
                    subscribe((respS: ServiceResponse) => {
                      this.shippings = respS.data;
                      this.dataSource.data = respS.data;
                      this.spinner.hide("shippingSpinner");
                    });
                } else {
                  this.openSnackbar(respUS.msg);
                }
              },
              (error) => this.openSnackbar(error.error.msg)
            );
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "You cannot change the status of the Shipping to IN PROCESS once it becomes status IN TRANSIT or upper",
        });
      }
      this.clearStatusSelect();
    }
  }

  clearStatusSelect() {
    this.statusSelect.options.forEach((data: MatOption) => data.deselect());
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  showPicList(ship: ShippingEnt) {
    this.dialog
      .open(PickingListGuideComponent, {
        height: "500px",
        data: ship,
      })
      .afterClosed()
      .subscribe(() => {
        this.shippingService.getShips().subscribe((resp: ServiceResponse) => {
          this.shippings = resp.data;
          this.dataSource.data = resp.data;
        });
      });
  }

  sendNotification(
    shippingType: string,
    tlPackage: any,
    guide: GuidesEntPop
  ) {
    const guideId = tlPackage.guide.tlCargoId;
    const packageId = tlPackage.tlCargoId;

    this.urlItem = `${this_url}/#/warehouse-item-receipt/${tlPackage._id}`;
    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = tlPackage.customer.email;
    if (adminNotification) mail.bcc = adminEmails;
    mail.subject = `Se ha registrado el paquete ${packageId} asociado a la guía ${guideId} en nuestros almacenes en Caracas`;
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"><head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style></head><body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --><div id="email"> <table align="right" role="presentation"> <tr> <td> <a class="subtle-link" href="#">Ver en el navegador</a> </td> <tr> </table> <! Banner --> <table role="presentation" width="100%"> <tr> <td bgcolor="#00A4BD" align="center" style="color: white;"> <br><img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> <h2> Ya tenemos tu paquete en nuestros almacenes en Caracas! </h2> </td> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="10px" style="padding: 30px 30px 30px 60px; text-align: center"> 
    <tr> <td> <h2> Hola ${tlPackage.customer.name
      }</h2> <p> Hemos recibido tu paquete en nuestras instalaciones en Caracas, abajo el detalle </p> </td> </tr> <tr> <td style="text-align: justify;"><b>Nro de guia</b>: ${guideId} <br> <b>Nro de Paquete</b>: ${packageId} <br> <b>Paq. en guia</b>: ${tlPackage.guideCounter
      }</td> </tr> <tr> <td style="text-align: justify;"><b>Descripción:</b> ${tlPackage.shortDesc
      } </td> </tr> <tr> <td style="text-align: justify;"><b>Fecha de recepción:</b> ${new Date(
        Date.now()
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} </td> </tr> <tr> <td style="text-align: justify;"><b>Peso y Volumen:</b> ${tlPackage.weight
      } libra${Number(tlPackage.weight) > 1 ? "s" : ""} / ${Number(
        Number(tlPackage.weight) / 2.2046
      ).toFixed(2)} Kgs., ${tlPackage.volume} pie${Number(tlPackage.volume) > 1 ? "s" : ""
      }<sup>3</sup> </td> </tr> <tr> <td style="text-align: justify;"><b>Enviado por:</b> ${tlPackage.shipper.name
      } </td> </tr> <tr> <td> <p>Si necesitas más detalles respecto a tu paquete por favor haz click en el siguiente enlace. <br>${this.urlItem
      } </p><br> <p>Tu paquete va a entrar en nuestros procesos de entrega local, aunque si estas en Caracas lo puedes retirar cuanto antes.</p> </td> </tr> <tr> <td style="text-align: center;"> ¡Gracias por preferirnos! <a href="https://www.tlcargo.net">www.TLCargo.net</a> </td> </tr> </table> <table role="presentation" bgcolor="#F5F8FA" width="100%" > <tr> <td align="left" style="padding: 30px 30px;"> <p style="color:#99ACC2; text-align: center"> Made with &hearts; at DogHoundTechnology </p> </td> </tr> </table></div></body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      this.openSnackbar("Customer notified Correctly!!");
    });

  }
}
function observableOf(arg0: null): any {
  throw new Error("Function not implemented.");
}
