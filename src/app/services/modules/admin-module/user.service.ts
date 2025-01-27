import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RegisterForm } from "../../../interfaces/register-form.interface";
import { environment } from "../../../../environments/environment";
import { LoginForm } from "../../../interfaces/login-form.interface";
import { catchError, map, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { User, IUser } from "../../../pages/admin-module/sub-modules/users/models/users.model";
import { NavigationService } from "../../../../@vex/services/navigation.service";
import { ServiceResponse } from "../../../interfaces/service-response.interface";

const base_url = environment.base_url;
@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  public usuario: User;
  constructor(
    private http: HttpClient,
    private navigationService: NavigationService
  ) { }

  get token(): string {
    return localStorage.getItem("token") || "";
  }

  get headers() {
    return {
      headers: {
        "x-token": this.token,
      },
    };
  }

  crearUser(formData: any) {
    return this.http.post<ServiceResponse>(`${base_url}/users`, formData, this.headers);
  }

  updateUser(formData: any) {
    const url = `${base_url}/users/${formData.get('_id')}`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  getUsers(from: Number, limit: Number, filter: string, filterOptions: any) {

    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;

    const url = `${base_url}/users/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getUsersByRole(formData: RegisterForm) {
    const url = `${base_url}/users/?role=${formData.role}`;
    return this.http.get<any>(url, this.headers);
  }

  getRoles() {
    const url = `${base_url}/roles`;
    return this.http.get<any>(url, this.headers);
  }

  getUserByEmail(formData: RegisterForm) {
    const url = `${base_url}/users/?email=${formData.email}`;
    return this.http.get<any>(url, this.headers);
  }

  getUserById(id: string) {
    const url = `${base_url}/users/?_id=${id}`;
    return this.http.get<any>(url, this.headers);
  }

  deleteUser(formData: User) {
    const url = `${base_url}/users/disable/${formData._id}`;
    return this.http.delete(url, this.headers);
  }


  actualizarPassword(formData: any) {
    const url = `${base_url}/users/${formData._id}/password`;
    return this.http.put(url, formData, this.headers);
  }

  // TO-DO CAMBIO A VALIDAR TOKEN
  validarUser(token: string) {
    return this.http.get(`${base_url}/users/validation/${token}`);
  }

  validarEmail(email: string) {
    return this.http.get(`${base_url}/users/email-validation/email/${email}`);
  }

  activarUser(token: string) {
    return this.http.get(`${base_url}/users/activation/${token}`);
  }

  login(formData: LoginForm) {
    return this.http.post(`${base_url}/auth/login`, formData).pipe(
      tap((resp: any) => {
        localStorage.removeItem("menu");
        localStorage.setItem("token", resp.token);
        localStorage.setItem("menu", JSON.stringify(resp.data.menu));
      }),
      catchError((resp) => {
        if (resp.status === 0) {
          return of({
            ok: false,
            msg: resp.statusText + ", please contact Support",
          });
        } else {
          return of({ ok: false, msg: resp.error.msg });
        }
      })
    );
  }

  getRoleMenu(role: string) {
    const url = `${base_url}/menu/?role=${role}`;
    return this.http.get<any>(url, this.headers);
  }

  getEmailToken(formData: string) {
    const url = `${base_url}/login/reset-password/?email=${formData}`;
    return this.http.post(url, formData);
  }

  saveToken(formData: any) {
    const url = `${base_url}/login/is-temp/?email=${formData.email}&token=${formData.token}&status=${formData.status}`;
    return this.http.post(url, formData);
  }

  checkToken(token: string) {
    return this.http.get(`${base_url}/login/check-token/${token}`);
  }

  validarToken(): Observable<boolean> {
    const token = localStorage.getItem("token") || "";

    return this.http
      .get(`${base_url}/auth/session/renew`, {
        headers: {
          "x-token": token,
        },
      })
      .pipe(
        tap((resp: any) => {
          const { name, email, avatar, estado, role, _id } = resp.data.user;
          this.usuario = new User(
            {
              name,
              email,
              estado,
              role,
              _id,
            }
          );

          localStorage.removeItem("menu");
          localStorage.setItem("token", resp.token);
          localStorage.setItem("menu", JSON.stringify(resp.data.menu));
        }),
        map((resp) => true),
        catchError((error) => {
          console.log(error);
          localStorage.removeItem("token");
          localStorage.removeItem("menu");
          return of(false);
        })
      );
  }

  logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("menu");
  }
}
