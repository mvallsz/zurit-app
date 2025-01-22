import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PackageType } from '../pages/adminModules/package-type-registry/interfaces/package-type.model';
import { ServiceResponse } from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class PackageTypeService {

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

  getPackageType(){
    const url = `${ base_url }/package-type`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getPackageTypeByName(name: string){
    const url = `${ base_url }/package-type/?name=${ name }`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createPackageType(formData: PackageType){
    const url = `${ base_url }/package-type`;
    return this.http.post<ServiceResponse>(url, formData, this.headers);
  }

  updatePackageType(formData: PackageType){
    const url = `${ base_url }/package-type/${ formData._id }`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deletePackageType(formData: PackageType){
    const url = `${ base_url }/package-type/${ formData._id }`;
    return this.http.delete(url, this.headers);
  }

}
