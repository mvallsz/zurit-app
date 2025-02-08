import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemType } from '../../../../pages/inventory-module/sub-modules/item-types/models/itemType.model';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ItemTypeService {

  private apiUrl = `${base_url}/item-types`;

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }

  getItemTypesPag(pageNumber: Number, pageSize: Number, filter: string, filterOptions: any): Observable<ServiceResponse> {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    return this.http.get<ServiceResponse>(`${this.apiUrl}/?page=${pageNumber}&limit=${pageSize}&${filter}`, this.headers);
  }

  getItemTypeById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/?_id=${id}`, this.headers);
  }

  getItemTypes(filter: string,
    filterOptions: any
  ) {
    filter = filter === '' ? `?filterOptions=${JSON.stringify(filterOptions)}` : `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${this.apiUrl}/?${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createItemType(itemType: ItemType): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(`${this.apiUrl}`, itemType, this.headers);
  }

  updateItemType(id: string, item: ItemType): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, item, this.headers);
  }


  deleteItemType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.headers);
  }

  disableItemType(id: string): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}/disable`, {}, this.headers);
  }
}
