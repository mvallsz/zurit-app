import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IIncome, Income } from 'src/app/pages/admin-module/sub-modules/incomes/models/income.model';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private apiUrl = `${base_url}/incomes`;

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }

  getIncomes(limit: number = 10, skip: number = 0, query: string = ''): Observable<ServiceResponse> {
    const url = `${this.apiUrl}?limit=${limit}&skip=${skip}&q=${query}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getIncomeById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }

  createIncome(income: IIncome): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.apiUrl, income, this.headers);
  }

  updateIncome(id: string, income: IIncome): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, income, this.headers);
  }

  changeIncomeStatus(id: string, status: number): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(`${this.apiUrl}/${id}/change-status`, { estado: status }, this.headers);
  }

  disableIncome(id: string): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(`${this.apiUrl}/${id}/disable`, {}, this.headers);
  }

  deleteIncome(id: string): Observable<ServiceResponse> {
    return this.http.delete<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }
}
