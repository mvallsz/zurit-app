import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSelect } from "@angular/material/select";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";

import { stagger80ms } from "../../../../../@vex/animations/stagger.animation";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "../../../../../@vex/animations/scale-in.animation";
import { fadeInRight400ms } from "../../../../../@vex/animations/fade-in-right.animation";

import icRule from "@iconify/icons-ic/twotone-rule";
import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import icClose from "@iconify/icons-ic/twotone-close";
import icMoney from "@iconify/icons-ic/monetization-on";
import icAirplane from "@iconify/icons-ic/round-airplanemode-active";
import icBoat from "@iconify/icons-ic/round-directions-boat";

import { WarehouseItemService } from "../../../../services/warehouse-item.service";
import { PackageTypeService } from "../../../../services/package-type.service";
import { CustomerService } from "../../../../services/customer.service";

import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { PackageTypeCreateUpdateComponent } from "../../../adminModules/package-type-registry/package-type-create-update/package-type-create-update.component";

import { FileUploadService } from "../../../../services/file-upload.service";
import { ShippingService } from "../../../../services/shipping.service";
import { WarehouseItem } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item.model";
import { GuidesService } from "../../../../services/guides.service";
import { AddressService } from "../../../../services/address.service";
import { RateService } from "../../../../services/rate.service";

import { Customer } from "../../../warehousingModules/customers-registry/interfaces/customer.model";
import { PackageType } from "../../../adminModules/package-type-registry/interfaces/package-type.model";
import { Address } from "../../../warehousingModules/customers-registry/interfaces/address.model";
import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { Rate } from "../../../adminModules/rate-registry/interfaces/rate.model";
import { ShippingEnt } from "../../shipping-registry/interfaces/shipping.model";
import { GuidesEntPop } from "../interfaces/guides-ent-pop.model";
import { Quote } from "../../../accountingModules/shipping-quotes/interfaces/quote-containers.model";

import Swal from "sweetalert2";

import { environment } from "../../../../../environments/environment";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { NgxSpinnerService } from "ngx-spinner";
import { WarehouseItemFull } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { PickingListPackageComponent } from "../picking-list-package/picking-list-package.component";
import { Carrier } from "src/app/pages/adminModules/curriers-registry/interfaces/carrier.model";
import { Shipper } from "src/app/pages/adminModules/shipper-registry/interfaces/shipper.model";
import { TlPackagesModel } from "../interfaces/tl-packages.model";
import { TempRepackingRegistryComponent } from "./temp-repacking-registry/temp-repacking-registry.component";
import { TlCargoIdPipe } from "src/app/pipes/tl-cargo-id/tl-cargo-id.pipe";
import { MailService } from "src/app/services/mail.service";
import { ActivatedRoute, Router } from "@angular/router";
import { GuideQrGeneratorComponent } from "../guide-qr-generator/guide-qr-generator.component";
import { QuotesService } from "src/app/services/quotes.service";

const base_url = environment.base_url;
const this_url = environment.this_url;
const min_weight_air = environment.min_weight_air;
const min_weight_sea = environment.min_weight_sea;


@Component({
  selector: "vex-guides-create-update-b",
  templateUrl: "./guides-create-update-b.component.html",
  styleUrls: ["./guides-create-update-b.component.scss"],
  animations: [stagger80ms, fadeInUp400ms, scaleIn400ms, fadeInRight400ms],
})
export class GuidesCreateUpdateBComponent implements OnInit {
  layoutCtrl = new FormControl("boxed");
  protected packageTypes: PackageType[] = [];
  public packageTypesCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public packageTypesFilterCtrl: FormControl = new FormControl("");
  public filteredPackageTypes: ReplaySubject<PackageType[]> = new ReplaySubject<
    PackageType[]
  >(0);
  @ViewChild("packageTypesSelect", { static: true })
  packageTypesSelect: MatSelect;

  protected customers: Customer[] = [];
  public customersCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public customersFilterCtrl: FormControl = new FormControl("");
  public filteredCustomers: ReplaySubject<Customer[]> = new ReplaySubject<
    Customer[]
  >(0);
  @ViewChild("customersSelect", { static: true }) customersSelect: MatSelect;

  protected shippings: ShippingEnt[] = [];
  public shippingsCtrl: FormControl = new FormControl();
  public shippingsFilterCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public filteredShippings: ReplaySubject<ShippingEnt[]> = new ReplaySubject<
    ShippingEnt[]
  >(0);
  @ViewChild("shippingsSelect", { static: true }) shippingsSelect: MatSelect;

  protected rates: Rate[] = [];
  public ratesCtrl: FormControl = new FormControl();
  public ratesFilterCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public filteredRates: ReplaySubject<Rate[]> = new ReplaySubject<Rate[]>(0);
  @ViewChild("ratesSelect", { static: true }) ratesSelect: MatSelect;

  protected airRates: Rate[] = [];
  public airRatesCtrl: FormControl = new FormControl();
  public airRatesFilterCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public filteredAirRates: ReplaySubject<Rate[]> = new ReplaySubject<Rate[]>(0);
  @ViewChild("airRatesSelect", { static: true }) airRatesSelect: MatSelect;

  protected seaRates: Rate[] = [];
  public seaRatesCtrl: FormControl = new FormControl();
  public seaRatesFilterCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public filteredSeaRates: ReplaySubject<Rate[]> = new ReplaySubject<Rate[]>(0);
  @ViewChild("seaRatesSelect", { static: true }) seaRatesSelect: MatSelect;



  public shipCtrl: FormControl = new FormControl("");
  public nameCtrl: FormControl = new FormControl("");
  public customerCtrl: FormControl = new FormControl("");
  public typeCtrl: FormControl = new FormControl("");
  public volumeCtrl: FormControl = new FormControl("");
  public vlbCtrl: FormControl = new FormControl("");
  public statusCtrl: FormControl = new FormControl("");
  public weightCtrl: FormControl = new FormControl("", [Validators.required]);
  public costCtrl: FormControl = new FormControl("");
  public notesCtrl: FormControl = new FormControl("");
  public repackingCtrl: FormControl = new FormControl("");
  public notificationCtrl: FormControl = new FormControl();
  public rateChangeCtrl: FormControl = new FormControl();

  public shipperNoteCtrl: FormControl = new FormControl("");
  public physicalLocationCtrl: FormControl = new FormControl("");
  public notificationRePackCtrl: FormControl = new FormControl();
  public totalsCtrl: FormControl = new FormControl();
  public quoteSeaCtrl: FormControl = new FormControl();
  public quoteAirCtrl: FormControl = new FormControl();


  protected _onDestroy = new Subject<void>();

  mode: "create" | "update" = "create";
  type: "guide" | "quote" = "guide";

  icMoreVert = icMoreVert;
  icClose = icClose;
  icMoney = icMoney;
  icRule = icRule;
  icAirplane: any;
  icBoat: any;

  public imageToUpload: File;
  public previewStatus = false;
  public imagePreviewSrc = "";
  public url = "";

  public imageRepackingToUpload: File;
  public previewRepackingStatus = false;
  public imageRepackingPreviewSrc = "";
  public urlRepacking = "";
  public repacking = false;

