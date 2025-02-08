import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IItem, Item } from '../../../../pages/inventory-module/sub-modules/items/models/item.model';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';
import { ItemType } from '../../../../pages/inventory-module/sub-modules/item-types/models/itemType.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${base_url}/items`;

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }

  getItemsPag(
    from: Number,
    limit: Number,
    filter: string,
    filterOptions: any
  ) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${this.apiUrl}?from=${from}&limit=${limit}&${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getItems(filter: string,
    filterOptions: any
  ) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${this.apiUrl}/?${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getItemById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/?_id=${id}`, this.headers);
  }

  createItem(item: IItem): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.apiUrl, item, this.headers);
  }

  updateItem(id: string, item: Item): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, item, this.headers);
  }

  updateStock(id: string, action: string, quantity: number): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}/stock`, { action, quantity }, this.headers);
  }

  disableItem(id: string): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}/disable`, {}, this.headers);
  }

  deleteItem(id: string): Observable<ServiceResponse> {
    return this.http.delete<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }


  addStock(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/add-stock`, item);
  }
}
