import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceResponse } from '../../../../interfaces/service-response.interface';
import { environment } from 'src/environments/environment';
import { IProject } from '../../../../pages/comercial-module/sub-modules/projects/models/project.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = `${base_url}/projects`;  // Adjust the endpoint

  constructor(private http: HttpClient) { }

  private get headers() {
    return {
      headers: {
        'x-token': localStorage.getItem('token')
      }
    };
  }

  getProjects(filter: string = '', options: any = {}): Observable<ServiceResponse> {
    let params = new HttpParams();
    if (filter) {
      params = params.set('filter', filter);
    }
    if (options.multiple) {
      params = params.set('multiple', options.multiple);
    }
    if (options.autoComplete) {
      params = params.set('autocomplete', options.autoComplete);
    }

    return this.http.get<ServiceResponse>(this.apiUrl, { params });
  }

  getProjectsPag(pageNumber: Number, pageSize: Number, filter: string = '', filterOptions?: any): Observable<ServiceResponse> {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    return this.http.get<ServiceResponse>(`${this.apiUrl}/?from=${pageNumber}&limit=${pageSize}&${filter}`, this.headers);
  }

  getProjectById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.apiUrl}/${id}`, this.headers);
  }

  createProject(project: IProject): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(`${this.apiUrl}`, project, this.headers);
  }

  updateProject(id: string, project: IProject): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}`, project, this.headers);
  }

  disableProject(id: string): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.apiUrl}/${id}/disable`, null, this.headers);
  }
}