  public customerSelected = false;
  public packageSelected: WarehouseItemFull[];
  public customerPackages: WarehouseItemFull[];
  public tlPackages: TlPackagesModel;
  public shippingAddress: Address;
  public addresses: Address[];
  public customer: Customer;
  public guideRate: Rate;
  public guideCityRates: Rate[];

  public oldWeight = 0;
  public oldVolume = 0;
  public oldVolumeWeight = 0;

  public oldHeight = 0;
  public oldWidth = 0;
  public oldLength = 0;

  public selectedCustomer;
  public selectedShipping;
  public selectedPackages: string[] = [];
  public needPkgType = false;
  public packageFormGroup: FormGroup;
  public customerUpdate = false;
  public spinner = false;
  public spinnerRepack = false;
  public ratesDef: Rate[];
  public isAQuotation = false;

  urlItem = "";
  urlItem2 = "";

  tlCargoId = "";
  guideId = '0';

  @ViewChildren(PickingListPackageComponent)
  pickingListChildren: QueryList<PickingListPackageComponent>;

  @ViewChildren(TempRepackingRegistryComponent)
  tempRepackingChildren: QueryList<TempRepackingRegistryComponent>;

  public minNote = '';
  public defaults;
  public biggerWeight;
  public minWeight = false;
  public minVolume = false;
  public seaCost = 0;
  public airCost = 0;

  public editQuoteAir = false;
  public editQuoteSea = false;


  constructor(
    private router: Router,
    private rutaActiva: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private warehouseItemService: WarehouseItemService,
    private shippingService: ShippingService,
    private packageTypeService: PackageTypeService,
    private customerService: CustomerService,
    private guideService: GuidesService,
    private quoteService: QuotesService,
    private fileUploadService: FileUploadService,
    private addressService: AddressService,
    private rateService: RateService,
    private mailService: MailService,
    private snackbar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private tlCargoIdPipe: TlCargoIdPipe
  ) {


  }

