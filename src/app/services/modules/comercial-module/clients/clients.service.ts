import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ServiceResponse } from 'src/app/pages/interfaces/service-response.interface';
import { Client, IClient } from 'src/app/pages/comercial-module/sub-modules/clients/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getClientsPag(pageNumber: Number, pageSize: Number, filter: string, filterOptions?: any): Observable<ServiceResponse> {
    let params = new HttpParams()
      .set('page', pageNumber.toString())
      .set('limit', pageSize.toString());

    if (filter) {
      params = params.set('filter', filter);
    }

    if (filterOptions) {
      Object.keys(filterOptions).forEach(key => {
        params = params.set(key, filterOptions[key]);
      });
    }

    return this.http.get<ServiceResponse>(`${this.apiUrl}/clients`, { params });
  }

  getClient(id: string): Observable<IClient> {
    return this.http.get<IClient>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(client: IClient): Observable<IClient> {
    return this.http.post<IClient>(`${this.apiUrl}/clients`, client);
  }

  updateClient(id: string, client: IClient): Observable<IClient> {
    return this.http.put<IClient>(`${this.apiUrl}/clients/${id}`, client);
  }

  disableClient(id: string): Observable<ServiceResponse> {
    return this.http.delete<ServiceResponse>(`${this.apiUrl}/clients/${id}`);
  }
}
