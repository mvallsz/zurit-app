import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { TableColumn } from "../../../../../@vex/interfaces/table-column.interface";
import { SelectionModel } from "@angular/cdk/collections";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";

import { ReplaySubject, Subject } from "rxjs";
import { MatSelect } from "@angular/material/select";
import { takeUntil } from "rxjs/operators";

import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { stagger40ms } from "../../../../../@vex/animations/stagger.animation";

import icEdit from "@iconify/icons-ic/twotone-edit";
import icDelete from "@iconify/icons-ic/twotone-delete";
import icSearch from "@iconify/icons-ic/twotone-search";
import icAdd from "@iconify/icons-ic/twotone-add";
import icFilterList from "@iconify/icons-ic/twotone-filter-list";
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icFolder from "@iconify/icons-ic/twotone-folder";
import icPhone from "@iconify/icons-ic/twotone-phone";
import icMail from "@iconify/icons-ic/twotone-mail";
import icMap from "@iconify/icons-ic/twotone-map";
import icCheck from "@iconify/icons-ic/twotone-checklist";
import icArrowDropDown from "@iconify/icons-ic/twotone-arrow-drop-down";
import icPrint from "@iconify/icons-ic/twotone-print";
import icListAlt from "@iconify/icons-ic/twotone-list-alt";
import icMoney from "@iconify/icons-ic/monetization-on";
import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import icClose from "@iconify/icons-ic/twotone-close";
import icQR from "@iconify/icons-ic/baseline-qr-code";
import icRule from "@iconify/icons-ic/twotone-rule";

import {
  initShipping,
  packageStatus,
  paymentStatus,
  shippingSettleStatus
} from "../../../../../static-data/tlcargo-static-data";

import { GuidesEntPop } from "../../shipping-guides/interfaces/guides-ent-pop.model";
import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { ShippingEnt } from "../interfaces/shipping.model";
import { PackageType } from "../../../adminModules/package-type-registry/interfaces/package-type.model";
import { WarehouseItemFull } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { ManifestData } from "../../../../interfaces/manifest-data-table.interface";
import { Address } from "src/app/pages/warehousingModules/customers-registry/interfaces/address.model";

import { GuidesService } from "../../../../services/guides.service";
import { WarehouseItemService } from "../../../../services/warehouse-item.service";
import { NgxSpinnerService } from "ngx-spinner";
import { PackageTypeService } from "../../../../services/package-type.service";
import { ShippingService } from "../../../../services/shipping.service";
import { MailService } from "src/app/services/mail.service";
import { AddressService } from "src/app/services/address.service";

import { PickingListWarehouseComponent } from "../../shipping-guides/picking-list-warehouse/picking-list-warehouse.component";
import { GuideInvoiceComponent } from "../../../utility/guide-invoice/guide-invoice.component";
import { GuidePickListComponent } from "../../../utility/guide-pick-list/guide-pick-list.component";
import { PackageTypeCreateUpdateComponent } from "../../../adminModules/package-type-registry/package-type-create-update/package-type-create-update.component";
import { TempShippingManifestComponent } from "./temp-shipping-manifest/temp-shipping-manifest.component";
import { GuideQrGeneratorComponent } from "../../shipping-guides/guide-qr-generator/guide-qr-generator.component";
import { AssignToPalletComponent } from "./assign-to-pallet/assign-to-pallet.component";
import { ShippingBitacoraComponent } from "src/app/pages/utility/shipping-bitacora/shipping-bitacora.component";

import Swal from "sweetalert2";
import { environment } from "src/environments/environment";

const this_url = environment.this_url;

