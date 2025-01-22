import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  private _loadingPack = new BehaviorSubject<boolean>(false);
  public readonly loadingPack$ = this._loading.asObservable();

  constructor() {}

  show() {
    this._loading.next(true);
  }

  hide() {
    this._loading.next(false);
  }

  showPkg() {
    this._loadingPack.next(true);
  }

  hidePkg() {
    this._loadingPack.next(false);
  }
}
