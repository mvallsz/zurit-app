import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { FaqComponent } from "./faq.component";
import { FaqRoutingComponent } from "./faq-routing.component";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [FaqComponent],
  imports: [
    CommonModule,
    RouterModule,
    FaqRoutingComponent,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ]
})
export class FaqModule { }
