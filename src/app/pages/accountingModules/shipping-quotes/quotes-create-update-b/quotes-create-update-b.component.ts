import {
  ChangeDetectorRef,
  Component,
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
  MatDialog,
} from "@angular/material/dialog";

import { stagger80ms } from "../../../../../@vex/animations/stagger.animation";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "../../../../../@vex/animations/scale-in.animation";
import { fadeInRight400ms } from "../../../../../@vex/animations/fade-in-right.animation";

import icRule from "@iconify/icons-ic/twotone-rule";
import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import icClose from "@iconify/icons-ic/twotone-close";
import icMoney from "@iconify/icons-ic/monetization-on";

import { WarehouseItemService } from "../../../../services/warehouse-item.service";
import { PackageTypeService } from "../../../../services/package-type.service";
import { CustomerService } from "../../../../services/customer.service";

import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { PackageTypeCreateUpdateComponent } from "../../../adminModules/package-type-registry/package-type-create-update/package-type-create-update.component";

import { FileUploadService } from "../../../../services/file-upload.service";
import { GuidesService } from "../../../../services/guides.service";
import { AddressService } from "../../../../services/address.service";
import { RateService } from "../../../../services/rate.service";

import { Customer } from "../../../warehousingModules/customers-registry/interfaces/customer.model";
import { PackageType } from "../../../adminModules/package-type-registry/interfaces/package-type.model";
import { Address } from "../../../warehousingModules/customers-registry/interfaces/address.model";
import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { Rate } from "../../../adminModules/rate-registry/interfaces/rate.model";
import { Quote } from "../interfaces/quote-containers.model";

import Swal from "sweetalert2";

import { environment } from "../../../../../environments/environment";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { WarehouseItemFull } from "../../../warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model";
import { PickingListPackageComponent } from "../picking-list-package/picking-list-package.component";
import { TlPackagesModel } from "../interfaces/tl-packages.model";
import { MailService } from "src/app/services/mail.service";
import { ActivatedRoute, Router } from "@angular/router";
import { QuotesService } from "src/app/services/quotes.service";
import { GuidesEnt } from "../interfaces/guides-ent.model";
import { GuidesEntPop } from "../interfaces/guides-ent-pop.model";

const base_url = environment.base_url;
const this_url = environment.this_url;
const min_weight_air = environment.min_weight_air;
const min_weight_sea = environment.min_weight_sea;

@Component({
  selector: "vex-quotes-create-update-b",
  templateUrl: "./quotes-create-update-b.component.html",
  styleUrls: ["./quotes-create-update-b.component.scss"],
  animations: [stagger80ms, fadeInUp400ms, scaleIn400ms, fadeInRight400ms],
})
export class QuotesCreateUpdateBComponent implements OnInit {
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

  public customerCtrl: FormControl = new FormControl("");
  public volumeCtrl: FormControl = new FormControl("");
  public vlbCtrl: FormControl = new FormControl("");
  public weightCtrl: FormControl = new FormControl("", [Validators.required]);
  public costCtrl: FormControl = new FormControl("");
  public notesCtrl: FormControl = new FormControl("");
  public notificationCtrl: FormControl = new FormControl();

  public shipperNoteCtrl: FormControl = new FormControl("");
  public physicalLocationCtrl: FormControl = new FormControl("");
  public totalsCtrl: FormControl = new FormControl();

  protected _onDestroy = new Subject<void>();

  mode: "create" | "update" = "create";

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

  public customerSelected = false;
  public packageSelected: WarehouseItemFull[];
  public customerPackages: WarehouseItemFull[];
  public tlPackages: TlPackagesModel;
  public shippingAddress: Address;
  public addresses: Address[];
  public customer: Customer;

  public oldWeight = 0;
  public oldVolume = 0;
  public oldVolumeWeight = 0;

  public oldHeight = 0;
  public oldWidth = 0;
  public oldLength = 0;

  public selectedCustomer;
  public selectedPackages: string[] = [];
  public needPkgType = false;
  public packageFormGroup: FormGroup;
  public customerUpdate = false;
  public spinner = false;

  public rates: Rate[];
  public airRateDef: Rate;
  public seaRateDef: Rate;

  public airPreGuide: GuidesEntPop;
  public seaPreGuide: GuidesEntPop;

  urlItem = "";
  urlItem2 = "";

  tlCargoId = "";
  quoteId = '0';
  public quote: Quote;

  @ViewChildren(PickingListPackageComponent)
  pickingListChildren: QueryList<PickingListPackageComponent>;

  public minNote = '';
  public biggerWeight;
  public minWeight = false;
  public minVolume = false;
  public seaCost = 0;
  public airCost = 0;

