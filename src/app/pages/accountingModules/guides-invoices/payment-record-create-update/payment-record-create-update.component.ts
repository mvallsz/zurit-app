import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatSelect } from "@angular/material/select";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";

import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import Swal from "sweetalert2";

import icMoney from "@iconify/icons-ic/monetization-on";
import icAttachMoney from "@iconify/icons-ic/twotone-attach-money";
import icRule from "@iconify/icons-ic/twotone-rule";
import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import icClose from "@iconify/icons-ic/twotone-close";
import icPrint from "@iconify/icons-ic/twotone-print";
import icBoxo from "@iconify/icons-ic/twotone-outbox";

import { PaymentTypeService } from "../../../../services/payment-type.service";
import { CustomerService } from "../../../../services/customer.service";
import { GuidesService } from "../../../../services/guides.service";

import { ServiceResponse } from "../../../../interfaces/service-response.interface";
import { GuidesEnt } from "../../../outgoingShippingModules/shipping-guides/interfaces/guides-ent.model";
import { GuidesEntPop } from "../../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model";
import { PaymentType } from "../../payment-types-registry/interfaces/payment-type.model";
import { Address } from "../../../warehousingModules/customers-registry/interfaces/address.model";
import { AddressService } from "../../../../services/address.service";
import { TlCargoIdPipe } from "../../../../pipes/tl-cargo-id/tl-cargo-id.pipe";
import { environment } from "../../../../../environments/environment";
import { MailService } from "../../../../services/mail.service";
import { PaymentBitacoraComponent } from "../../../utility/payment-bitacora/payment-bitacora.component";
const this_url = environment.this_url;
const adminEmails = environment.admin_email;
const adminNotification = environment.admin_notification;

@Component({
  selector: "vex-payment-record-create-update",
  templateUrl: "./payment-record-create-update.component.html",
  styleUrls: ["./payment-record-create-update.component.scss"],
})
export class PaymentRecordCreateUpdateComponent implements OnInit {
  public spinner = false;
  public discountAmount = 0;
  public discountDetails = "";
  public creditDetails = "";
  public newCost = 0;

