import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { GuidesEntPop } from "../pages/outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model";
import { GuidesEnt } from "../pages/outgoingShippingModules/shipping-guides/interfaces/guides-ent.model";
import { ServiceResponse } from "../interfaces/service-response.interface";

const base_url = environment.base_url;

@Injectable({
  providedIn: "root",
})
export class GuidesService {
  constructor(private http: HttpClient) { }

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

  getGuides(from: Number, limit: Number, filter: string, quote: boolean) {
    filter += '&quote=' + quote;
    const url = `${base_url}/guides/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getGuidesPag(
    from: Number,
    limit: Number,
    filter: string,
    filterOptions: any,
    quote: boolean
  ) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    filter += '&quote=' + quote;
    const url = `${base_url}/guides/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getGuidetoInvoice(id: string) {
    const url = `${base_url}/guides/toInvoice/${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getGuide(id: string) {
    const url = `${base_url}/guides/?_id=${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getPackagesByGuideId(_id: string) {
    const url = `${base_url}/guides/packages/?_id=${_id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getGuideStatusPackages(_id: string) {
    const url = `${base_url}/guides/statusPackages/${_id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getPackagesByShippingId(shipping: string) {
    const url = `${base_url}/guides/packages/?shipping=${shipping}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getPopGuideByShippingId(shipping: string) {
    const url = `${base_url}/guides/?shipping=${shipping}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createGuide(formData: GuidesEnt) {
    const url = `${base_url}/guides`;
    return this.http.post(url, formData, this.headers);
  }

  updateGuide(formData: any) {
    const url = `${base_url}/guides/${formData._id}`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  qToGuide(formData: GuidesEnt) {
    const url = `${base_url}/guides/q-to-guide/${formData._id}`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deleteGuide(formData: GuidesEntPop) {
    const url = `${base_url}/guides/${formData._id}`;
    return this.http.delete(url, this.headers);
  }
}