  constructor(
    private router: Router,
    private rutaActiva: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private warehouseItemService: WarehouseItemService,
    private packageTypeService: PackageTypeService,
    private customerService: CustomerService,
    private guideService: GuidesService,
    private quoteService: QuotesService,
    private fileUploadService: FileUploadService,
    private addressService: AddressService,
    private rateService: RateService,
    private mailService: MailService,
    private snackbar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {


  }

  ngOnInit() {

    this.notificationCtrl.setValue(true);

    this.packageFormGroup = this.fb.group({
      height: ["", [Validators.required]],
      width: ["", [Validators.required]],
      length: ["", [Validators.required]],
      type: ["", [Validators.required]],
    });



    this.setRates();

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

    this.quoteId = this.rutaActiva.snapshot.params.quoteId;

    if (this.quoteId !== '0') {
      this.quoteService.getQuote(this.quoteId).subscribe((resp: ServiceResponse) => {
        this.quote = resp.data[0];

        if (this.quote) {
          this.mode = "update";
          this.previewStatus = true;

          this.volumeCtrl.setValue(this.quote.preGuideList[0].finalVolume);
          this.vlbCtrl.setValue(this.quote.preGuideList[0].finalVlb);
          this.weightCtrl.setValue(this.quote.preGuideList[0].finalWeight);
          this.notesCtrl.setValue(this.quote.preGuideList[0].notes);
          this.customerUpdate = true;
          this.customerCtrl.setValue(
            this.quote.customer.name + " - " + this.quote.customer.tlCargoName
          );


          this.airPreGuide = this.quote.preGuideList.filter(guide => guide.name.includes('AIR'))[0];
          this.seaPreGuide = this.quote.preGuideList.filter(guide => guide.name.includes('SEA'))[0];

          this.airRatesCtrl.setValue(this.airPreGuide.rate);
          this.seaRatesCtrl.setValue(this.seaPreGuide.rate);
          this.showUserInfo();
        }
      });

    }
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


    vlb = Number(this.oldVolumeWeight);
    weight = Number(this.oldWeight);

  }

  setAddressBook(addresses: Address[]) {
    this.addresses = addresses;
    this.shippingAddress = addresses.filter((address) => address.isDefault)[0];
  }

  setPackage(packages: WarehouseItemFull[]) {
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

    if (this.packageSelected.length === 0) {
      this.airCost = 0;
      this.seaCost = 0;
      this.minNote = "";
      this.biggerWeight = 0;
    } else {
      this.biggerWeight = this.oldWeight > this.oldVolumeWeight ? this.oldWeight : this.oldVolumeWeight;

      if (this.biggerWeight < 4) {
        this.biggerWeight = 4;
        this.minWeight = true;
        this.minNote = "The minimum weight for air shipping is " + min_weight_air + " lbs. Cost calculation will be done with this minimum weight";
      } else {
        this.minNote = "";
        this.minWeight = false;
      }

      if (this.oldVolume < 3) {
        this.oldVolume = 3;
        this.minVolume = true;
        this.minNote = this.minNote !== "" ? this.minNote + " / " : "";
        this.minNote += "The minimum weight for sea shipping is " + min_weight_sea + " ft<sup>3</sup>. Cost calculation will be done with this minimum weight";

      }

      if (this.quote) {
        this.airCost = this.biggerWeight * this.rates.filter((rate) => rate._id === this.airPreGuide.rate.toString())[0].rate;
        this.seaCost = this.oldVolume * this.rates.filter((rate) => rate._id === this.seaPreGuide.rate.toString())[0].rate;
      } else {
        this.airCost = this.biggerWeight * this.airRateDef.rate;
        this.seaCost = this.oldVolume * this.seaRateDef.rate;
      }
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

  setRates() {
    this.rateService.getRates().subscribe((resp: ServiceResponse) => {

      this.rates = resp.data;

      this.airRates = this.rates.filter((rate) => rate.type === "AIR");
      this.filteredAirRates.next(this.airRates.slice());
      this.airRatesFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterAirRate();
        });

      this.seaRates = this.rates.filter((rate) => rate.type === "SEA");
      this.filteredSeaRates.next(this.seaRates.slice());
      this.seaRatesFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterSeaRate();
        });

      this.airRateDef = this.rates.filter(rate => rate.type === 'AIR' && rate.isDefault)[0];
      this.seaRateDef = this.rates.filter(rate => rate.type === 'SEA' && rate.isDefault)[0];

      this.airRatesCtrl.setValue(this.airRateDef._id);
      this.seaRatesCtrl.setValue(this.seaRateDef._id);

    });
  }

  clearUserInfo() {
    this.customerSelected = false;
    this.customer = new Customer({});
    this.customerPackages = [];
    this.addresses = [];
    this.shippingAddress = new Address({});
    this.setPackage([]);
  }

  showUserInfo() {
    this.clearUserInfo();
    let customerShow = "";
    if (this.quote) {
      customerShow = this.quote.customer._id;
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

            if (this.quote) {
              this.warehouseItemService
                .getWarehouseItemByPackageIds(this.quote.preGuideList[0].packageList)
                .subscribe((respPL) => {
                  respPL.data.forEach((element) => {
                    this.customerPackages = this.customerPackages.filter(element2 => element._id !== element2._id);
                  });
                  this.customerPackages = respPL.data.concat(
                    this.customerPackages
                  );
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
      url = `${base_url}/uploads/guides/${this.quote.preGuideList[0].imageUrl}`;
    } else {
      url = this.imagePreviewSrc;
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
    }
  }


  checkMin() {
    if (this.minNote !== '') {
      let msg = this.mode === 'update' ? "Yes, update the quote!" : "Yes, create the quote!";

      Swal.fire({
        icon: "warning",
        title: "Wait!...",
        html: this.minNote.substring(3),
        showCancelButton: true,
        confirmButtonText: msg,
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
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "To generate a shipping quote it is necessary to select at least 1 package",
      });
      this.spinner = false;
      return;
    } else {
      if (this.packageSelected.length === 0) {
        Swal.fire(
          {
            icon: "error",
            title: "Oops...",
            text: "To generate a shipping quote it is necessary to select at least 1 package",
          });
        this.spinner = false;
        return;
      }
    }

    if (isValidForm) {
      for (const customerPackage of this.packageSelected) {
        this.selectedPackages.push(customerPackage._id.toString());
      }

      if (this.quote) {
        this.selectedCustomer = this.quote.customer;
      } else {
        this.selectedCustomer = this.customers.filter((customer) => customer._id === this.customersCtrl.value)[0];
        guideForm.customer = this.customersCtrl.value;
      }

      guideForm.notes = this.notesCtrl.value;
      guideForm.packageList = this.selectedPackages;
      guideForm.notification = this.notificationCtrl.value;
      guideForm.deliveryAddress = this.shippingAddress;
      guideForm.status = "1";

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

      this.doIt(guideForm);

    } else {
      this.openSnackbar("Please fill all the required fields");
    }

  }

  async doIt(guideForm) {


    let quoteContainer = new Quote({});
    quoteContainer.customer = this.selectedCustomer._id;
    quoteContainer.status = "1";
    quoteContainer.preGuideList = [];

    guideForm.quote = true;
    guideForm.name = `${this.selectedCustomer.tlCargoName}-AIR-QUOTE-` + Date.now();
    guideForm.cost = this.airCost;
    guideForm.rate = this.airRatesCtrl.value;
    guideForm.rateAmount = this.airRates.filter(rate => rate._id === this.airRatesCtrl.value)[0].rate;


    if (this.minWeight) {
      guideForm.notes = guideForm.notes + ` - The weight was adjusted to ${min_weight_air} lbs.`;
    }

    const guideFormSea = { ...guideForm };
    guideFormSea.quote = true;
    guideFormSea.name = `${this.selectedCustomer.tlCargoName}-SEA-QUOTE-` + Date.now();
    guideFormSea.cost = this.seaCost;
    guideFormSea.rate = this.seaRatesCtrl.value;
    guideFormSea.rateAmount = this.seaRates.filter(rate => rate._id === this.seaRatesCtrl.value)[0].rate;


    if (this.minVolume) {
      guideFormSea.notes = guideFormSea.notes + ` - The weight was adjusted to ${min_weight_sea} ft3.`;
    }

    if (this.mode === "update") {
      guideForm._id = this.airPreGuide._id;
      guideFormSea._id = this.seaPreGuide._id;
    }

    quoteContainer.preGuideList.push(guideForm);
    quoteContainer.preGuideList.push(guideFormSea);

    quoteContainer.preGuideList.forEach((preGuide, index) => {

      if (this.mode !== "update") {
        this.guideService.createGuide(new GuidesEnt(preGuide)).subscribe(
          (resp: any) => {
            if (this.previewStatus) {
              this.fileUploadService
                .photoUpdate(this.imageToUpload, "guides", resp.data._id)
                .then((img) => console.log(img));
            }
            if (resp.ok) {
              quoteContainer.preGuideList[index] = resp.data._id;

              if (index === 1) {
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
      } else {
        this.guideService.updateGuide(new GuidesEnt(preGuide)).subscribe(
          (resp: any) => {
            if (this.previewStatus) {
              this.fileUploadService
                .photoUpdate(this.imageToUpload, "guides", resp.data._id)
                .then((img) => console.log(img));
            }
            if (resp.ok) {
              quoteContainer.preGuideList[index] = resp.data._id;

              if (index === 1) {
                quoteContainer._id = this.quote._id;
                this.quoteService.updateQuote(quoteContainer).subscribe(
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

}
