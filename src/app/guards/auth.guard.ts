import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {UsuarioService} from '../services/usuario.service';
import {tap} from 'rxjs/operators';
import {NavigationService} from '../../@vex/services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( private usuarioService: UsuarioService,
               private router: Router,
               private navigationService: NavigationService) {  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.usuarioService.validarToken().pipe(
      tap(isAValidUser => {
        if (!isAValidUser){
          this.router.navigateByUrl('');
        }else{
          if (localStorage.getItem('menu')){
            this.navigationService.items = JSON.parse(localStorage.getItem('menu'));
          }
        }
      })
    );
  }

}
