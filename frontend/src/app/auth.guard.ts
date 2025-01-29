import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService:AuthService,private router:Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.isAuthentic().pipe(
      map((isAuthenticated) => {
        const path = route.routeConfig?.path;
        if (path === 'dashboard' && isAuthenticated) {
          return true;
        }
        if ((path === 'login' || path === 'register') && isAuthenticated) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        if (path === 'dashboard' && !isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        if ((path === '**' || path === '') && isAuthenticated) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      }));
  }
  
}
