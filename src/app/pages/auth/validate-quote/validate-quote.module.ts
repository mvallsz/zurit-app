import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ValidateQuoteRoutingModule } from "./validate-quote-routing.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { ValidateQuoteComponent } from "./validate-quote.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { NgxSpinnerModule } from "ngx-spinner";

@NgModule({
  declarations: [ValidateQuoteComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatButtonModule,
    ValidateQuoteRoutingModule,
    NgxSpinnerModule
  ],
})
export class ValidateQuoteModule { }