  protected paymentTypes: PaymentType[] = [];
  public paymentTypesCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public paymentTypesFilterCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);
  public filteredPaymentTypes: ReplaySubject<PaymentType[]> = new ReplaySubject<
    PaymentType[]
  >(0);
  @ViewChild("paymentTypesSelect", { static: true })
  paymentTypesSelect: MatSelect;

  public discountTypes = [
    {
      id: 1,
      name: "% Discount",
    },
    {
      id: 2,
      name: "Amount Discount",
    },
  ];

  icMoney = icMoney;
  icCard = icAttachMoney;
  icRule = icRule;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icPrint = icPrint;

  protected _onDestroy = new Subject<void>();

  public useBalanceCtrl: FormControl = new FormControl("");
  public discountCtrl: FormControl = new FormControl("");
  public discountTypeCtrl: FormControl = new FormControl("");
  public balanceCtrl: FormControl = new FormControl("");
  public rateCtrl: FormControl = new FormControl("");
  public volumenCtrl: FormControl = new FormControl("");
  public costCtrl: FormControl = new FormControl("");
  public percentageDiscountCtrl: FormControl = new FormControl("");
  public amountDiscountCtrl: FormControl = new FormControl("");
  public notificationCtrl: FormControl = new FormControl("");
  public paidAmountCtrl: FormControl = new FormControl("", [
    Validators.required,
  ]);

  public billingAddress: Address;
  public addresses: Address[];

  public balance;
  public credit = 0;
  public partialCredit = false;
  public fullCredit = false;
  mode: "create" | "update" = "create";
  formula = "";

  public tlCargoId = "";
  urlItem = "";

  public fecha = new Date().toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })


  constructor(
    @Inject(MAT_DIALOG_DATA) public defaults: GuidesEntPop,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PaymentRecordCreateUpdateComponent>,
    private customerService: CustomerService,
    private addressService: AddressService,
    private guideService: GuidesService,
    private paymentTypeService: PaymentTypeService,
    private snackbar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private mailService: MailService
  ) { }

  ngOnInit(): void {
    let totalDiscount = 0;

    for (const paidInfoElement of this.defaults.paymentBitacora) {
      if (paidInfoElement.discount) {
        totalDiscount += paidInfoElement.discount;
      }
    }

    if (totalDiscount > 0) {
      const discount = Number(totalDiscount).toLocaleString("en", {
        style: "currency",
        currency: "USD",
      });
      this.discountDetails =
        " - (discount) " +
        discount +
        " => " +
        (this.newCost - this.discountAmount).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        });
    }

    this.setCost();
    this.rateCtrl.setValue(
      this.defaults.rateAmount.toLocaleString("en", {
        style: "currency",
        currency: "USD",
      })
    );
    // tslint:disable-next-line:max-line-length
    this.volumenCtrl.setValue(
      this.defaults.finalWeight.toFixed(2) +
      " lb / " +
      this.defaults.finalVlb.toFixed(2) +
      " vlb / " +
      this.defaults.finalVolume.toFixed(2) +
      " ft3"
    );
    let paidInfo = "";
    if (this.defaults.paidAmount > 0) {
      paidInfo =
        " - (paid amount) " +
        this.defaults.paidAmount.toLocaleString("en", {
          style: "currency",
          currency: "USD",
        }) +
        " = " +
        (this.defaults.cost - this.defaults.paidAmount).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        });
    }
    if (this.defaults.name.includes("-AIR-")) {
      this.formula =
        "Cost = " +
        (this.defaults.finalWeight > this.defaults.finalVlb
          ? "Weight * Rate [ " +
          this.defaults.finalWeight +
          " * $" +
          this.defaults.rateAmount +
          " = $" +
          this.defaults.cost +
          "]" +
          paidInfo
          : "Vlb * Rate [ " +
          this.defaults.finalVlb +
          " * $" +
          this.defaults.rateAmount +
          " = $" +
          this.defaults.cost +
          "]" +
          paidInfo);
    } else {
      // tslint:disable-next-line:max-line-length
      this.formula =
        "Cost = Volume * Rate [" +
        this.defaults.finalVolume +
        " * $" +
        this.defaults.rateAmount +
        " = $" +
        this.defaults.cost +
        "]" +
        paidInfo;
    }

    this.customerService
      .getCustomer(this.defaults.customer._id)
      .subscribe((resp) => {
        if (resp.ok) {
          this.balance = resp.data[0].creditBalance[0].balance;
          this.balanceCtrl.setValue(
            this.balance.toLocaleString("en", {
              style: "currency",
              currency: "USD",
            })
          );
          if (this.balance <= 0) {
            this.useBalanceCtrl.disable();
          }
        }
      });

    this.addressService
      .getAddresses(this.defaults.customer)
      .subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.addresses = resp.data;
          if (
            this.addresses.filter((address) => address.type === "2").length > 0
          ) {
            this.billingAddress = this.addresses.filter(
              (address) => address.type === "2"
            )[0];
          } else {
            this.billingAddress = this.addresses.filter(
              (address) => address.isDefault
            )[0];
          }
        }
      });

    this.paymentTypeService
      .getPaymentTypes()
      .subscribe((resp: ServiceResponse) => {
        this.paymentTypes = resp.data.filter(
          (data) => data.type !== "PRE PAYMENT"
        );
        this.filteredPaymentTypes.next(this.paymentTypes.slice());
        this.paymentTypesFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterPaymentTypes();
          });
      });
  }

  paymentTimelineGuide(guide: GuidesEntPop) {
    this.dialog.open(PaymentBitacoraComponent, {
      data: guide._id,
      width: "1000px",
      height: "600px",
    });
  }

  setCost() {
    this.paidAmountCtrl.setValue(
      (this.defaults.cost - this.defaults.paidAmount - this.credit).toFixed(2)
    );
    if (this.defaults.paidAmount) {
      if (this.defaults.paidAmount > 0) {
        this.costCtrl.setValue(
          (
            this.defaults.cost -
            this.defaults.paidAmount -
            this.credit
          ).toLocaleString("en", {
            style: "currency",
            currency: "USD",
          })
        );
      } else {
        this.costCtrl.setValue(
          (this.defaults.cost - this.credit).toLocaleString("en", {
            style: "currency",
            currency: "USD",
          })
        );
      }
    } else {
      this.costCtrl.setValue(
        (this.defaults.cost - this.credit).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })
      );
    }
  }

  useBalance() {
    if (
      this.balance >=
      this.defaults.cost - this.defaults.paidAmount - this.discountAmount
    ) {
      if (this.paymentTypesCtrl.disabled) {
        this.paymentTypesCtrl.enable();
        this.paymentTypesCtrl.setValue("");
        this.paidAmountCtrl.setValue(
          this.defaults.cost - this.defaults.paidAmount - this.discountAmount
        );
        this.fullCredit = false;
      } else {
        this.fullCredit = true;
        const paymentType = this.paymentTypes.filter(
          (packageType) => packageType.type === "CUSTOMER"
        );
        this.paymentTypesCtrl.setValue(paymentType[0]._id);
        this.paymentTypesCtrl.disable();
        this.paidAmountCtrl.setValue(
          this.defaults.cost - this.defaults.paidAmount - this.discountAmount
        );
        this.creditDetails = `, Credit of ${(
          this.defaults.cost -
          this.defaults.paidAmount -
          this.discountAmount
        ).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })} applied to the guide`;
      }
    } else {
      if (this.useBalanceCtrl.value !== true) {
        this.paidAmountCtrl.setValue(
          this.defaults.cost - this.defaults.paidAmount - this.discountAmount
        );
        this.creditDetails = "";
        this.costCtrl.setValue(
          (
            this.defaults.cost -
            this.defaults.paidAmount -
            this.discountAmount
          ).toLocaleString("en", {
            style: "currency",
            currency: "USD",
          })
        );
        this.newCost = this.costCtrl.value;
        this.defaults.paymentBitacora.shift();
        this.credit = 0;
        this.partialCredit = false;
      } else {
        this.partialCredit = true;
        const paymentType = this.paymentTypes.filter(
          (packageType) => packageType.type === "CUSTOMER"
        );
        const guideStatusItem = {
          paymentStatus: "3",
          paymentType: paymentType[0]._id.toString(),
          paidAmount: Number(this.balance),
          discount: 0,
          user: "",
          paymentDate: new Date().toJSON(),
        };
        this.credit = this.balance;
        this.defaults.paymentBitacora.unshift(guideStatusItem);
        this.paidAmountCtrl.setValue(
          this.defaults.cost -
          this.defaults.paidAmount -
          this.balance -
          this.discountAmount
        );
        this.costCtrl.setValue(
          (
            this.defaults.cost -
            this.defaults.paidAmount -
            this.balance -
            this.discountAmount
          ).toLocaleString("en", {
            style: "currency",
            currency: "USD",
          })
        );
        this.creditDetails = `, Credit of ${this.balance.toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })} applied to the guide`;
      }
    }
  }

  clearDiscount() {
    this.discountDetails = "";
    this.percentageDiscountCtrl.setValue("");
    this.amountDiscountCtrl.setValue("");
    this.setCost();
  }

  useDiscount() {
    if (!this.discountCtrl.value) {
      this.discountDetails = "";
      this.costCtrl.setValue(
        (this.defaults.cost - this.credit).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })
      );
      this.paidAmountCtrl.setValue(
        (
          this.defaults.cost -
          this.defaults.paidAmount -
          this.credit
        ).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })
      );
      this.clearDiscount();
    }
  }

  configADiscount() {
    this.newCost = this.defaults.cost;
    this.discountDetails = "";

    if (this.defaults.paidAmount) {
      if (this.defaults.paidAmount > 0) {
        this.newCost = this.newCost - this.defaults.paidAmount;
      }
    }

    if (this.discountTypeCtrl.value === 1) {
      this.discountAmount =
        (this.newCost * this.percentageDiscountCtrl.value) / 100;
      if (this.discountAmount > 0) {
        this.discountDetails =
          " - (discount) (" +
          this.discountAmount.toLocaleString("en", {
            style: "currency",
            currency: "USD",
          }) +
          " <= " +
          this.percentageDiscountCtrl.value +
          "% ) => " +
          (this.newCost - this.discountAmount).toLocaleString("en", {
            style: "currency",
            currency: "USD",
          });
      }
    } else {
      this.discountAmount = this.amountDiscountCtrl.value;
      if (this.discountAmount > 0) {
        const discount = Number(this.discountAmount).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        });
        this.discountDetails =
          " - (discount) " +
          discount +
          " => " +
          (this.newCost - this.discountAmount).toLocaleString("en", {
            style: "currency",
            currency: "USD",
          });
      }
    }

    if (this.discountAmount >= this.newCost) {
      this.clearDiscount();
      Swal.fire(
        "The amount of discount is equal or greater than the cost of the guide, change discount amount to continue...",
        "",
        "info"
      );
    } else {
      this.newCost -= this.discountAmount;
      this.costCtrl.setValue(
        (this.newCost - this.credit).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })
      );
      this.paidAmountCtrl.setValue(
        (this.newCost - this.credit).toLocaleString("en", {
          style: "currency",
          currency: "USD",
        })
      );
    }

    if (this.fullCredit) {
      this.creditDetails = `, Credit of ${this.newCost.toLocaleString("en", {
        style: "currency",
        currency: "USD",
      })} applied to the guide`;
    }
  }

  createDiscount() {
    const guideToUpdate = new GuidesEntPop({});
    const guideStatusItem = {
      paymentStatus: this.defaults.paymentStatus,
      paymentType: this.paymentTypesCtrl.value,
      paidAmount: 0,
      discount: Number(this.discountAmount),
      user: "",
      paymentDate: new Date().toJSON(),
    };
    this.defaults.paymentBitacora.unshift(guideStatusItem);
    guideToUpdate.paymentBitacora = this.defaults.paymentBitacora;
    guideToUpdate._id = this.defaults._id;
    guideToUpdate.paymentStatus = this.defaults.paymentStatus;
    if (this.discountCtrl.value) {
      guideToUpdate.cost = this.newCost;
    }
    this.guideService
      .updateGuide(new GuidesEnt(guideToUpdate))
      .subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.spinner = false;
          this.dialogRef.close(resp.data);
          this.openSnackbar(resp.msg);
        }
      });
  }

  protected filterPaymentTypes() {
    if (!this.paymentTypes) {
      return;
    }
    let search = this.paymentTypesFilterCtrl.value;
    if (!search) {
      this.filteredPaymentTypes.next(this.paymentTypes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredPaymentTypes.next(
      this.paymentTypes.filter(
        (packageType) => packageType.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  submit() {
    this.spinner = true;
    this.paymentTypesCtrl.enable();
    if (
      this.paidAmountCtrl.status !== "VALID" ||
      this.paymentTypesCtrl.status !== "VALID"
    ) {
      this.openSnackbar("Please fill all the required fields");
      this.spinner = false;
      return;
    }
    let cost = Number(this.costCtrl.value.toString().replace("$", "").replace(",", ""));

    if (
      Number(
        this.paidAmountCtrl.value.toString().replace("$", "").replace(",", "")
      ).toFixed(2) > Number(cost.toString().replace("$", "").replace(",", "")).toFixed(2)
    ) {
      this.spinner = false;
      Swal.fire({
        title:
          "You are registering a payment greater than the amount of the invoice, the remaining amount will be credited to the customer's account, do you want to continue?",
        showDenyButton: true,
        confirmButtonText: "Yes!",
        denyButtonText: `No!`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.completeSubmit("5");
        } else if (result.isDenied) {
          this.spinner = false;
          Swal.fire("Change the amount of payment to continue...", "", "info");
        }
      });
    } else if (
      Number(
        this.paidAmountCtrl.value.toString().replace("$", "").replace(",", "")
      ).toFixed(2) <
      Number(cost.toString().replace("$", "").replace(",", "")).toFixed(2)
    ) {
      Swal.fire({
        title:
          "The amount to cancel is less than the invoice, do you want to continue?",
        showDenyButton: true,
        confirmButtonText: "Yes, the payment Status will be PARTIAL PAID",
        denyButtonText: `No!`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.completeSubmit("3");
        } else if (result.isDenied) {
          this.spinner = false;
          Swal.fire("Change the amount of payment to continue...", "", "info");
        }
      });
    } else {
      this.completeSubmit("2");
    }
  }

  completeSubmit(paymentStatus: string) {
    const guideToUpdate = new GuidesEntPop({});
    let totalPaidAmount = 0;

    totalPaidAmount = Number(
      this.paidAmountCtrl.value.toString().replace("$", "").replace(",", "")
    ) + this.defaults.paidAmount;

    if (this.useBalanceCtrl.value) {
      totalPaidAmount += Number(this.balanceCtrl.value.toString().replace("$", "").replace(",", ""));
    }

    guideToUpdate.paidAmount = totalPaidAmount;

    const guideStatusItem = {
      paymentStatus,
      paymentType: this.paymentTypesCtrl.value,
      paidAmount: Number(
        this.paidAmountCtrl.value.toString().replace("$", "").replace(",", "")
      ),
      discount: Number(this.discountAmount),
      user: "",
      paymentDate: new Date().toJSON(),
    };
    this.defaults.paymentBitacora.unshift(guideStatusItem);
    guideToUpdate.paymentBitacora = this.defaults.paymentBitacora;
    guideToUpdate._id = this.defaults._id;
    guideToUpdate.paymentStatus = paymentStatus;
    if (this.discountCtrl.value) {
      guideToUpdate.cost = this.newCost;
    }
    guideToUpdate.partialPaid = this.partialCredit;
    this.guideService
      .updateGuide(new GuidesEnt(guideToUpdate))
      .subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          this.spinner = false;
          this.dialogRef.close(resp.data);
          this.openSnackbar(resp.msg);
          if (this.notificationCtrl) {
            this.sendNotification(resp.data);
          }
        }
      });
  }

  setAddressBook(addresses: Address[]) {
    this.addresses = addresses;
    if (this.addresses.filter((address) => address.type === "2").length > 0) {
      this.billingAddress = this.addresses.filter(
        (address) => address.type === "2"
      )[0];
    } else {
      this.billingAddress = this.addresses.filter(
        (address) => address.isDefault
      )[0];
    }
  }

  reset() { }

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

  openSnackbar(message: string) {
    this.snackbar.open(message, "CLOSE", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  sendNotification(guide: GuidesEntPop) {
    this.urlItem = `${this_url}/#/guide-receipt/${guide._id}`;
    const mail: any = {};
    mail.from = "TLCargo tu servicio de transporte de carga";
    mail.to = guide.customer.email;
    if (adminNotification) {
      mail.bcc = adminEmails;
    }
    mail.subject = "Se ha registrado el pago de la guia " + guide.tlCargoId;
    mail.html =
      mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>Se ha registrado un pago en nuestro sistema!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <h2>Hola ${guide.customer.name
      }!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt"> Gracias por utilizar nuestro servicio de envíos. </p> <p style=" text-align: center; font-size: 10pt; padding-left: 30px; padding-right: 30px; " > Acabamos de registrar un pago asociado a la guia ${guide.tlCargoId
      } </p> </td> </tr> </table> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <br /> <b>Fecha de pago:</b> ${new Date(
        guide.paymentBitacora[0].paymentDate
      ).toLocaleDateString("ve-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })} </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <br /> <b>Monto registrado:</b> ${guide.paidAmount.toLocaleString(
        "en",
        { style: "currency", currency: "USD" }
      )} </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <br /> <b>Tipo de pago:</b> ${this.paymentTypes.filter(
        (row) => row._id.toString() === guide.paymentBitacora[0].paymentType
      )[0].name
      } <br /> <br /> <hr /> </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <p> Descarga el recibo de pago acá: <br /> ${this.urlItem
      } </p> </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <span> <hr /> <h1 style="text-align: center; font-size: 12pt"> Te recordamos que estas son las únicas cuentas autorizadas de TLCARGO </h1> <hr /> <br /> <h2 style="font-size: 10pt">Para depósitos en Bolívares</h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> Banca Amiga</li> <li><b>Numero de Cuenta:</b> 0172 0110 7111 0844 6517</li> <li><b>Titular:</b> Francy Wadskier</li> <li><b>C.I.:</b> V-18857206</li> </ul> <h2 style="font-size: 10pt">Para Pago Movil en Bolívares</h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> Banca Amiga (0172)</li> <li><b>Telefono:</b> 0424-1521758</li> <li><b>C.I.:</b> V-18857206</li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Si no has realizado el pago al momento de recibir este correo electrónico, por favor comunícate con nuestro servicio de atención al cliente para verificar la tasa de cambio. </b> </span> <br /> <hr /> <br /> <h2 style="font-size: 10pt">Para depósitos en Dólares</h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> CITIBANK</li> <li><b>Cuenta:</b> Cheque</li> <li><b>Numero de Cuenta:</b> 9149573200</li> <li><b>Titular:</b> TL CARGO</li> <li><b>ABA:</b> 266086554</li> <li><b>SWIFT:</b> CITIUS33MIA</li> </ul> <h2 style="font-size: 10pt"> Para pago en Dólares mediante ZELLE </h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> CITIBANK</li> <li><b>ZELLE:</b> ZELLE@TLCARGO.NET</li> <li><b>Nombre:</b> (Teleflex Group Inc o Alvaro Abreu)</li> <li><b>Por favor colocar numero de Invoice en memo</b></li> </ul> <h2 style="font-size: 10pt"> Para pago en Dólares mediante PAYPAL </h2> <ul style="font-size: 8pt"> <li><b>Email:</b> paypal@TLCargo.net</li> <li> <b >Verificar si su cuenta cobra un Fee por pagar debe agregarlo para que llegue el pago completo</b > </li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Los pagos recibidos a través de transferencias (Wire) de otros bancos americanos tendrán un cargo extra de $15.00, esto no aplica para Zelle. </b> </span> </span> </td> </tr> <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> ¡Gracias por preferirnos! <br /> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;

    this.mailService.sendHTML(mail).subscribe((resp: any) => {
      this.openSnackbar("Customer notified Correctly!!");
    });
    if (adminNotification) {
      for (const admin of adminEmails) {
        const adminMail: any = {};
        adminMail.from = "TLCargo tu servicio de transporte de carga";
        adminMail.to = admin;
        adminMail.subject =
          "Se ha registrado el pago en la guia: " + guide.tlCargoId;
        adminMail.html =
          mail.html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="en"> <head> <link rel="stylesheet" type="text/css" hs-webfonts="true" href="https://fonts.googleapis.com/css?family=Lato|Lato:i,b,bi" /> <title>Sistema de notificación de TLCARGO</title> <meta property="og:title" content="Email template" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style type="text/css"> .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid { font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #85c1e9; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; } .datagrid table td, .datagrid table th { padding: 3px 10px; } .datagrid table thead th { background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #85c1e9), color-stop(1, #6998b8) ); background: -moz-linear-gradient(center top, #85c1e9 5%, #6998b8 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#85C1E9', endColorstr='#6998B8'); background-color: #85c1e9; color: #ffffff; font-size: 12px; font-weight: bold; border-left: 1px solid #0070a8; } .datagrid table thead th:first-child { border: none; } .datagrid table tbody td { color: #00496b; font-size: 11px; font-weight: normal; } .datagrid table tbody .alt td { background: #e1eef4; color: #00496b; } .datagrid table tbody td:first-child { border-left: none; } .datagrid table tbody tr:last-child td { border-bottom: none; } a.button { -webkit-appearance: button; -moz-appearance: button; appearance: auto; text-decoration: none; color: initial; } h1 { font-size: 56px; } h2 { font-size: 28px; font-weight: 900; } p { font-weight: 100; } td { vertical-align: top; } #email { margin: auto; width: 600px; background-color: white; } button { font: inherit; background-color: #ff7a59; border: none; padding: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; color: white; border-radius: 5px; box-shadow: 3px 3px #d94c53; } .subtle-link { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #cbd6e2; } </style> </head> <body bgcolor="#F5F8FA" style=" width: 100%; margin: auto 0; padding: 0; font-family: Lato, sans-serif; font-size: 18px; color: #33475b; word-break: break-word; " > <! View in Browser Link --> <div id="email"> <table cellpadding="0" cellspacing="0" role="presentation" width="100%"> <tr> <td bgcolor="white" align="center" style="color: black"> <br /> <img alt="TLCARGO" src="${this_url}/assets/img/tlcargo/tl_cargo_3.png" width="150px" align="middle" /> <h2>Se ha registrado un pago en nuestro sistema!</h2> </td> </tr> <tr> <td bgcolor="#85C1E9" align="center" style="color: white"> <h2>Hola ${guide.customer.name
          }!</h2> </td> </tr> <tr> <td> <p style="text-align: center; font-size: 14pt"> Gracias por utilizar nuestro servicio de envíos. </p> <p style=" text-align: center; font-size: 10pt; padding-left: 30px; padding-right: 30px; " > Acabamos de registrar un pago asociado a la guia ${guide.tlCargoId
          } </p> </td> </tr> </table> <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="text-align: center" width="100%" > <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <br /> <b>Fecha de pago:</b> ${new Date(
            guide.paymentBitacora[0].paymentDate
          ).toLocaleDateString("ve-ES", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })} </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <br /> <b>Monto registrado:</b> ${guide.paidAmount.toLocaleString(
            "en",
            { style: "currency", currency: "USD" }
          )} </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <br /> <b>Tipo de pago:</b> ${this.paymentTypes.filter(
            (row) =>
              row._id.toString() === guide.paymentBitacora[0].paymentType
          )[0].name
          } <br /> <br /> <hr /> </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <p> Descarga el recibo de pago acá: <br /> ${this.urlItem
          } </p> </td> </tr> <tr> <td style=" text-align: left; font-size: 9pt; padding-left: 30px; padding-right: 30px; " > <span> <hr /> <h1 style="text-align: center; font-size: 12pt"> Te recordamos que estas son las únicas cuentas autorizadas de TLCARGO </h1> <hr /> <br /> <h2 style="font-size: 10pt">Para depósitos en Bolívares</h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> Banca Amiga</li> <li><b>Numero de Cuenta:</b> 0172 0110 7111 0844 6517</li> <li><b>Titular:</b> Francy Wadskier</li> <li><b>C.I.:</b> V-18857206</li> </ul> <h2 style="font-size: 10pt">Para Pago Movil en Bolívares</h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> Banca Amiga (0172)</li> <li><b>Telefono:</b> 0424-1521758</li> <li><b>C.I.:</b> V-18857206</li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Si no has realizado el pago al momento de recibir este correo electrónico, por favor comunícate con nuestro servicio de atención al cliente para verificar la tasa de cambio. </b> </span> <br /> <hr /> <br /> <h2 style="font-size: 10pt">Para depósitos en Dólares</h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> CITIBANK</li> <li><b>Cuenta:</b> Cheque</li> <li><b>Numero de Cuenta:</b> 9149573200</li> <li><b>Titular:</b> TL CARGO</li> <li><b>ABA:</b> 266086554</li> <li><b>SWIFT:</b> CITIUS33MIA</li> </ul> <h2 style="font-size: 10pt"> Para pago en Dólares mediante ZELLE </h2> <ul style="font-size: 8pt"> <li><b>Banco:</b> CITIBANK</li> <li><b>ZELLE:</b> ZELLE@TLCARGO.NET</li> <li><b>Nombre:</b> (Teleflex Group Inc o Alvaro Abreu)</li> <li><b>Por favor colocar numero de Invoice en memo</b></li> </ul> <h2 style="font-size: 10pt"> Para pago en Dólares mediante PAYPAL </h2> <ul style="font-size: 8pt"> <li><b>Email:</b> paypal@TLCargo.net</li> <li> <b >Verificar si su cuenta cobra un Fee por pagar debe agregarlo para que llegue el pago completo</b > </li> </ul> <span style="text-align: center; font-size: 10pt; color: #d94c53"> <b> Nota: Los pagos recibidos a través de transferencias (Wire) de otros bancos americanos tendrán un cargo extra de $15.00, esto no aplica para Zelle. </b> </span> </span> </td> </tr> <tr> <td style=" text-align: center; background-color: #85c1e9; font-size: larger; " > <br /> ¡Gracias por preferirnos! <br /> <a href="https://www.tlcargo.net">www.tlcargo.net</a> </td> </tr> <tr> <td style="text-align: left; background-color: #85c1e9"> <ul style="font-size: 6pt"> <li><b>TL CARGO</b></li> <li><b>Dir:</b> 8520 NW 66 ST Miami, FL 33166</li> <li> <b>Web:</b><a href="https://www.tlcargo.net">www.tlcargo.net</a> </li> <li><b>Telefono:</b> +1-786-409-708</li> <li> <b>Servicio al Cliente Directo Venezuela:</b> 0212-720 4488 </li> </ul> </td> </tr> <tr> <td style="text-align: center; background-color: #85c1e9"> <a style="text-decoration: none" href="https://wa.link/knntyd"> <img src="${this_url}/assets/img/icons/logos/WS_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.facebook.com/TLCARGOmiami/" > <img src="${this_url}/assets/img/icons/logos/FB_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://twitter.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/X_W.png" width="30px" height="30px" /> </a> &nbsp; <a style="text-decoration: none" href="https://www.instagram.com/tlcargomiami/" > <img src="${this_url}/assets/img/icons/logos/IG_W.png" width="30px" height="30px" /> </a> </td> </tr> </table> <table bgcolor="#5DADE2" width="100%"> <tr> <td align="left" style="padding: 15px"> <p style="color: white; text-align: center"> Made with <span style="color: #d94c53">&hearts;</span> at DogHoundTechnology </p> </td> </tr> </table> </div> </body></html>`;

        this.mailService.sendHTML(adminMail).subscribe((resp: any) => { });
      }
    }
  }
}
