import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PaymentType } from '../pages/accountingModules/payment-types-registry/interfaces/payment-type.model';
import { ServiceResponse } from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class PaymentTypeService {

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

  getPaymentTypes(){
    const url = `${ base_url }/paymentType`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getPaymentType(id: string){
    const url = `${ base_url }/paymentType/?_id=${ id }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createPaymentType(formData: PaymentType){
    const url = `${ base_url }/paymentType`;
    return this.http.post<ServiceResponse>(url, formData, this.headers);
  }

  updatePaymentType(formData: PaymentType){
    const url = `${ base_url }/paymentType/${ formData._id }`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deletePaymentType(formData: PaymentType){
    const url = `${ base_url }/paymentType/${ formData._id }`;
    return this.http.delete(url, this.headers);
  }

}