  ngOnInit() {

    this.notificationCtrl.setValue(true);
    this.quoteSeaCtrl.setValue(true);
    this.quoteAirCtrl.setValue(true);

    this.packageFormGroup = this.fb.group({
      height: ["", [Validators.required]],
      width: ["", [Validators.required]],
      length: ["", [Validators.required]],
      type: ["", [Validators.required]],
    });

    this.guideId = this.rutaActiva.snapshot.params.guideId;
    this.type = this.rutaActiva.snapshot.params.type;

    if (this.guideId !== '0') {
      this.guideService.getGuide(this.guideId).subscribe((resp: ServiceResponse) => {
        this.defaults = resp.data[0];

        if (this.defaults) {
          this.mode = "update";
          this.previewStatus = true;

          this.nameCtrl.setValue(this.defaults.name);
          this.typeCtrl.setValue(this.defaults.type);
          this.volumeCtrl.setValue(this.defaults.finalVolume);
          this.vlbCtrl.setValue(this.defaults.finalVlb);
          this.statusCtrl.setValue(this.defaults.status);
          this.weightCtrl.setValue(this.defaults.finalWeight);
          this.costCtrl.setValue(this.defaults.cost);
          this.notesCtrl.setValue(this.defaults.notes);
          this.customerUpdate = true;
          this.customerCtrl.setValue(
            this.defaults.customer.name + " - " + this.defaults.customer.tlCargoName
          );

          if (!this.defaults.quote) {

            this.selectedShipping = this.defaults.shipping;
            if (this.defaults.shipping.status >= '2') {
              this.shipCtrl.setValue(this.defaults.shipping.type + " - " + this.defaults.shipping.name);
              this.repackingCtrl.disable();
            } else {
              this.shippingsCtrl.setValue(this.defaults.shipping._id);
            }

          } else {
            if (this.defaults.name.includes('AIR')) {
              this.editQuoteAir = true;
            } else {
              this.editQuoteSea = true;
            }

          }


          this.guideRate = this.defaults.rate;

          if (this.defaults.type === "3") {
            if (!this.defaults.packageTypeSelected) {
              this.repackingCtrl.setValue(true);
              this.packageFormGroup
                .get("height")
                .setValue(this.defaults.packageType.height);
              this.packageFormGroup
                .get("width")
                .setValue(this.defaults.packageType.width);
              this.packageFormGroup
                .get("length")
                .setValue(this.defaults.packageType.length);
              this.packageFormGroup
                .get("type")
                .setValue(this.defaults.packageType.type);
            } else {
              this.needPkgType = true;
            }
          }
          this.showUserInfo();
        }
      });

    }

    this.rateService.getRateByDefault().subscribe((resp: ServiceResponse) => {
      this.ratesDef = resp.data;
    });

    if (this.type === 'quote') {
      this.setRates();
    }

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

    this.shippingService
      .getShipsByStatus("1")
      .subscribe((resp: ServiceResponse) => {
        if (resp.data.length > 0 || this.type === "quote") {
          this.shippings = resp.data;
          this.filteredShippings.next(this.shippings.slice());
          this.shippingsFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterShipping();
            });
        } else {
          Swal.fire({
            title: `There are no shipments available to create guides or quotes`,
            text: `Do you want to go to the module of shipping and generate a new one?`,
            showDenyButton: true,
            confirmButtonText: "Yes!",
            denyButtonText: `No!`,
            width: "500px",
            heightAuto: false,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['app/ships']);
            }
          });
        }
      });
  }

  calculaVolume_HxWxL() {
    const height = this.packageFormGroup.get("height").value;
    const width = this.packageFormGroup.get("width").value;
    const length = this.packageFormGroup.get("length").value;

    if (height !== null && width !== null && length !== null) {
      this.volumeCtrl.setValue(((height * width * length) / 1756).toFixed(2));
      this.vlbCtrl.setValue(((height * width * length) / 166).toFixed(2));
    }
    this.costCalculate();
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

  onChange($event: MatSlideToggleChange) {
    this.needPkgType = $event.checked;
    this.vlbCtrl.setValue("");
    this.volumeCtrl.setValue("");
    this.cd.detectChanges();

    if (this.needPkgType) {
      if (this.packageTypesCtrl.value !== null) {
        this.calculaVolume();
      }
    } else {
      this.calculaVolume_HxWxL();
    }
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

  costCalculate() {
    let volume = 0;
    let vlb = 0;
    let weight = 0;

    if (this.selectedShipping) {

      const typeShip = this.selectedShipping.type;


      vlb = Number(this.oldVolumeWeight);
      weight = Number(this.oldWeight);

      if (typeShip === "AIR") {
        this.biggerWeight = weight > vlb ? weight : vlb;

        if (this.biggerWeight < min_weight_air) {
          this.biggerWeight = min_weight_air;
          if (this.defaults && this.type === 'quote') {
            if (this.editQuoteAir)
              this.minNote = "The minimum weight for air shipping is " + min_weight_air + " lbs. Cost calculation will be done with this minimum weight";
          } else {
            this.minNote = " / The minimum weight for air shipping is " + min_weight_air + " lbs. Cost calculation will be done with this minimum weight";
          }
        } else {
          this.minNote = '';
        }


      } else {
        if (Number(this.oldVolume) < min_weight_sea) {
          if (this.defaults && this.type === 'quote') {
            if (this.editQuoteSea)
              this.minNote = "The minimum weight for sea shipping is " + min_weight_sea + " ft3. Cost calculation will be done with this minimum weight";
          } else {
            this.minNote = " / The minimum weight for sea shipping is " + min_weight_sea + " ft3. Cost calculation will be done with this minimum weight";
          }
        } else {
          this.minNote = '';
        }
      }

      this.costCtrl.setValue("calculating Amount...");
      if (this.mode === "update") {
        if (this.selectedShipping !== this.defaults.shipping) {
          if (!this.guideRate) {
            this.rateService
              .getRateByType(this.selectedShipping.type)
              .subscribe((resp) => {
                this.guideRate = resp.data[0];
                if (this.repackingCtrl.value) {
                  if (Number(this.volumeCtrl.value) < min_weight_sea) {
                    volume = min_weight_sea;
                  } else {
                    volume = Number(this.volumeCtrl.value);
                  }
                  vlb = Number(this.vlbCtrl.value);
                  weight = Number(this.weightCtrl.value);
                } else {
                  if (Number(this.oldVolume) < min_weight_sea) {
                    volume = min_weight_sea;
                  } else {
                    volume = Number(this.oldVolume);
                  }
                  vlb = Number(this.oldVolumeWeight);
                  weight = Number(this.oldWeight);
                }
                const rate = this.guideRate.rate;

                if (typeShip === "AIR") {
                  this.costCtrl.setValue(
                    parseFloat((this.biggerWeight * rate).toFixed(2))
                  );
                } else {
                  this.costCtrl.setValue(parseFloat((volume * rate).toFixed(2)));
                }
              });
          } else {
            if (this.repackingCtrl.value) {
              if (Number(this.volumeCtrl.value) < min_weight_sea) {
                volume = min_weight_sea;
              } else {
                volume = Number(this.volumeCtrl.value);
              }
              vlb = Number(this.vlbCtrl.value);
              weight = Number(this.weightCtrl.value);
            } else {
              if (Number(this.oldVolume) < min_weight_sea) {
                volume = min_weight_sea;
              } else {
                volume = Number(this.oldVolume);
              }
              vlb = Number(this.oldVolumeWeight);
              weight = Number(this.oldWeight);
            }
            const rate = this.guideRate.rate;

            if (typeShip === "AIR") {
              this.costCtrl.setValue(
                parseFloat((this.biggerWeight * rate).toFixed(2))
              );
            } else {
              this.costCtrl.setValue(parseFloat((volume * rate).toFixed(2)));
            }
          }
        } else {
          const rate = this.defaults.rateAmount;
          if (this.repackingCtrl.value) {
            if (Number(this.volumeCtrl.value) < min_weight_sea) {
              volume = min_weight_sea;
            } else {
              volume = Number(this.volumeCtrl.value);
            }
            vlb = Number(this.vlbCtrl.value);
            weight = Number(this.weightCtrl.value);
          } else {
            if (Number(this.oldVolume) < min_weight_sea) {
              volume = min_weight_sea;
            } else {
              volume = Number(this.oldVolume);
            }
            vlb = Number(this.oldVolumeWeight);
            weight = Number(this.oldWeight);
          }

          if (typeShip === "AIR") {
            this.costCtrl.setValue(
              parseFloat((this.biggerWeight * rate).toFixed(2))
            );
          } else {
            this.costCtrl.setValue(parseFloat((volume * rate).toFixed(2)));
          }
        }
      } else {
        if (!this.guideRate) {
          this.rateService
            .getRateByType(this.selectedShipping.type)
            .subscribe((resp) => {
              this.guideRate = resp.data[0];

              if (this.repackingCtrl.value) {
                if (Number(this.volumeCtrl.value) < min_weight_sea) {
                  volume = min_weight_sea;
                } else {
                  volume = Number(this.volumeCtrl.value);
                }
                vlb = Number(this.vlbCtrl.value);
                weight = Number(this.weightCtrl.value);
              } else {
                if (Number(this.oldVolume) < min_weight_sea) {
                  volume = min_weight_sea;
                } else {
                  volume = Number(this.oldVolume);
                }
                vlb = Number(this.oldVolumeWeight);
                weight = Number(this.oldWeight);
              }
              const rate = this.guideRate.rate;

              if (typeShip === "AIR") {
                this.costCtrl.setValue(
                  parseFloat((this.biggerWeight * rate).toFixed(2))
                );
              } else {
                this.costCtrl.setValue(parseFloat((volume * rate).toFixed(2)));
              }
            });
        } else {
          if (this.repackingCtrl.value) {
            if (Number(this.volumeCtrl.value) < min_weight_sea) {
              volume = min_weight_sea;
            } else {
              volume = Number(this.volumeCtrl.value);
            }
            vlb = Number(this.vlbCtrl.value);
            weight = Number(this.weightCtrl.value);
          } else {
            if (Number(this.oldVolume) < min_weight_sea) {
              volume = min_weight_sea;
            } else {
              volume = Number(this.oldVolume);
            }
            vlb = Number(this.oldVolumeWeight);
            weight = Number(this.oldWeight);
          }
          const rate = this.guideRate.rate;

          if (typeShip === "AIR") {
            this.costCtrl.setValue(
              parseFloat((this.biggerWeight * rate).toFixed(2))
            );
          } else {
            this.costCtrl.setValue(parseFloat((volume * rate).toFixed(2)));
          }
        }
      }
    }
  }

  setAddressBook(addresses: Address[]) {
    this.addresses = addresses;
    this.shippingAddress = addresses.filter((address) => address.isDefault)[0];
  }

  setPackage(packages: WarehouseItemFull[]) {
    this.repacking = true;
    if (packages.length === 0) {
      this.repacking = false;
      this.repackingCtrl.setValue(false);
    }
    this.packageSelected = packages;
    this.oldVolume = 0;
    this.oldWeight = 0;
    this.oldVolumeWeight = 0;

    this.oldHeight = 0;
    this.oldWidth = 0;
    this.oldLength = 0;

    for (const pac of this.packageSelected) {
      this.oldWeight = this.oldWeight + +pac.weight;
      this.oldVolume = this.oldVolume + +pac.volume;
      this.oldVolumeWeight = this.oldVolumeWeight + +pac.vlb;
      this.oldWidth = this.oldWidth + +pac.package.width;
      this.oldHeight = this.oldHeight + +pac.package.height;
      this.oldLength = this.oldLength + +pac.package.length;
    }

    this.oldWeight = parseFloat(this.oldWeight.toFixed(2));
    this.oldVolume = parseFloat(this.oldVolume.toFixed(2));
    this.oldVolumeWeight = parseFloat(this.oldVolumeWeight.toFixed(2));
    this.totalsCtrl.setValue(`${this.oldWeight} lbs / ${this.oldVolumeWeight} vlbs / ${this.oldVolume} ft3`);

    if (this.type === 'quote') {

      if (this.packageSelected.length === 0) {
        this.airCost = 0;
        this.seaCost = 0;
        this.minNote = "";
      } else {
        this.biggerWeight = this.oldWeight > this.oldVolumeWeight ? this.oldWeight : this.oldVolumeWeight;

        if (this.biggerWeight < 4) {
          this.biggerWeight = 4;
          this.minWeight = true;
          if (this.defaults && this.type === 'quote') {
            if (this.editQuoteAir)
              this.minNote = "The minimum weight for air shipping is " + min_weight_air + " lbs. Cost calculation will be done with this minimum weight";
          } else {
            this.minNote = "The minimum weight for air shipping is " + min_weight_air + " lbs. Cost calculation will be done with this minimum weight / ";
          }
        } else {
          this.minNote = "";
          this.minWeight = false;
        }

        if (this.oldVolume < 3) {
          this.oldVolume = 3;
          this.minVolume = true;
          if (this.defaults && this.type === 'quote') {
            if (this.editQuoteSea)
              this.minNote = "The minimum weight for sea shipping is " + min_weight_sea + " ft<sup>3</sup>. Cost calculation will be done with this minimum weight";
          } else {
            this.minNote = this.minNote === "" ? "The minimum weight for sea shipping is " + min_weight_sea + " ft<sup>3</sup>. Cost calculation will be done with this minimum weight" : this.minNote + "the minimum weight for sea shipping is " + min_weight_sea + " ft<sup>3</sup>. Cost calculation will be done with this minimum weight";
          }
        } else {
          this.minVolume = false;
          this.minNote = "";
        }

        if (this.defaults) {
          this.airCost = this.biggerWeight * this.defaults.rate.rate;
          this.seaCost = this.oldVolume * this.defaults.rate.rate;
        } else {
          this.airCost = this.biggerWeight * this.ratesDef[0].rate;
          this.seaCost = this.oldVolume * this.ratesDef[1].rate;
        }
      }

    }

    if (this.selectedShipping) {
      this.costCalculate();
    }
  }

  quoteCostCalculate(type: string) {
    if (this.packageSelected) {
      if (type === 'AIR') {
        this.airCost = this.biggerWeight * this.airRates.filter(rate => rate._id === this.airRatesCtrl.value)[0].rate;
      } else {
        this.seaCost = this.oldVolume * this.seaRates.filter(rate => rate._id === this.seaRatesCtrl.value)[0].rate;
      }
    }
  }

  setPackageSelected(packages: WarehouseItemFull[]) {
    if (packages.length === 0) {
      this.repacking = false;
      this.repackingCtrl.setValue(false);
    }

    this.packageSelected = packages;
    this.oldVolume = 0;
    this.oldWeight = 0;
    this.oldVolumeWeight = 0;

    this.oldHeight = 0;
    this.oldWidth = 0;
    this.oldLength = 0;


    for (const pac of this.packageSelected) {
      this.oldWeight = this.oldWeight + +pac.weight;
      this.oldVolume = this.oldVolume + +pac.volume;
      this.oldVolumeWeight = this.oldVolumeWeight + +pac.vlb;
      this.oldWidth = this.oldWidth + pac.package.width;
      this.oldHeight = this.oldHeight + pac.package.height;
      this.oldLength = this.oldLength + pac.package.length;
    }

    this.oldWeight = parseFloat(this.oldWeight.toFixed(2));
    this.oldVolume = parseFloat(this.oldVolume.toFixed(2));
    this.oldVolumeWeight = parseFloat(this.oldVolumeWeight.toFixed(2));

    if (this.selectedShipping) {
      this.costCalculate();
    }
    this.reloadPackages(1);
  }

  shippingPackages(shippingPackages: any): void {
    throw new Error("Method not implemented.");
  }

  setInitialRate() {
    this.rateService
      .getRateByCity(this.shippingAddress.city)
      .subscribe((resp) => {
        this.guideCityRates = resp.data;
      });
  }

  setRates() {
    if (this.selectedShipping) {
      this.rateService
        .getRateByType(this.selectedShipping.type)
        .subscribe((resp: ServiceResponse) => {
          this.rates = resp.data;
          this.filteredRates.next(this.rates.slice());
          this.ratesFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterRate();
            });
        });
    } else {
      this.rateService.getRates().subscribe((resp: ServiceResponse) => {
        this.rates = resp.data;
        this.filteredRates.next(this.rates.slice());
        this.ratesFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterRate();
          });

        this.airRates = this.rates.filter((rate) => rate.type === "AIR");
        this.filteredAirRates.next(this.airRates.slice());
        this.airRatesFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterAirRate();
          });
        if (this.defaults) {
          this.airRatesCtrl.setValue(this.defaults.rate._id);
        } else {
          this.airRatesCtrl.setValue(this.ratesDef[0]._id);
        }


        this.seaRates = this.rates.filter((rate) => rate.type === "SEA");
        this.filteredSeaRates.next(this.seaRates.slice());
        this.seaRatesFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterSeaRate();
          });

        if (this.defaults) {
          this.seaRatesCtrl.setValue(this.defaults.rate._id);
        } else {
          this.seaRatesCtrl.setValue(this.ratesDef[1]._id);
        }


      });
    }
  }

  setRate() {
    const shippingId = this.shippingsCtrl.value;
    const selectedShipping = this.shippings.filter(
      (shipping) => shipping._id === shippingId
    );
    this.selectedShipping = selectedShipping[0];
    if (!this.guideCityRates) {
      this.rateService
        .getRateByType(this.selectedShipping.type)
        .subscribe((resp) => {
          this.guideRate = resp.data[0];
        });
    } else {
      this.guideRate = this.guideCityRates.filter(
        (rate) => rate.type === this.selectedShipping.type
      )[0];
    }
    this.costCalculate();
  }

  setNewRate() {
    const shippingId = this.shippingsCtrl.value;
    const selectedShipping = this.shippings.filter(
      (shipping) => shipping._id === shippingId
    );
    this.selectedShipping = selectedShipping[0];
    this.guideRate = this.rates.filter(
      (rate) => rate._id === this.ratesCtrl.value
    )[0];
    this.costCalculate();
  }

  showUserInfo() {
    this.customerSelected = false;
    let customerShow = "";
    if (this.defaults) {
      customerShow = this.defaults.customer._id;
    } else {
      customerShow = this.customersCtrl.value;
    }
    this.customerService
      .getCustomer(customerShow)
      .subscribe((resp: ServiceResponse) => {
        this.customer = new Customer(resp.data[0]);

        this.warehouseItemService
          .getWarehouseItemFullByCustomerId(customerShow, "1", false)
          .subscribe((respW) => {
            this.customerPackages = respW.data;

            if (this.defaults) {
              this.warehouseItemService
                .getWarehouseItemByPackageIds(this.defaults.packageList)
                .subscribe((respPL) => {
                  if (this.type !== 'quote') {
                    this.customerPackages = respPL.data.concat(
                      this.customerPackages
                    );
                  } else {
                    respPL.data.forEach((element) => {
                      this.customerPackages = this.customerPackages.filter(element2 => element._id !== element2._id);
                    });
                    this.customerPackages = respPL.data.concat(
                      this.customerPackages
                    );
                  }
                  this.setPackage(respPL.data);
                });
            }
          });

        const customer = new Customer({});
        customer._id = customerShow;

        this.addressService.getAddresses(customer).subscribe(
          (respAs: ServiceResponse) => {
            this.addresses = respAs.data;
            for (const address of this.addresses) {
              if (address.isDefault) {
                this.shippingAddress = address;
              }
            }

            if (!this.shippingAddress) {
              this.shippingAddress = this.addresses.filter(
                (address) => address.type === "0"
              )[0];
            }
            this.setInitialRate();
            this.customerSelected = true;
            this.cd.detectChanges();
          },
          (error) => console.log(error.error.msg)
        );
      });
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

    if (this.weightCtrl.value) {
      this.costCalculate();
    }
  }

  photoURL(type: string) {
    let url;
    if (this.mode === "update") {
      url = `${base_url}/uploads/guides/${this.defaults.imageUrl}`;
    } else {
      if (type === "repacking") {
        url = this.imageRepackingPreviewSrc;
      } else {
        url = this.imagePreviewSrc;
      }
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  previewImagen(file: File) {
    if (file) {
      this.imageToUpload = file;
      this.previewStatus = true;
      this.imagePreviewSrc = URL.createObjectURL(this.imageToUpload);
    }
  }

  previewRepackingImagen(file: File) {
    if (file) {
      this.imageRepackingToUpload = file;
      this.previewRepackingStatus = true;
      this.imageRepackingPreviewSrc = URL.createObjectURL(
        this.imageRepackingToUpload
      );
    }
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

  protected filterRate() {
    if (!this.rates) {
      return;
    }
    let search = this.ratesFilterCtrl.value;
    if (!search) {
      this.filteredRates.next(this.rates.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredRates.next(
      this.rates.filter((rate) => rate.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterAirRate() {
    if (!this.airRates) {
      return;
    }
    let search = this.airRatesFilterCtrl.value;
    if (!search) {
      this.filteredAirRates.next(this.airRates.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredAirRates.next(
      this.airRates.filter((rate) => rate.name.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterSeaRate() {
    if (!this.seaRates) {
      return;
    }
    let search = this.seaRatesFilterCtrl.value;
    if (!search) {
      this.filteredSeaRates.next(this.seaRates.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSeaRates.next(
      this.seaRates.filter((rate) => rate.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filterCustomer() {
    if (!this.customers) {
      return;
    }
    const search = this.customersFilterCtrl.value;
    if (!search) {
      this.filteredCustomers.next(this.customers.slice());
      return;
    } else {
      if (search.length > 3) {
        this.customerService
          .getCustomersLite(`name=${search}&tlCargoName=${search}`)
          .subscribe((resp: ServiceResponse) => {
            this.customers = resp.data;
            this.filteredCustomers.next(this.customers.slice());
            return;
          });
      } else {
        this.filteredCustomers.next(this.customers.slice());
        return;
      }
    }
  }

  protected filterShipping() {
    if (!this.shippings) {
      return;
    }
    let search = this.shippingsFilterCtrl.value;
    if (!search) {
      this.filteredShippings.next(this.shippings.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredShippings.next(
      // tslint:disable-next-line:max-line-length
      this.shippings.filter(
        (shipping) =>
          shipping.name.toLowerCase().indexOf(search) > -1 ||
          shipping.type.toLowerCase().indexOf(search) > -1
      )
    );
  }

  protected filterShippingById(id: string) {
    if (!this.shippings) {
      return;
    }

    this.filteredShippings.next(
      // tslint:disable-next-line:max-line-length
      this.shippings.filter((shipping) => shipping._id === Number(id))
    );
  }

  openSnackbar(message: string) {
    this.snackbar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  // TODO: Completar el reset de todas las variables del FORM //
  reset() {
    this.weightCtrl.setValue("");
    this.volumeCtrl.setValue("");
    this.customersCtrl.setValue("");
    this.packageTypesCtrl.setValue("");
    this.previewStatus = false;
    this.url = `${base_url}/uploads/guides/-`;
  }

  submitRepacking() {
    this.spinnerRepack = true;
    let isValidForm = true;

    if ("INVALID" === this.shippingsCtrl.status) {
      isValidForm = false;
      this.spinner = false;
    }

    if (this.needPkgType) {
      if (
        "INVALID" === this.shippingsCtrl.status ||
        "INVALID" === this.weightCtrl.status ||
        "INVALID" === this.packageTypesCtrl.status
      ) {
        isValidForm = false;
        this.spinnerRepack = false;
      }
    } else {
      if (
        "INVALID" === this.packageFormGroup.status ||
        "INVALID" === this.shippingsCtrl.status ||
        "INVALID" === this.weightCtrl.status ||
        "INVALID" === this.packageFormGroup.get("height").status ||
        "INVALID" === this.packageFormGroup.get("width").status ||
        "INVALID" === this.packageFormGroup.get("type").status ||
        "INVALID" === this.packageFormGroup.get("length").status
      ) {
        isValidForm = false;
        this.spinnerRepack = false;
      }
    }

    const newPackage = new WarehouseItemFull({});
    let desc = "Repacked: packages [";
    const customer = this.packageSelected[0].customer;
    const shipper = this.packageSelected[0].shipper;

    this.packageSelected.forEach((row: WarehouseItemFull) => {
      const packageId = `TL-${row._id.toString().substring(0, 5)}${row._id
        .toString()
        .substring(row._id.toString().toString().length - 5)}`;
      desc += `${packageId}, `;
    });
    this.filterPackages();

    newPackage.shortDesc = desc.substring(0, desc.length - 1) + "]";
    newPackage.infoPackage = desc;
    newPackage.vlb = this.vlbCtrl.value;
    newPackage.volume = this.volumeCtrl.value;
    newPackage.weight = this.weightCtrl.value;
    newPackage.trackingId = "N/A";
    newPackage.carrier = new Carrier({});
    newPackage.type = 2;
    newPackage.status = "1";

    if (this.needPkgType) {
      newPackage.packageTypeSelected = this.needPkgType;
      newPackage.package = this.packageTypes.filter(
        (pkg) => pkg._id === this.packageTypesCtrl.value
      )[0];
    } else {
      const height = this.packageFormGroup.get("height").value;
      const width = this.packageFormGroup.get("width").value;
      const length = this.packageFormGroup.get("length").value;
      const type = this.packageFormGroup.get("type").value;

      newPackage.package = new PackageType({ height, width, length, type });
      newPackage.package.name =
        "TLCARGO_" + height + "x" + width + "x" + length;
    }

    newPackage.shipper = shipper;
    newPackage.customer = customer;
    newPackage.infoCarrier = this.shipperNoteCtrl.value;
    newPackage.physicalLocation = this.physicalLocationCtrl.value;
    newPackage.imageUrl = this.imageRepackingPreviewSrc;

    if (this.notificationRePackCtrl.value) {
      newPackage.notifiedTimes = 1;
      newPackage.notification = true;
    } else {
      newPackage.notification = false;
    }

    let warehouseCreationResp: ServiceResponse;
    this.warehouseItemService
      .createRepackedWarehouseItems(newPackage, this.packageSelected)
      .subscribe(
        (resp: ServiceResponse) => {
          warehouseCreationResp = resp;
          if (warehouseCreationResp.ok) {
            if (this.previewRepackingStatus) {
              this.fileUploadService
                .photoUpdate(
                  this.imageRepackingToUpload,
                  "packages",
                  warehouseCreationResp.data._id.toString()
                )
                .then((img) => { });
              this.openSnackbar(
                "The repacked box was registered successfully, good job!!"
              );
            } else {
              this.openSnackbar(
                "The repacked box was registered successfully!!"
              );
            }
            this.customerPackages.push(warehouseCreationResp.data);
            if (newPackage.notification) {
              this.sendRepackingNotification(
                warehouseCreationResp.data,
                this.packageSelected
              );
            }
            this.reloadPackages(2);
            this.resetRePackage();
            this.spinnerRepack = false;
          } else {
            this.spinnerRepack = false;
            this.openSnackbar(resp.msg);
          }
        },
        (error) => {
          this.spinnerRepack = false;
          this.openSnackbar(error.error.msg);
        }
      );
  }

  resetRePackage() {
    this.repackingCtrl.setValue(false);
    this.vlbCtrl.setValue("");
    this.volumeCtrl.setValue("");
    this.weightCtrl.setValue("");
    this.packageFormGroup.get("height").setValue("");
    this.packageFormGroup.get("width").setValue("");
    this.packageFormGroup.get("length").setValue("");
    this.packageFormGroup.get("type").setValue("");
    this.shipperNoteCtrl.setValue("");
    this.physicalLocationCtrl.setValue("");
    this.notificationRePackCtrl.setValue(false);
    this.imageRepackingPreviewSrc = "";
    this.previewRepackingStatus = false;
  }

  filterPackages() {
    for (let index = 0; index < this.customerPackages.length; index++) {
      if (this.packageSelected.includes(this.customerPackages[index])) {
        this.customerPackages.splice(index, 1);
        this.filterPackages();
      }
    }
  }

  reloadPackages(type: number) {
    this.tlPackages = new TlPackagesModel({
      packageSelected: this.packageSelected,
      customerPackages: this.customerPackages,
    });
    this.pickingListChildren.forEach((child) =>
      child.OnResetParent(this.tlPackages)
    );
    if (type === 2) {
      //
      this.tlPackages.packageSelected.splice(0);
      this.tempRepackingChildren.forEach((child) =>
        child.OnResetParent(this.tlPackages)
      );
    }
  }


  preSubmit() {
    if (this.minNote !== '') {
      Swal.fire({
        icon: "warning",
        title: "Wait!...",
        html: this.minNote.substring(3),
        showCancelButton: true,
        confirmButtonText: "Yes, create the guide!",
        cancelButtonText: "No, cancel!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.submit();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.spinner = false;
        }
      });
    } else {
      this.submit();
    }
  }

  submit() {
    this.spinner = true;
    let isValidForm = true;
    const guideForm: any = {};

    if (!this.shippingAddress) {
      Swal.fire(
        "To generate a shipping guide it is necessary that the customer have at least one address registered"
      );
      this.spinner = false;
      return;
    } else {
      if (this.addresses.length === 0) {
        Swal.fire(
          "To generate a shipping guide it is necessary that the customer have at least one address registered"
        );
        this.spinner = false;
        return;
      }
    }

    if (!this.packageSelected) {
      Swal.fire(
        "To generate a shipping guide it is necessary to select at least 1 package"
      );
      this.spinner = false;
      return;
    } else {
      if (this.packageSelected.length === 0) {
        Swal.fire(
          "To generate a shipping guide it is necessary to select at least 1 package"
        );
        this.spinner = false;
        return;
      }
    }

    if ("INVALID" === this.shippingsCtrl.status) {
      isValidForm = false;
      this.spinner = false;
    }

    if (isValidForm) {
      for (const customerPackage of this.packageSelected) {
        this.selectedPackages.push(customerPackage._id.toString());
      }

      if (this.defaults) {
        this.selectedCustomer = this.defaults.customer;
      } else {

        this.selectedCustomer = this.customers.filter((customer) => customer._id === this.customersCtrl.value)[0];
        guideForm.customer = this.customersCtrl.value;
      }

      guideForm.notes = this.notesCtrl.value;

      if (this.type !== "quote") {

        this.selectedShipping = this.shippings.filter((shipping) => shipping._id === this.shippingsCtrl.value)[0];

        guideForm.shipping = this.selectedShipping;
        guideForm.quote = false;

        if (guideForm.shipping.type === 'AIR') {
          let biggerWeight = guideForm.finalWeight > guideForm.finalVlb ? guideForm.finalWeight : guideForm.finalVlb;
          if (biggerWeight < min_weight_air) {
            guideForm.notes = guideForm.notes + ` - The weight was adjusted to ${min_weight_air} lbs.`;
          }
        } else {
          if (guideForm.finalVolume < min_weight_sea) {
            guideForm.notes = guideForm.notes + ` - The weight was adjusted to ${min_weight_sea} ft3.`;
          }
        }

        guideForm.name =
          `${this.selectedCustomer.tlCargoName}-${this.selectedShipping.type}-${this.selectedShipping.name}-` +
          Date.now();
        guideForm.cost = this.costCtrl.value;

        if (this.guideRate) {
          guideForm.rate = this.guideRate;
          guideForm.rateAmount = this.guideRate.rate;
        }

      }

      guideForm.packageList = this.selectedPackages;
      guideForm.notification = this.notificationCtrl.value;
      guideForm.deliveryAddress = this.shippingAddress;
      guideForm.status = "3";

      if (this.packageSelected.length > 1) {
        guideForm.type = "2";

        guideForm.finalWeight = this.packageSelected.reduce(
          (accumulator, data) => accumulator + Number(data.weight),
          0
        );

        guideForm.finalVlb = this.packageSelected.reduce(
          (accumulator, data) => accumulator + Number(data.vlb),
          0
        );

        guideForm.finalVolume = this.packageSelected.reduce(
          (accumulator, data) => accumulator + Number(data.volume),
          0
        );
      } else {
        guideForm.type = "1";
        guideForm.finalWeight = this.packageSelected[0].weight;
        guideForm.finalVolume = this.packageSelected[0].volume;
        guideForm.finalVlb = this.packageSelected[0].vlb;
      }

      this.ejecutarCreacion(guideForm);

    } else {
      this.openSnackbar("Please fill all the required fields");
    }

  }

  async ejecutarCreacion(guideForm) {

    if (this.mode !== "update") {

      if (this.type === "quote") {

        if (this.quoteAirCtrl.value === false && this.quoteSeaCtrl.value === false) {
          this.openSnackbar("Please select at least one shipping quote type");
          this.spinner = false;
          return;
        }

        let quoteContainer = new Quote({});
        quoteContainer.customer = this.selectedCustomer._id;
        quoteContainer.status = "1";
        quoteContainer.preGuideList = [];

        if (this.quoteAirCtrl.value === true) {

          guideForm.quote = true;
          guideForm.name = `${this.selectedCustomer.tlCargoName}-AIR-QUOTE-` + Date.now();
          guideForm.cost = this.airCost;
          guideForm.rate = this.airRatesCtrl.value;
          guideForm.rateAmount = this.airRates.filter(rate => rate._id === this.airRatesCtrl.value)[0].rate;


          if (this.minVolume || this.minWeight) {
            guideForm.notes = guideForm.notes + ` - The weight was adjusted to ${min_weight_air} lbs.`;
          }

          await this.guideService.createGuide(guideForm).subscribe(
            (resp: any) => {
              if (this.previewStatus) {
                this.fileUploadService
                  .photoUpdate(this.imageToUpload, "guides", resp.data._id)
                  .then((img) => console.log(img));
              }
              if (resp.ok) {
                quoteContainer.preGuideList.push(resp.data);

                if (this.quoteSeaCtrl.value === false) {
                  this.quoteService.createQuote(quoteContainer).subscribe(
                    (respQ: ServiceResponse) => {
                      if (respQ.ok) {
                        this.openSnackbar(respQ.msg);
                        setTimeout(() => {
                          this.router.navigate(['/app/shipping-quotes']);
                        }, 2000);
                      } else {
                        this.openSnackbar(respQ.msg);
                        this.spinner = false;
                      }
                    });

                }
              } else {
                this.openSnackbar(resp.msg);
                this.spinner = false;
              }
            },
            (error) => this.openSnackbar(error.error.msg)
          );
        }

        if (this.quoteSeaCtrl.value === true) {

          const guideFormSea = { ...guideForm };
          guideFormSea.quote = true;
          guideFormSea.name = `${this.selectedCustomer.tlCargoName}-SEA-QUOTE-` + Date.now();
          guideFormSea.cost = this.seaCost;
          guideFormSea.rate = this.seaRatesCtrl.value;
          guideFormSea.rateAmount = this.seaRates.filter(rate => rate._id === this.seaRatesCtrl.value)[0].rate;


          if (this.minVolume || this.minWeight) {
            guideFormSea.notes = guideFormSea.notes + ` - The weight was adjusted to ${min_weight_sea} ft3.`;
          }

          await this.guideService.createGuide(guideFormSea).subscribe(
            (resp: any) => {
              if (this.previewStatus) {
                this.fileUploadService
                  .photoUpdate(this.imageToUpload, "guides", resp.data._id)
                  .then((img) => console.log(img));
              }

              if (resp.ok) {
                quoteContainer.preGuideList.push(resp.data);
                this.quoteService.createQuote(quoteContainer).subscribe(
                  (respQ: ServiceResponse) => {
                    if (respQ.ok) {
                      this.openSnackbar(respQ.msg);
                      setTimeout(() => {
                        this.router.navigate(['/app/shipping-quotes']);
                      }, 2000);
                    } else {
                      this.openSnackbar(respQ.msg);
                      this.spinner = false;
                    }
                  });

              } else {
                this.openSnackbar(resp.msg);
                this.spinner = false;
              }
            },
            (error) => this.openSnackbar(error.error.msg)
          );
        }

      } else {
        this.guideService.createGuide(guideForm).subscribe(
          (resp: any) => {
            if (this.previewStatus) {
              this.fileUploadService
                .photoUpdate(this.imageToUpload, "guides", resp.data._id)
                .then((img) => console.log(img));
            }
            if (resp.ok) {
              this.openSnackbar(resp.msg);
              this.openQRStick(resp.data);
              setTimeout(() => {
                this.router.navigate(['/app/guides']);
              }, 2000);
            } else {
              this.openSnackbar(resp.msg);
              this.spinner = false;
            }
          },
          (error) => this.openSnackbar(error.error.msg)
        );
      }

    } else {
      guideForm._id = this.defaults._id;
      if (this.type === "quote") {
        guideForm.quote = true;
        if (this.editQuoteAir) {
          guideForm.cost = this.airCost;
          guideForm.rate = this.airRatesCtrl.value;
          guideForm.rateAmount = this.airRates.filter(rate => rate._id === this.airRatesCtrl.value)[0].rate;

          if (this.minVolume || this.minWeight) {
            guideForm.notes = guideForm.notes + ` - The weight was adjusted to ${min_weight_air} lbs.`;
          }
        } else {
          guideForm.cost = this.seaCost;
          guideForm.rate = this.seaRatesCtrl.value;
          guideForm.rateAmount = this.seaRates.filter(rate => rate._id === this.seaRatesCtrl.value)[0].rate;
          if (this.minVolume || this.minWeight) {
            guideForm.notes = guideForm.notes + ` - The weight was adjusted to ${min_weight_sea} ft3.`;
          }
        }
      }

      this.guideService.updateGuide(guideForm).subscribe(
        (resp: ServiceResponse) => {
          if (this.imageToUpload) {
            this.fileUploadService
              .photoUpdate(this.imageToUpload, "guides", resp.data._id)
              .then((img) => { });
          }
          if (resp.ok) {
            this.openSnackbar(resp.msg);
            setTimeout(() => {
              if (this.type === 'quote') {
                this.router.navigate(['/app/shipping-quotes']);
              } else {
                this.openQRStick(resp.data);
                this.router.navigate(['/app/guides']);
              }
            }, 2000);
          } else {
            this.openSnackbar(resp.msg);
            this.spinner = false;
          }
        },
        (error) => {
          this.spinner = false;
          this.openSnackbar(error.error.msg);
        }
      );
    }
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

  sendRepackingNotification(
    rePackage: WarehouseItemFull,
    rePackageSelected: WarehouseItemFull[]
  ) {
    let oldVolumeValue = 0;
    let oldVlbValue = 0;
    let oldWeightValue = 0;

    let totalACost = 0;
    let totalMCost = 0;
    let finalACost = 0;
    let finalMCost = 0;
    let diffACost = 0;
    let diffMCost = 0;

    let packagesRows = "";
    let odd = 1;
    for (const packageWh of rePackageSelected) {
      this.tlCargoId = this.tlCargoIdPipe.transform(
        packageWh._id.toString(),
        "TL"
      );
      oldVlbValue += Number(packageWh.vlb);
      oldWeightValue += Number(packageWh.weight);
      oldVolumeValue += Number(packageWh.volume);

      if (odd % 2 === 0) {
        packagesRows += `<tr>
          <td>${this.tlCargoId}</td>
          <td>${packageWh.trackingId}</td>
          <td>${packageWh.shortDesc}</td>
          <td>${packageWh.weight} libras.</td>
          <td>${packageWh.vlb} vlb.</td>
          <td>${packageWh.volume} ft<sup>3</sup></td>
        </tr>`;
      } else {
        packagesRows += `<tr class="alt">
          <td>${this.tlCargoId}</td>
          <td>${packageWh.trackingId}</td>
          <td>${packageWh.shortDesc}</td>
          <td>${packageWh.weight} libras.</td>
          <td>${packageWh.vlb} vlb.</td>
          <td>${packageWh.volume} ft<sup>3</sup></td>
        </tr>`;
      }

      odd++;
    }

    let repackContent = `
    <tr>
    <td style="padding: 20px;;">
      <h2 style="font-size: 14pt;">Hola ${rePackage.customer.name}!</h2>
      <p style="font-size: 12pt;" >Te confirmamos que hemos terminado el proceso de reempaque de los siguientes paquetes:</p>
      <div class="datagrid">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Tracking Id</th>
              <th>Descripción</th>
              <th>Peso</th>
              <th>Vlb</th>
              <th>Volumen</th>
            </tr>
          </thead>
          <tbody>
            ${packagesRows}
          </tbody>
        </table>
      </div>
    </td>
  </tr>`;

    for (const rate of this.ratesDef) {
      if (rate.type === "AIR") {
        if (oldVlbValue > oldWeightValue) {
          finalACost = Number(Number(oldVlbValue) * rate.rate);
        } else {
          finalACost = Number(Number(oldWeightValue) * rate.rate);
        }
      } else {
        finalMCost = Number(Number(oldVolumeValue) * rate.rate);
      }
    }

    totalACost =
      rePackage.vlb > rePackage.weight
        ? +rePackage.vlb *
        this.ratesDef.filter((row) => row.type === "AIR")[0].rate
        : +rePackage.weight *
        this.ratesDef.filter((row) => row.type === "AIR")[0].rate;
    totalMCost =
      +rePackage.volume *
      this.ratesDef.filter((row) => row.type === "SEA")[0].rate;

    diffACost = finalACost - totalACost;
    diffMCost = finalMCost - totalMCost;

    this.urlItem = `${this_url}/#/warehouse-item-receipt/${rePackage._id}`;
    this.urlItem2 = `${this_url}/#/re-package-list/${rePackage._id}`;

    let repackTable = "";
    let saleTable = "";

    if (diffMCost > 2 || diffACost > 2) {
      saleTable = `<tr>
                    <td>
                      <div style="background: #67adf3; border-radius: 20px">
                        <h3 style="font-size: 12pt;" >Si escoges la modalidad Aerea te ahorras</h3>
                        <h1 style="font-size: 24pt; padding: 15px;"> ${diffACost.toLocaleString(
        "en",
        { style: "currency", currency: "USD" }
      )} </h1>
                      </div>
                    </td>
                    <td >
                      <div style="background: #67adf3; border-radius: 20px">
                        <h3 style="font-size: 12pt;" >Si escoges la modalidad Marítima te ahorras</h3>
                        <h1 style="font-size: 24pt; padding: 15px"> ${diffMCost.toLocaleString(
        "en",
        { style: "currency", currency: "USD" }
      )} </h1>
                      </div>
                    </td>
                  </tr>`;
    }

    repackTable = `<tr>
    <td>
        <table style="padding: 10px 10px 10px 10px; text-align: center" >
        ${saleTable}
          <tr>
              <td colspan="2">
                  <table style="width: 100%;">
                    <thead>
                      <tr>
                        <th style="width: 50%; background: #FF7A59; padding: 10px; font-size: 12pt;" colspan="2">Antes del Reempaque</th>
                        <th style="width: 50%; background: #59ff80; padding: 10px; font-size: 12pt;" colspan="2">Despues del Reempaque</th>
                      </tr>
                    </thead>
                    <tr style="text-align: left;">
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                        Peso volumétrico:
                      </td>
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                      ${oldVlbValue.toFixed(2)} vlb.
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                        Peso volumétrico:
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                      ${Number(rePackage.vlb).toFixed(2)} vlb.
                      </td>
                    </tr>
                    <tr style="text-align: left;">
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                        Peso:
                      </td>
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                      ${oldWeightValue.toFixed(
      2
    )} libras <span style="font-size: 8pt;"> ${Number(
      oldWeightValue / 2.2046
    ).toFixed(2)} Kgs.</span>
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                        Peso:
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                      ${Number(rePackage.weight).toFixed(
      2
    )} libras <span style="font-size: 8pt;"> ${Number(
      +rePackage.weight / 2.2046
    ).toFixed(2)} Kgs.</span>
                      </td>
                    </tr>
                    <tr style="text-align: left;">
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                        Volumen
                      </td>
                      <td style="background: #f0c1b6; padding: 5px; font-size: 9pt;">
                      ${oldVolumeValue.toFixed(2)} ft<sup>3</sup>
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                        Volumen:
                      </td>
                      <td style="background: #bcf0b6; padding: 5px; font-size: 9pt;">
                      ${Number(rePackage.volume).toFixed(2)} ft<sup>3</sup>
                      </td>
                    </tr>
                  </table>
              </td>
          </tr>
        </table>
    </td>
  </tr>`;

    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = rePackage.customer.email;
    mail.subject = "Hemos reempacado alguno de tus paquetes!!";
    mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi"> <title>Sistema de notificación de TLCARGO </title> <meta property="og:title" content="Email template"> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85C1E9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85C1E9), color-stop(1, #6998B8) );background:-moz-linear-gradient( center top, #85C1E9 5%, #6998B8 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8');background-color:#85C1E9; color:#FFFFFF; font-size: 12px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { color: #00496B; font-size: 11px;font-weight: normal; }.datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2{ font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button{ font: inherit; background-color: #FF7A59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform:uppercase; letter-spacing: 1px; color: #CBD6E2; } </style> </head> <body bgcolor="#F5F8FA" style="width: 100%; margin: auto 0; padding:0; font-family:Lato, sans-serif; font-size:18px; color:#33475B; word-break:break-word"> <! View in Browser Link --> <div id="email"> <table align="right" role="presentation"> <tr> <td> <!-- <a class="subtle-link" href="#">Ver en el navegador</a> --> </td> <tr> </table> <! Banner --> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black;"> <br> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle"> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white;"> <br> <h2> Reempacamos algunos de tus paquetes!! </h2> </td> </tr> </table> <! First Row --> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%"> ${repackContent} ${repackTable} <tr> <td style="text-align: center; font-size: 8pt; padding:5px;"> <hr> <p>Si necesitas mas detalles respecto a tu paquete por favor haz click en en siguiente enlace. <br>${this.urlItem} </p> <hr> <p> Una vez que hayas confirmado la recepción y verificado que todo lo que has comprado esté correcto, por favor avísanos cuándo deseas que enviemos tus productos a Venezuela. Para ello, te pedimos que nos envíes un correo electrónico único con la lista de los números de recibo (TL-xxxx) y la confirmación de cuándo y en qué tipo de envío deseas que los despachemos. <br>Estamos aquí para ayudarte en todo el proceso. </p> </td> </tr> <tr> <td style="text-align: center; background-color: #85C1E9; font-size: larger;"> <br> ¡Gracias por preferirnos!<br> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style=" text-align: left; background-color: #85C1E9;"> <ul style="font-size: 6pt;"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li><b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li><b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488</li> </ul> </td> </tr> <tr> <td style=" text-align: center; background-color: #85C1E9;"> <a style="text-decoration: none;" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.facebook.com/TLCARGOmiami/"> <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://twitter.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px"> </a> &nbsp; <a style="text-decoration: none;" href="https://www.instagram.com/tlcargomiami/"> <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px"> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%" > <tr> <td align="left" style="padding:15px;"> <p style="color:white; text-align: center"> Made with <span style="color: #d94c53;">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;
    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      if (resp.info.response.includes("250")) {
        this.openSnackbar("Customer notified Correctly!!");
      } else {
        this.openSnackbar("We have some problems sending the notification!!");
      }
    });
  }
}
