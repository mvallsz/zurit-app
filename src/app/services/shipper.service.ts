import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Shipper } from '../pages/adminModules/shipper-registry/interfaces/shipper.model';
import {ServiceResponse} from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ShipperService {

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

  getShippers(){
    const url = `${ base_url }/shippers`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createShipper(formData: Shipper){
    const url = `${ base_url }/shippers`;
    return this.http.post(url, formData, this.headers);
  }

  updateShipper(formData: Shipper){
    const url = `${ base_url }/shippers/${ formData._id }`;
    return this.http.put(url, formData, this.headers);
  }

  deleteShipper(formData: Shipper){
    const url = `${ base_url }/shippers/${ formData._id }`;
    return this.http.delete(url, this.headers);
  }
}
