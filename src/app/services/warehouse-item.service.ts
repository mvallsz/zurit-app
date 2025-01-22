import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { WarehouseItemFull } from '../pages/warehousingModules/warehouse-inventory/interfaces/warehouse-item-full.model';
import { ServiceResponse } from '../interfaces/service-response.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class WarehouseItemService {

  constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    };
  }

  getWarehouseItemsFull(from: Number, limit: Number, filter: string, filterOptions: any) {



    filter += `&filterOptions=${JSON.stringify(filterOptions)}`;

    const url = `${base_url}/warehouse-item/?from=${from}&limit=${limit}${filter}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getWarehouseItemFullByRepackId(id: string) {

    const url = `${base_url}/warehouse-item/?rePackage=${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getWarehouseItemFullById(id: string) {

    const url = `${base_url}/warehouse-item/?_id=${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  isGuideComplete(guide: string, status: string) {
    const url = `${base_url}/warehouse-item/isComplete/?guide=${guide}&statusToLookAt=${status}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getWarehouseItemFullByIdToInvoice(id: string) {

    const url = `${base_url}/warehouse-item/invoice/?_id=${id}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getWarehouseItemFullByCustomerIdNotSplit(customer: string, isSplitted: boolean, onGuide: boolean) {

    const url = `${base_url}/warehouse-item/?customer=${customer}&isSplitted=false&status=1&notRepacked=${isSplitted}&onGuide=${onGuide}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getWarehouseItemFullByCustomerId(customer: string, status: string, onGuide: boolean) {

    const url = `${base_url}/warehouse-item/?customer=${customer}&repacked=false&status=${status}&onGuide=${onGuide}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  getWarehouseItemByPackageIds(packageList: WarehouseItemFull[]) {

    let listIdsPackage = '';
    if (typeof packageList[0]._id !== 'undefined') {
      for (const packageOnGuide of packageList) {
        listIdsPackage = listIdsPackage + packageOnGuide._id + ',';
      }
    } else {
      for (const packageOnGuide of packageList) {
        listIdsPackage = listIdsPackage + packageOnGuide + ',';
      }
    }

    const ultimateTerm = listIdsPackage.substr(0, (listIdsPackage.length - 1)).trim();

    const url = `${base_url}/warehouse-item/invoice/?_ids=${ultimateTerm}`;
    return this.http.get<ServiceResponse>(url, this.headers);
  }

  createWarehouseItems(formData: WarehouseItemFull[]) {
    const url = `${base_url}/warehouse-item`;
    return this.http.post<ServiceResponse>(url, formData, this.headers);
  }

  createRepackedWarehouseItems(formData: WarehouseItemFull, tlPackages: WarehouseItemFull[]) {
    const url = `${base_url}/warehouse-item/repacking`;
    return this.http.post<ServiceResponse>(url, { formData, tlPackages }, this.headers);
  }

  updateWarehouseItem(formData: any) {
    const url = `${base_url}/warehouse-item/${formData._id}`;
    return this.http.put(url, formData, this.headers);
  }

  deleteWarehouseItem(formData: WarehouseItemFull) {
    const url = `${base_url}/warehouse-item/${formData._id}`;
    return this.http.delete(url, this.headers);
  }

}
