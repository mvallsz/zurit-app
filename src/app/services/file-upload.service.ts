import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { createLogErrorHandler } from '@angular/compiler-cli/ngcc/src/execution/tasks/completion';
import { Observable } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  async photoUpdate(
    archivo: File,
    tipo: 'packages' | 'users' | 'guides' | 'signatures' | 'invoices',
    id: string
  ) {
    try {
      const url = `${base_url}/uploads/${tipo}/${id}`;
      const formData = new FormData();
      formData.append('file', archivo);

      const resp = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-token': localStorage.getItem('token') || ''
        },
        body: formData
      });
      const data = await resp.json();
      return data;
    } catch (e) {
      console.log(e);
      return { ok: false, msg: e, pathToFront: '' };
    }
  }

  getFile(type: string, fileName: string) {
    const url = `${base_url}/uploads/${type}/${fileName}`;
    return this.http.get<any>(url);
  }

  getImage(imagePath: string, type: string): Observable<Blob> {
    return this.http.get(`${base_url}/files/${type}/${imagePath}`, { responseType: 'blob' });
  }

  getNoImage(): Observable<Blob> {
    return this.http.get(`${base_url}/files/`, { responseType: 'blob' });
  }
}
