import { ChangeDetectorRef, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  isRefreshing = false;
  refreshTokenSubject: any = null;
  constructor(private router: Router, private authService: AuthService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      //  return next.handle(modifiedRequest);
    }
    return next.handle(request).pipe(
      catchError((err) => {
        console.error('Error caught in interceptor:', err);

        if (err.status === 401) {
          console.error('Token Expired', err);
          alert("token expired refreshing token");
          // this.isRefreshing = true;
          return this.authService.refreshToken().pipe(
            switchMap((newAccessToken: string) => {
              this.isRefreshing = false;
              // Clone the original request and add the new access token
              console.log(newAccessToken);
              const clonedRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });

              return next.handle(clonedRequest);
            }),
            catchError((error) => {
              this.isRefreshing = false;
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('refreshToken');
              this.router.navigate(['/auth/login']);
              return throwError(() => error);
            })
          );
        }
        // else if(err.status===401 && err.error.name==="JsonWebTokenError")
        // {
        //   sessionStorage.removeItem('token');
        //   localStorage.removeItem('refreshToken');
        //   this.router.navigate(['/auth/login']);
        // }
        else if (err.status === 404) {
          console.error('Resource not found:', err);
        } else {
          console.error('HTTP error:', err);
        }

        return throwError(() => err);
      })
    );
  }

  // private handle401Error(
  //   request: HttpRequest<any>,
  //   next: HttpHandler
  // ): Observable<HttpEvent<any>> {
  //   if (!this.isRefreshing) {
  //     this.isRefreshing = true;
  //     this.refreshTokenSubject = new Observable<HttpEvent<any>>();

  //     return this.authService.refreshToken().pipe(
  //       map((newAccessToken: string) => {
  //         this.isRefreshing = false;
  //         // Clone the original request and add the new access token
  //         const clonedRequest = request.clone({
  //           setHeaders: {
  //             Authorization: `Bearer ${newAccessToken}`,
  //           },
  //         });

  //         return next.handle(clonedRequest);
  //       }),
  //       catchError((error) => {
  //         this.isRefreshing = false;
  //         sessionStorage.removeItem('token');
  //         localStorage.removeItem('refreshToken');
  //         this.router.navigate(['/auth/login']);
  //         return throwError(() => error);
  //       })
  //     );
  //   } else {
  //     return this.refreshTokenSubject.pipe(take(1));
  //   }
  // }
}
