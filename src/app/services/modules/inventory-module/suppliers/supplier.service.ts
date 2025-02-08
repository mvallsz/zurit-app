import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ISupplier, Supplier } from '../../../../pages/inventory-module/sub-modules/suppliers/models/supplier.model';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${base_url}/suppliers`;

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }

  getSuppliersPag(
    from: Number,
    limit: Number,
    filter: string,
    filterOptions: any
  ) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${this.apiUrl}?from=${from}&limit=${limit}&${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getSuppliers(filter: string,
    filterOptions: any
  ) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${this.apiUrl}/?${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }


  getSupplierById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }

  createSupplier(supplier: ISupplier): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.apiUrl, supplier, this.headers);
  }

  updateSupplier(id: string, supplier: ISupplier): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, supplier, this.headers);
  }

  disableSupplier(id: string): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(`${this.apiUrl}/${id}/disable`, {}, this.headers);
  }

  deleteSupplier(id: string): Observable<ServiceResponse> {
    return this.http.delete<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }
}
