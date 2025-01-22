import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Address } from '../pages/warehousingModules/customers-registry/interfaces/address.model';
import { AddressInterface } from '../interfaces/address-data-table.interface';
import { Customer } from '../pages/warehousingModules/customers-registry/interfaces/customer.model';
import {WarehouseItemFull} from '../pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor( private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    };
  }

  sendHTML(formData: any){

    const url = `${ base_url }/mail/sendHTML`;
    return this.http.post(url, formData, this.headers);
  }

  sendHTMLCreate(formData: any){

    const url = `${ base_url }/mail/sendHTMLCreate`;
    return this.http.post(url, formData, this.headers);
  }


}
