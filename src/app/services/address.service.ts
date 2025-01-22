import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../environments/environment";

import { Address } from "../pages/warehousingModules/customers-registry/interfaces/address.model";
import { Customer } from "../pages/warehousingModules/customers-registry/interfaces/customer.model";
import { ServiceResponse } from "../interfaces/service-response.interface";

const base_url = environment.base_url;

@Injectable({
  providedIn: "root",
})
export class AddressService {
  constructor(private http: HttpClient) {}

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

  getAddresses(formData: Customer) {
    const url = `${base_url}/addresses/?customerId=${formData._id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getAddressesToInvoice(formData: Customer) {
    const url = `${base_url}/addresses/toInvoice/?customerId=${formData._id}`;
    return this.http.get<ServiceResponse>(url);
  }

  getAddress(customerId: string) {
    const url = `${base_url}/addresses/?type=0&customerId=${customerId}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getAddressByType(customerId: string, type: string) {
    const url = `${base_url}/addresses/?type=${type}&customerId=${customerId}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getDefaultAddress(customerId: string) {
    const url = `${base_url}/addresses/?isDefault=true&customerId=${customerId}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createAddress(formData: Address) {
    const url = `${base_url}/addresses`;
    return this.http.post(url, formData, this.headers);
  }

  createAddressIntra(formData: Address) {
    const url = `${base_url}/addresses/intra`;
    return this.http.post(url, formData);
  }

  updateAddress(formData: Address) {
    const url = `${base_url}/addresses/${formData._id}`;
    return this.http.put(url, formData, this.headers);
  }

  setDefault(formData: Address) {
    const url = `${base_url}/addresses/setDefault/${formData.customerId}/${formData._id}`;
    return this.http.put(url, formData, this.headers);
  }

  deleteAddress(formData: Address) {
    const url = `${base_url}/addresses/${formData._id}`;
    return this.http.delete(url, this.headers);
  }
}
