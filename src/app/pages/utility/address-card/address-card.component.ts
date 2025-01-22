import {
  Component,
  Input,
  OnInit,
  OnChanges,
  AfterViewInit,
  ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';

import {Address} from '../../warehousingModules/customers-registry/interfaces/address.model';
import {FormControl} from '@angular/forms';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import {fadeInUp400ms} from '../../../../@vex/animations/fade-in-up.animation';
import {stagger40ms} from '../../../../@vex/animations/stagger.animation';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions} from '@angular/material/form-field';
import {Customer} from '../../warehousingModules/customers-registry/interfaces/customer.model';
import {AddressRegistryComponent} from '../../warehousingModules/customers-registry/address-registry/address-registry.component';
import {MatDialog} from '@angular/material/dialog';
import icEditLocation from '@iconify/icons-ic/twotone-edit-location';
import {AddressService} from '../../../services/address.service';

@Component({
  selector: 'vex-address-card',
  templateUrl: './address-card.component.html',
  styleUrls: ['./address-card.component.scss'],
  animations: [
    fadeInUp400ms,
    stagger40ms
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'standard'
      } as MatFormFieldDefaultOptions
    }
  ]
})

export class AddressCardComponent implements OnInit, OnChanges, AfterViewInit {

  icMoreHoriz = icMoreHoriz;
  icEditLocation = icEditLocation;

  layoutCtrl = new FormControl('boxed');
  isDefault = false;
  printableAddressType = '';
  @Input() public address: Address;
  @Input() public customer: Customer;
  @Output() addresses: EventEmitter<Address[]> = new EventEmitter<Address[]>();

  constructor(private cd: ChangeDetectorRef,
              private dialog: MatDialog,
              private addressService: AddressService) {}

  ngOnInit(){
   }

  ngOnChanges() {
    if (this.address){
      if (this.address.isDefault) {
        this.isDefault = true;
      }

      switch (this.address.type) {
        case '0':
          this.printableAddressType = 'Main';
          break;
        case '1':
          this.printableAddressType = 'Shipping';
          break;
        case '2':
          this.printableAddressType = 'Billing';
          break;
        case '3':
          this.printableAddressType = 'Personal';
          break;
      }
    }
  }

  ngAfterViewInit() {
  }

  showAddresses() {

    this.dialog.open(AddressRegistryComponent, {
      data: this.customer
    }).afterClosed().subscribe(updatedAddress => {
      this.addressService.getAddresses(this.customer).subscribe(( resp ) => {

        switch (this.address.type) {
          case '1': // shipping
            this.address = resp.data.filter(address => address.isDefault)[0];
            break;
          case '2': // billing
            this.address = resp.data.filter(address => address.type === '2')[0];
            if (!this.address) {
              this.isDefault = true;
              this.address = resp.data.filter(address => address.isDefault)[0];
            }
            break;
        }
        this.addresses.emit(resp.data);
        this.cd.detectChanges();
      });
    });
  }

  oneLineAddress(){
    const addressToShow = (this.address.address + ', ') + (this.address.address2 ? this.address.address2 + ', ' : '-, ') + (this.address.city);
    return addressToShow;
  }
}
