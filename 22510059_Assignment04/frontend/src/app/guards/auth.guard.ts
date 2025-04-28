import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 

    if (!token) {
      this.router.navigate(['/login']); 
      return false;
    }

    // Check if user is authorized for the route
    if (route.data['role'] && route.data['role'] !== role) {
      this.router.navigate(['/login']); 
      return false;
    }

    return true; 
  }
}
