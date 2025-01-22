import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

import { ShippingEnt } from "../pages/outgoingShippingModules/shipping-registry/interfaces/shipping.model";
import { ServiceResponse } from "../interfaces/service-response.interface";

const base_url = environment.base_url;

@Injectable({
  providedIn: "root",
})
export class ShippingService {
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

  getShips() {
    const url = `${base_url}/ships`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getShipsPag(from: Number, limit: Number, filter: string, filterOptions: any) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${base_url}/ships/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getShipsByStatus(status: string) {
    const url = `${base_url}/ships/?status=${status}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getShippingById(id: string) {
    const url = `${base_url}/ships/?_id=${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createShipping(formData: ShippingEnt) {
    const url = `${base_url}/ships`;
    return this.http.post(url, formData, this.headers);
  }

  getShippingGuidesAndPackageList(shippingId: string) {
    const url = `${base_url}/ships/packages/${shippingId}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }
  updateShipping(formData: ShippingEnt) {
    const url = `${base_url}/ships/${formData._id}`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deleteShipping(formData: ShippingEnt) {
    const url = `${base_url}/ships/${formData._id}`;
    return this.http.delete(url, this.headers);
  }
}
