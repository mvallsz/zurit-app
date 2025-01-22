import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Carrier} from '../pages/adminModules/curriers-registry/interfaces/carrier.model';
import {ServiceResponse} from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CarrierService {

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

  getCarriers(){
    const url = `${ base_url }/carriers/?carrierMode=1`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getCarrierById(_id){
    const url = `${ base_url }/carriers/?_id=${_id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getOutgoingCarriers(){
    const url = `${ base_url }/carriers/?carrierType=1&carrierMode=1`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getIncomingCarriers(){
    const url = `${ base_url }/carriers/?carrierType=2&carrierMode=1`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }
  createCarriers(formData: Carrier){
    const url = `${ base_url }/carriers`;
    return this.http.post<ServiceResponse>(url, formData, this.headers);
  }

  updateCarriers(formData: Carrier){
    const url = `${ base_url }/carriers/${ formData._id }`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deleteCarriers(formData: Carrier){
    const url = `${ base_url }/carriers/${ formData._id }`;
    return this.http.delete<ServiceResponse>(url, this.headers);
  }
}
