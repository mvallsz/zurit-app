import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private usuarioService: UsuarioService,
        private router: Router) {

    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const expectedRoles = Array.from(route.data.expectedRoles);
        const actualRole = this.usuarioService.usuario.role; // assuming the role is stored in a property called 'role'

        if (expectedRoles.includes(actualRole)) {
            return true;
        } else {
            this.router.navigateByUrl('app/401');
        }
    }

}