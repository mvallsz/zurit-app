import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IExpense, Expense } from 'src/app/pages/admin-module/sub-modules/expenses/models/expense.model';
import { ServiceResponse } from 'src/app/interfaces/service-response.interface';

const base_url = environment.base_url;


@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${base_url}/expenses`;

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }

  getExpenses(limit: number = 10, skip: number = 0, query: string = ''): Observable<ServiceResponse> {
    const url = `${this.apiUrl}?limit=${limit}&skip=${skip}&q=${query}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getExpenseById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }

  createExpense(expense: IExpense): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.apiUrl, expense, this.headers);
  }

  updateExpense(id: string, expense: IExpense): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, expense, this.headers);
  }

  changeExpenseStatus(id: string, status: number): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(`${this.apiUrl}/${id}/change-status`, { estado: status }, this.headers);
  }

  disableExpense(id: string): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(`${this.apiUrl}/${id}/disable`, {}, this.headers);
  }

  deleteExpense(id: string): Observable<ServiceResponse> {
    return this.http.delete<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }
}
