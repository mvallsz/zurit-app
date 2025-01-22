import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Warehouse } from '../pages/adminModules/warehouse-location-registry/interfaces/warehouse.model';
import { ServiceResponse } from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class WarehouseLocationService {

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

  getWarehouse(){
    const url = `${ base_url }/warehouse-location`;
    return this.http.get<ServiceResponse>(url, this.headers).pipe(
      tap(
        (resp) => { }
      ), catchError(error => {
         return of(false);
      }));
  }

  createWarehouse(formData: Warehouse){
    const url = `${ base_url }/warehouse-location`;
    return this.http.post(url, formData, this.headers);
  }

  updateWarehouse(formData: Warehouse){
    const url = `${ base_url }/warehouse-location/${ formData._id }`;
    return this.http.put(url, formData, this.headers);
  }

  deleteWarehouse(formData: Warehouse){
    const url = `${ base_url }/warehouse-location/${ formData._id }`;
    return this.http.delete(url, this.headers);
  }
}
