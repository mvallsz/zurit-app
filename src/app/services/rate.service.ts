import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Rate} from '../pages/adminModules/rate-registry/interfaces/rate.model';
import {ServiceResponse} from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class RateService {

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

  getRates(){
    const url = `${ base_url }/rates`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getRateByDefault(){
    const url = `${ base_url }/rates/?isDefault=true`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getRateByType(type: string){
    const url = `${ base_url }/rates/?type=${ type }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getRateByCity(cityName: string){
    const url = `${ base_url }/rates/?cityName=${ cityName }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createRates(formData: Rate){
    const url = `${ base_url }/rates`;
    return this.http.post(url, formData, this.headers);
  }

  updateRates(formData: Rate){
    const url = `${ base_url }/rates/${ formData._id }`;
    return this.http.put(url, formData, this.headers);
  }

  setDefault(formData: Rate){
    const url = `${ base_url }/rates/setDefault/${ formData.type }/${ formData._id }`;
    return this.http.put(url, formData, this.headers);
  }

  deleteRates(formData: Rate){
    const url = `${ base_url }/rates/${ formData._id }`;
    return this.http.delete(url, this.headers);
  }
}
