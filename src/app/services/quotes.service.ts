import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Quote } from "../pages/accountingModules/shipping-quotes/interfaces/quote-containers.model";
import { ServiceResponse } from "../interfaces/service-response.interface";

const base_url = environment.base_url;

@Injectable({
  providedIn: "root",
})
export class QuotesService {
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

  getQuotes(from: Number, limit: Number, filter: string) {
    const url = `${base_url}/quotes/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getQuotesPag(
    from: Number,
    limit: Number,
    filter: string,
    filterOptions: any,
    quote: boolean
  ) {
    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;
    const url = `${base_url}/quotes/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getQuote(id: string) {
    const url = `${base_url}/quotes/?_id=${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createQuote(formData: Quote) {
    const url = `${base_url}/quotes`;
    return this.http.post(url, formData, this.headers);
  }

  updateQuote(formData: Quote) {
    const url = `${base_url}/quotes/${formData._id}`;
    return this.http.put<ServiceResponse>(url, formData, this.headers);
  }

  deleteQuote(formData: Quote) {
    const url = `${base_url}/quotes/${formData._id}`;
    return this.http.delete(url, this.headers);
  }
}