const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@UntilDestroy()
@Component({
  selector: "vex-settle-shipping",
  templateUrl: "./settle-shipping.component.html",
  styleUrls: ["./settle-shipping.component.scss"],
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
export class SettleShippingComponent implements OnInit, AfterViewInit {

  urlItem = "";
  urlItem2 = "";

  protected packageTypes: PackageType[] = [];
  public packageTypesCtrl: FormControl = new FormControl();
  public packageTypesFilterCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public filteredPackageTypes: ReplaySubject<PackageType[]> = new ReplaySubject<
    PackageType[]
  >(0);
  @ViewChild("packageTypesSelect", { static: true })
  packageTypesSelect: MatSelect;

  layoutCtrl = new FormControl("boxed");

  guides: GuidesEntPop[];
  packages: WarehouseItemFull[] = [];

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
    { label: "Guide Id", property: "guideId", type: "text", visible: true },
    { label: "Package Id", property: "tlCargoId", type: "text", visible: true },
    { label: "Piece", property: "guideCounter", type: "text", visible: true },
    { label: "Measures", property: "package", type: "text", visible: true },
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
  paymentStatus = paymentStatus;
  protected _onDestroy = new Subject<void>();

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
  icMoney = icMoney;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icQR = icQR;
  icRule = icRule;

  totalWeight = 0;
  totalVlb = 0;
  totalVolume = 0;

  finalWeight = 0;
  finalVlb = 0;
  finalVolume = 0;

  public packageFormGroup: FormGroup;
  public shortDescCtrl: FormControl = new FormControl("");
  public volumeCtrl: FormControl = new FormControl(0);
  public vlbCtrl: FormControl = new FormControl(0);
  public weightCtrl: FormControl = new FormControl(0);
  public mode: "update" | "create" = "create";

  public shippingPackages: ManifestData[] = new Array();
  series: ApexNonAxisChartSeries | ApexAxisChartSeries = [
    {
      name: "Shipping Guides",
      data: [1, 2, 3, 4, 5],
    },
  ];

  shippingValue: string;
  shippingValueN: number;
  shippingCostN: number;
  shippingCost: string;
  shippingRevenue: string;
  quantities: string;
  public spinnerB = false;
  public isSettle = true;
  indexToEdit: number;
  showPackageTypeSelect = false;

  public shipping = new ShippingEnt(initShipping);
  public originalShipping: ShippingEnt;
  public shippingId;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChildren(TempShippingManifestComponent)
  children: QueryList<TempShippingManifestComponent>;



  constructor(
    private mailService: MailService,
    private rutaActiva: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private guidesService: GuidesService,
    private shippingService: ShippingService,
    private tlPackageService: WarehouseItemService,
    private packageTypeService: PackageTypeService,
    private addressService: AddressService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {
    this.packageFormGroup = this.fb.group({
      height: [0, [Validators.required]],
      width: [0, [Validators.required]],
      length: [0, [Validators.required]],
    });
  }

  ngOnInit() {

    this.shippingId = this.rutaActiva.snapshot.params.shippingId;

    this.spinner.show("guideSpinner");
    this.dataSource = new MatTableDataSource();

    this.shippingService.getShippingById(this.shippingId).subscribe((respS: ServiceResponse) => {
      this.shipping = respS.data[0];
      this.originalShipping = new ShippingEnt(respS.data[0]);
      this.shippingPackages = this.shipping.shippingManifest;
      if (this.shipping.guidesCount === 0) {
        Swal.fire({
          title: "No guides found",
          icon: "info",
          text: "The shipping has no guides, please create a guide first to access this functionality",
          confirmButtonText: "Ok",
        }).then(() => {
          this.router.navigate(["/app/guides"]);
        });
      }

      this.shippingService.getShippingGuidesAndPackageList(this.shippingId)
        .subscribe(
          async (resp: ServiceResponse) => {
            if (resp.ok) {
              this.series = [
                {
                  name: "Shipping Guides",
                  data: resp.data.map((x) => x.cost),
                },
              ];
              this.guides = resp.data.filter((guide) => !guide.quote);

              this.guides.forEach(
                (guide) => {
                  guide.packageList.forEach((pkg) => { pkg.guideId = guide.tlCargoId; });
                  this.packages = this.packages.concat(guide.packageList);
                }
              );

              await this.calculaFinals(this.shippingPackages, this.packages);

              if (this.shippingPackages.length > 1) {
                this.generateValuesToPrint();
              } else {
                this.quantities =
                  "Guides: " +
                  this.guides.length +
                  " / Packages: " +
                  this.guides.reduce(
                    (sum, guide) => sum + guide.packageList.length,
                    0
                  ) +
                  " / Containers: 0";
              }

              this.dataSource.data = this.packages;
              this.sort.sort({ id: "guideId", start: "desc" } as MatSortable);
              this.dataSource.sort = this.sort;

              this.sumAll();
              this.sumFinal();

            }
            this.spinner.hide("guideSpinner");
          }
        );

    });

    this.searchCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.onFilterChange(value));

    this.packageTypeService
      .getPackageType()
      .subscribe((resp: ServiceResponse) => {
        this.packageTypes = resp.data;
        this.filteredPackageTypes.next(this.packageTypes.slice());
        this.packageTypesFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterPackageType();
          });
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.sort({ id: "creationDate", start: "desc" } as MatSortable);
    this.dataSource.sort = this.sort;
    this.cd.detectChanges();
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  keyPressNumbersWithDecimal(event, input: string) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = this.packageFormGroup.get(input).value.indexOf(".");
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  keyPressNumbersWithDecimalFC(event, input: FormControl) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = input.value.indexOf(".");
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  async calculaFinals(containers: ManifestData[], packages: WarehouseItemFull[]) {

    await packages.forEach((pkg, index) => {
      const container: ManifestData = containers.filter((cont) => cont.shortDesc === pkg.shipContainer)[0];
      if (!container.customValue) {
        container.finalVolume = container.finalVolume += Number(pkg.volume);
        container.finalVlb = container.finalVlb += Number(pkg.vlb);
        container.finalWeight = container.finalWeight += Number(pkg.weight);
      }
    });
    this.children.forEach((child) =>
      child.OnResetParent(containers)
    );
  }

  calculaVolume_HxWxL(containerName: String) {
    console.log(containerName);
    const height = this.packageFormGroup.get("height").value;
    const width = this.packageFormGroup.get("width").value;
    const length = this.packageFormGroup.get("length").value;

    if (height !== null && width !== null && length !== null) {
      this.volumeCtrl.setValue(((height * width * length) / 1756).toFixed(2));
      this.vlbCtrl.setValue(((height * width * length) / 166).toFixed(2));
    }

    this.weightCtrl.setValue(this.packages.filter((pac) => pac.shipContainer === containerName).reduce(
      (accumulator, data) => accumulator + Number(data.weight),
      0
    ));
  }

  updatePackageContainer(shipContainer: String) {
    this.dataSource.data.forEach((tlPackage) => {
      if (tlPackage.shipContainer === shipContainer) {
        tlPackage.shipContainer = "Loose Packages";
      }
    });
  }

  sumFinal() {
    if (this.shippingPackages) {
      this.generateValuesToPrint();
      this.finalWeight = this.packages.reduce(
        (accumulator, data) => accumulator + Number(data.weight),
        0
      );
      this.finalVlb = this.packages.reduce(
        (accumulator, data) => accumulator + Number(data.vlb),
        0
      );
      this.finalVolume = this.packages.reduce(
        (accumulator, data) => accumulator + Number(data.volume),
        0
      );
    } else {
      this.finalWeight = 0;
      this.finalVlb = 0;
      this.finalVolume = 0;
    }
  }

  sumAll() {
    this.totalWeight = this.guides.reduce(
      (accumulator, data) => accumulator + data.finalWeight,
      0
    );

    this.totalVlb = this.guides.reduce(
      (accumulator, data) => accumulator + data.finalVlb,
      0
    );

    this.totalVolume = this.guides.reduce(
      (accumulator, data) => accumulator + data.finalVolume,
      0
    );

    this.shippingValueN = this.guides.reduce(
      (accumulator, data) => accumulator + data.cost,
      0
    );

    this.shippingValue = this.shippingValueN.toLocaleString("en", {
      style: "currency",
      currency: "USD",
    });
  }

  createPackageType() {
    this.dialog
      .open(PackageTypeCreateUpdateComponent, {
        height: "500px",
      })
      .afterClosed()
      .subscribe(() => {
        this.packageTypeService
          .getPackageType()
          .subscribe((resp: ServiceResponse) => {
            this.packageTypes = resp.data;
            this.filteredPackageTypes.next(this.packageTypes.slice());
            this.packageTypesFilterCtrl.valueChanges
              .pipe(takeUntil(this._onDestroy))
              .subscribe(() => {
                this.filterPackageType();
              });
          });
      });
  }

  protected filterPackageType() {
    if (!this.packageTypes) {
      return;
    }
    let search = this.packageTypesFilterCtrl.value;
    if (!search) {
      this.filteredPackageTypes.next(this.packageTypes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredPackageTypes.next(
      this.packageTypes.filter(
        (packageType) => packageType.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  takeOutOfPallet(tlPackage: WarehouseItemFull) {

    tlPackage.shipContainer = "Loose Packages";
    this.tlPackageService
      .updateWarehouseItem(tlPackage)
      .subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.shippingService.getShippingById(this.shippingId).subscribe(
            async (respS: ServiceResponse) => {
              await this.calculaFinals(respS.data[0].shippingManifest, this.packages);
              this.dataSource.data = this.packages;
              this.sort.sort({ id: "guideId", start: "desc" } as MatSortable);
              this.dataSource.sort = this.sort;
            });
        }

        Swal.fire(`The package was removed from container`, "", "info");
      });
  }

  assignToPallet(tlPackages: WarehouseItemFull[]) {
    this.dialog
      .open(AssignToPalletComponent, {
        data: {
          tlPackages,
          pallets: this.shippingPackages,
          shipping: this.shipping,
        },
        width: "40%",
      })
      .afterClosed()
      .subscribe(() => {
        this.selection.clear();
        this.shippingService.getShippingGuidesAndPackageList(this.shippingId)
          .subscribe(
            async (resp: ServiceResponse) => {
              if (resp.ok) {

                const guides = resp.data;
                this.packages = [];
                guides.forEach(
                  (guide) => {
                    guide.packageList.forEach((pkg) => { pkg.guideId = guide.tlCargoId; });
                    this.packages = this.packages.concat(guide.packageList);
                  }
                );

                this.shippingService.getShippingById(this.shippingId).subscribe(
                  async (respS: ServiceResponse) => {
                    await this.calculaFinals(respS.data[0].shippingManifest, this.packages);
                    this.dataSource.data = this.packages;
                    this.sort.sort({ id: "guideId", start: "desc" } as MatSortable);
                    this.dataSource.sort = this.sort;
                  });

              }
              this.spinner.hide("guideSpinner");
            }
          );
      });
  }

  checkSelected(tlPackages: WarehouseItemFull[]) {

    for (const tlPackage of tlPackages) {
      if (tlPackage.shipContainer !== 'Loose Packages') {
        return true;
      }
    }

    return false;
  }

  async createPackageTypeA(packageType: PackageType) {
    const resp = await this.packageTypeService.createPackageType(packageType).toPromise();
    return resp;

  }

  async onSubmitAddPackage() {
    let formOk = true;

    if (this.showPackageTypeSelect) {
      if (
        this.shortDescCtrl.value === "" ||
        this.vlbCtrl.value === "" ||
        this.volumeCtrl.value === "" ||
        this.packageTypesCtrl.value === ""
      ) {
        formOk = false;
      }
      if (this.shippingPackages) {
        if (
          this.shippingPackages.filter(
            (shippingPackage) =>
              shippingPackage.shortDesc === this.shortDescCtrl.value
          ).length > 0
        ) {
          this.openSnackbar("A container with that description already exists");
          return;
        }
      }
    } else {
      if (
        this.shortDescCtrl.value === "" ||
        this.vlbCtrl.value === "" ||
        this.volumeCtrl.value === ""
      ) {
        formOk = false;
      }

      if (this.packageFormGroup.get("height").value === '' ||
        this.packageFormGroup.get("width").value === '' ||
        this.packageFormGroup.get("length").value === '') {
        formOk = false;
      }

      if (this.shortDescCtrl.value === "Loose Packages") {
        this.openSnackbar("This is a reserved name, please choose another one.");
        return;
      }

      if (formOk) {
        const packageType: PackageType = new PackageType({});
        packageType.height = this.packageFormGroup.get("height").value;
        packageType.width = this.packageFormGroup.get("width").value;
        packageType.length = this.packageFormGroup.get("length").value;
        packageType.type = 'PALLET';
        packageType.name = `PALLET_${packageType.height}_${packageType.width}_${packageType.length}`;

        let resp: ServiceResponse;

        await this.createPackageTypeA(packageType).then((resp: ServiceResponse) => {
          if (resp.ok) {
            this.packageTypes.push(resp.data);
            this.filteredPackageTypes.next(this.packageTypes.slice());
            this.packageTypesFilterCtrl.valueChanges
              .pipe(takeUntil(this._onDestroy))
              .subscribe(() => {
                this.filterPackageType();
              });
            this.packageTypesCtrl.setValue(resp.data._id);
          } else {
            formOk = false;
            this.openSnackbar(resp.msg);
          }
        });
      }

      if (this.shippingPackages) {
        if (
          this.shippingPackages.filter(
            (shippingPackage) =>
              shippingPackage.shortDesc === this.shortDescCtrl.value
          ).length > 0
        ) {
          this.openSnackbar("A container with that description already exists");
          return;
        }
      }
    }


    if (!formOk) {
      this.openSnackbar(
        "You need to fill all the inputs related to the new Arrange"
      );
    } else {
      const newArrange = new ManifestData({});

      newArrange.shortDesc = this.shortDescCtrl.value;
      newArrange.finalVlb = +this.vlbCtrl.value;
      newArrange.finalVolume = +this.volumeCtrl.value;
      newArrange.finalWeight = +this.weightCtrl.value;

      const height = this.packageFormGroup.get("height").value;
      const width = this.packageFormGroup.get("width").value;
      const length = this.packageFormGroup.get("length").value;


      if (height === '0' && width === '0' && length === '0' && newArrange.finalVlb === 0 && newArrange.finalVolume === 0 && newArrange.finalWeight === 0) {
        newArrange.customValue = false;
      } else {
        newArrange.customValue = true;
      }

      newArrange.packageType = this.packageTypes.filter(
        (pkg) => pkg._id === this.packageTypesCtrl.value
      )[0].name;


      newArrange.measures = `H:${this.packageFormGroup.get("height").value}in. X
      W:${this.packageFormGroup.get("width").value}in. X
      L:${this.packageFormGroup.get("length").value}in.`;

      if (this.shippingPackages) {
        this.shippingPackages.push(newArrange);
      } else {
        this.shippingPackages = new Array(newArrange);
      }

      this.resetArrangeForm();
      this.children.forEach((child) =>
        child.OnResetParent(this.shippingPackages)
      );
      this.generateValuesToPrint();
      this.save("0");
    }
  }

  async onSubmitEditPackage() {
    let formOk = true;

    if (this.showPackageTypeSelect) {
      if (
        this.shortDescCtrl.value === "" ||
        this.vlbCtrl.value === "" ||
        this.volumeCtrl.value === "" ||
        this.packageTypesCtrl.value === ""
      ) {
        formOk = false;
      }

      if (
        this.shippingPackages.filter(
          (shippingPackage) =>
            shippingPackage.shortDesc === this.shortDescCtrl.value
        ).length > 0 &&
        // tslint:disable-next-line:max-line-length
        this.shippingPackages.indexOf(
          this.shippingPackages.filter(
            (shippingPackage) =>
              shippingPackage.shortDesc === this.shortDescCtrl.value
          )[0]
        ) !== this.indexToEdit
      ) {
        this.openSnackbar("A container with that description already exists");
        return;
      }

    } else {
      if (
        this.shortDescCtrl.value === "" ||
        this.vlbCtrl.value === "" ||
        this.volumeCtrl.value === ""
      ) {
        formOk = false;
      }

      if (this.packageFormGroup.get("height").value === '' ||
        this.packageFormGroup.get("width").value === '' ||
        this.packageFormGroup.get("length").value === '') {
        formOk = false;
      }

      if (
        this.shippingPackages.filter(
          (shippingPackage) =>
            shippingPackage.shortDesc === this.shortDescCtrl.value
        ).length > 0 &&
        // tslint:disable-next-line:max-line-length
        this.shippingPackages.indexOf(
          this.shippingPackages.filter(
            (shippingPackage) =>
              shippingPackage.shortDesc === this.shortDescCtrl.value
          )[0]
        ) !== this.indexToEdit
      ) {
        this.openSnackbar("A container with that description already exists");
        return;
      }

      if (formOk) {
        const packageType: PackageType = new PackageType({});
        packageType.height = this.packageFormGroup.get("height").value;
        packageType.width = this.packageFormGroup.get("width").value;
        packageType.length = this.packageFormGroup.get("length").value;
        packageType.type = 'PALLET';
        packageType.name = `PALLET_${packageType.height}_${packageType.width}_${packageType.length}`;

        let resp: ServiceResponse;

        await this.createPackageTypeA(packageType).then((resp: ServiceResponse) => {
          if (resp.ok) {
            this.packageTypes.push(resp.data);
            this.filteredPackageTypes.next(this.packageTypes.slice());
            this.packageTypesFilterCtrl.valueChanges
              .pipe(takeUntil(this._onDestroy))
              .subscribe(() => {
                this.filterPackageType();
              });
            this.packageTypesCtrl.setValue(resp.data._id);

          } else {
            formOk = false;
            this.openSnackbar(resp.msg);
          }
        });
      }
    }

    if (!formOk) {
      this.openSnackbar(
        "You need to fill all the inputs related to the new Arrange"
      );
    } else {
      const newArrange = new ManifestData({});

      newArrange.shortDesc = this.shortDescCtrl.value;
      newArrange.finalVlb = +this.vlbCtrl.value;
      newArrange.finalVolume = +this.volumeCtrl.value;
      newArrange.finalWeight = +this.weightCtrl.value;

      const height = this.packageFormGroup.get("height").value;
      const width = this.packageFormGroup.get("width").value;
      const length = this.packageFormGroup.get("length").value;

      if (height === '0' && width === '0' && length === '0' && newArrange.finalVlb === 0 && newArrange.finalVolume === 0 && newArrange.finalWeight === 0) {
        newArrange.customValue = false;
      } else {
        newArrange.customValue = true;
      }

      newArrange.packageType = this.packageTypes.filter(
        (pkg) => pkg._id === this.packageTypesCtrl.value
      )[0].name;

      newArrange.measures = `H:${this.packageFormGroup.get("height").value}in. X
      W:${this.packageFormGroup.get("width").value}in. X
      L:${this.packageFormGroup.get("length").value}in.`;

      this.shippingPackages[this.indexToEdit] = newArrange;
      this.mode = "create";
      this.packageFormGroup.get("height").setValue(0);
      this.packageFormGroup.get("width").setValue(0);
      this.packageFormGroup.get("length").setValue(0);
      this.resetArrangeForm();
      this.children.forEach((child) =>
        child.OnResetParent(this.shippingPackages)
      );
      this.generateValuesToPrint();
      this.save("0");
    }
  }

  save(type: string) {

    if (type === "1") {
      Swal.fire({
        title:
          "You are about to dispatch the shipment? ",
        icon: "warning",
        text: "If you continue, that means that the state of the shipment will change as well as all the packages associated, all the guides and packages will not be able to edit.",
        showDenyButton: true,
        confirmButtonText: "Yes, I'm aware of that",
        denyButtonText: `No!`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {

          this.spinnerB = true;
          const shippingToUpdate = new ShippingEnt({});
          shippingToUpdate._id = this.shipping._id;
          shippingToUpdate.status = "2";

          this.shippingService.updateShipping(shippingToUpdate).subscribe(
            (resp: ServiceResponse) => {
              this.sendNotification();
              this.openSnackbar(resp.msg);
              this.spinnerB = false;
              this.shipping.status = "2";
            },
            (error) => console.log(error.error.msg)
          );
        }
      });
    } else {
      const shippingToUpdate = new ShippingEnt({});
      shippingToUpdate.status = this.shipping.status;
      shippingToUpdate.shippingManifest = this.shippingPackages;
      shippingToUpdate.shippingManifest.forEach(container => {
        if (!container.customValue) {
          container.finalVlb = 0;
          container.finalVolume = 0;
          container.finalWeight = 0;
        }
      });
      shippingToUpdate._id = this.shipping._id;

      this.shippingService.updateShipping(shippingToUpdate).subscribe(
        (resp: ServiceResponse) => {
          this.calculaFinals(resp.data.shippingManifest, this.packages);
          this.openSnackbar(resp.msg);
        },
        (error) => console.log(error.error.msg)
      );
    }
  }

  async sendNotification() {

    for (const guide of this.guides) {

      if (guide.paymentStatus === '2') {
        const respAddress = await this.addressService.getAddress(guide.customer._id).toPromise();
        const address: Address = respAddress.data[0];

        this.urlItem = `${this_url}/#/guide-receipt/${guide._id}`;
        this.urlItem2 = `${this_url}/#/guide-package-list/${guide._id}`;

        const mail: any = {};
        mail.from = "TLCargo tu servicio de transporte de carga";
        mail.to = guide.customer.email;
        if (adminNotification) mail.bcc = adminEmails;

        mail.subject = `El envio con la guía ${guide.tlCargoId} ya salió para ${address.city}!`;
        mail.html =
          `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }.datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> <h2>Tu envio ya salió para ${this.shipping.arrivalHub.city}!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <h2>Hola ${guide.customer.name
          }!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt;"> Gracias por utilizar nuestro servicio de envíos. </p> <p style="text-align: justify; font-size: 10pt; padding-left: 30px; padding-right: 30px;">
          Nuestro equipo en ${this.shipping.departureHub.city} acaba de terminar de despachar el envio
          ${this.shipping.type}-${this.shipping.name}, dentro de los próximos 5 días hábiles estaremos
          recibiendo tu envio en nuestro warehouse en ${this.shipping.arrivalHub.city}.
          <br>
          Acá el detalle de tu guia:
          </p> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%">
          <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>
          Costo:</b> ${guide.cost.toLocaleString('en', { style: 'currency', currency: 'USD' })}
          </td> </tr>
          <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>
          Estado de Pago:</b> ${this.selectPaymentStatusById(guide.paymentStatus).text}
          </td> </tr>
          <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>
          Origen:</b> ${this.shipping.departureHub.city}
          </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <br> <b>
          Destino:</b> ${this.shipping.arrivalHub.city}
          <br> <br> <hr> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;">
          <p> Para revisar los paquetes asociados a la guía haz click en el siguiente enlace:<br/>${this.urlItem2} </p>
          <p> Descarga el invoice acá:<br/>${this.urlItem}</p> </td> </tr> <tr> <td style="text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px;"> <p > <hr> <h1 style="text-align: center; font-size: 12pt;" > Te recordamos que estas son las únicas cuentas autorizadas de TLCARGO </h1> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga</li> <li><b>Numero de Cuenta:</b> 0172 0110 7111 0844 6517</li> <li><b>Titular:</b> Francy Wadskier</li> <li><b>C.I.:</b> V-18857206</li> </ul> <h2 style="font-size: 10pt;"> Para Pago Movil en Bolívares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> Banca Amiga (0172)</li> <li><b>Telefono:</b> 0424-1521758</li> <li><b>C.I.:</b> V-18857206</li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Si no has realizado el pago al momento de recibir este correo electrónico, por favor comunícate con nuestro servicio de atención al cliente para verificar la tasa de cambio. </b> </span> <br> <hr> <br> <h2 style="font-size: 10pt;"> Para depósitos en Dólares </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>Cuenta:</b> Cheque</li> <li><b>Numero de Cuenta:</b> 9149573200</li> <li><b>Titular:</b> TL CARGO</li> <li><b>ABA:</b> 266086554</li> <li><b>SWIFT:</b> CITIUS33MIA</li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante ZELLE </h2> <ul style="font-size: 8pt;"> <li><b>Banco:</b> CITIBANK</li> <li><b>ZELLE:</b> ZELLE@TLCARGO.NET</li> <li><b>Nombre:</b> (Teleflex Group Inc o Alvaro Abreu)</li> <li><b>Por favor colocar numero de Invoice en memo</b></li> </ul> <h2 style="font-size: 10pt;"> Para pago en Dólares mediante PAYPAL </h2> <ul style="font-size: 8pt;"> <li><b>Email:</b> paypal@TLCargo.net</li> <li><b>Verificar si su cuenta cobra un Fee por pagar debe agregarlo para que llegue el pago completo</b></li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Los pagos recibidos a través de transferencias (Wire) de otros bancos americanos tendrán un cargo extra de $15.00, esto no aplica para Zelle. </b> </span> </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:15px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;

        this.mailService.sendHTML(mail).subscribe((resp: any) => {
          if (resp.info.response.includes("250")) {
            this.openSnackbar("Customer notified Correctly!!");
          } else {
            this.openSnackbar("We have some problems sending the notification!!");
          }
        });
      }
    }
  }

  generateValuesToPrint() {
    if (this.shipping.type === "AIR") {
      this.shippingCostN = this.shippingPackages
        .map(
          (value) =>
            value.finalWeight * Number(this.shipping.carrier.carrierRate)
        )
        .reduce((accumulator, data) => accumulator + data, 0);
    } else {
      this.shippingCostN = this.shippingPackages
        .map(
          (value) =>
            value.finalVolume * Number(this.shipping.carrier.carrierRate)
        )
        .reduce((accumulator, data) => accumulator + data, 0);
    }


    this.shippingRevenue = (
      this.shippingValueN - this.shippingCostN
    ).toLocaleString("en", {
      style: "currency",
      currency: "USD",
    });

    this.shippingCost = this.shippingCostN.toLocaleString("en", {
      style: "currency",
      currency: "USD",
    });

    this.quantities =
      "Guides: " +
      this.guides.length +
      " / Packages: " +
      this.guides.reduce((sum, guide) => sum + guide.packageList.length, 0) +
      " / Containers: " +
      (this.shippingPackages.length - 1);
  }

  editArrangeForm(data: ManifestData) {
    this.mode = "update";
    this.indexToEdit = this.shippingPackages.indexOf(this.shippingPackages.filter(cont => cont.shortDesc === data.shortDesc)[0]);
    this.packageTypeService
      .getPackageTypeByName(data.packageType)
      .subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.showPackageTypeSelect = false;
          this.packageFormGroup.get("height").setValue(Number(resp.data[0].height).toFixed(2));
          this.packageFormGroup.get("width").setValue(Number(resp.data[0].width).toFixed(2));
          this.packageFormGroup.get("length").setValue(Number(resp.data[0].length).toFixed(2));

          this.shortDescCtrl.setValue(data.shortDesc);
          this.vlbCtrl.setValue(Number(data.finalVlb).toFixed(2));
          this.volumeCtrl.setValue(Number(data.finalVolume).toFixed(2));
          this.weightCtrl.setValue(Number(data.finalWeight).toFixed(2));
        }
      });
  }

  resetArrangeForm() {
    this.packageTypesCtrl.setValue("");
    this.shortDescCtrl.setValue("");
    this.vlbCtrl.setValue("");
    this.volumeCtrl.setValue("");
    this.weightCtrl.setValue("");
  }

  cleanArrangeForm() {
    this.packageFormGroup.get("height").setValue('0');
    this.packageFormGroup.get("width").setValue('0');
    this.packageFormGroup.get("length").setValue('0');
    this.packageTypesCtrl.setValue("");
    this.vlbCtrl.setValue("0");
    this.volumeCtrl.setValue("0");
    this.weightCtrl.setValue("0");
  }

  calculaVolume() {
    const packageTypeSelected: PackageType[] = this.packageTypes.filter(
      (packageType) => packageType._id === this.packageTypesCtrl.value
    );
    if (this.packageTypesCtrl.value) {
      // tslint:disable-next-line:max-line-length
      this.volumeCtrl.setValue(
        (
          (packageTypeSelected[0].height *
            packageTypeSelected[0].width *
            packageTypeSelected[0].length) /
          1756
        ).toFixed(2)
      );
      // tslint:disable-next-line:max-line-length
      this.vlbCtrl.setValue(
        (
          (packageTypeSelected[0].height *
            packageTypeSelected[0].width *
            packageTypeSelected[0].length) /
          166
        ).toFixed(2)
      );
    }
  }

  setZero() {
    this.volumeCtrl.setValue(0);
    this.vlbCtrl.setValue(0);
    this.weightCtrl.setValue(0);
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.data.filter((row) => row.customer.name === value);
    //   this.dataSource.filter = value;
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

  selectShipStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.shipStatus.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  selectPaymentStatusById(statusId: string) {
    const selectedStatusArray: any[] = this.paymentStatus.filter(
      (status) => status.id === statusId
    );
    return selectedStatusArray[0];
  }

  showPicList(list: any) {
    this.dialog
      .open(PickingListWarehouseComponent, {
        height: "500px",
        data: list,
      })
      .afterClosed()
      .subscribe(() => {
        this.spinner.show("guideSpinner");
        this.guidesService
          .getGuides(0, this.pageSize, "", false)
          .subscribe((resp: ServiceResponse) => {
            this.guides = resp.data;
            this.dataSource.data = resp.data;
            this.spinner.hide("guideSpinner");
          });
      });
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  openInvoice(tlPackage: WarehouseItemFull) {
    this.dialog.open(GuideInvoiceComponent, {
      data: { guide: null, tlPackage },
      height: "800px",
      width: "1000px",
    });
  }

  openPickList(guide: GuidesEntPop) {
    this.dialog.open(GuidePickListComponent, {
      data: guide,
      height: "800px",
      width: "1000px",
    });
  }

  openQRStick(guide: GuidesEntPop) {
    const piezas = new Array(guide.packageList.length);
    for (let i = 0; i < guide.packageList.length; i++) {
      piezas[i] = i + 1;
    }
    this.dialog.open(GuideQrGeneratorComponent, {
      data: {
        guide,
        piezas,
      },
      height: "600px",
      width: "700px",
    });
  }

  openBitacora(shipping: ShippingEnt, type: string) {
    this.dialog.open(ShippingBitacoraComponent, {
      data: { shipping, packages: this.packages, type },
      height: "800px",
      width: "1000px",
    });
  }
}
