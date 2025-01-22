import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../environments/environment';

import { Customer } from '../pages/warehousingModules/customers-registry/interfaces/customer.model';
import {ServiceResponse} from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

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

  getCustomers(){
    const url = `${ base_url }/customers/`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }
  
  getCustomersPag(from: Number, limit: Number, filter: string, filterOptions: any){

    filter += `&filterOptions=${ JSON.stringify(filterOptions)}`;
    
    const url = `${ base_url }/customers/?from=${ from }&limit=${ limit }${ filter }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getCustomer(_id: string){
    const url = `${ base_url }/customers/?_id=${ _id }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getCustomersLite(query: string){
    
    const filterOptions = {
      multiple: true,
      autoComplete: true
    }
    
    const filter = `&filterOptions=${ JSON.stringify(filterOptions)}`;

    const url = `${ base_url }/customers/lite/?${ query } ${ filter }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createCustomer(formData: Customer){
    const url = `${ base_url }/customers`;
    return this.http.post(url, formData, this.headers);
  }

  createCustomerIntra(formData: Customer){
    const url = `${ base_url }/customers/intra`;
    return this.http.post(url, formData);
  }

  updateCustomer(formData: Customer){
    const url = `${ base_url }/customers/${ formData._id }`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deleteCustomer(formData: Customer){
    const url = `${ base_url }/customers/${ formData._id }`;
    return this.http.delete(url, this.headers);
  }
}
