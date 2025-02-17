import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Client, IClient } from '../../../../pages/comercial-module/sub-modules/clients/models/client.model';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private apiUrl = `${base_url}/clients`;

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }


  getClientsPag(pageNumber: Number, pageSize: Number, filter: string, filterOptions?: any): Observable<ServiceResponse> {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    return this.http.get<ServiceResponse>(`${this.apiUrl}/?from=${pageNumber}&limit=${pageSize}&${filter}`, this.headers);
  }

  getClient(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }


  getItemTypeById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }

  createClient(client: IClient): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(`${this.apiUrl}`, client, this.headers);
  }

  updateClient(id: string, client: IClient): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, client, this.headers);
  }

  disableClient(id: string): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}/disable`, null, this.headers);
  }
}
