// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor,
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { Router } from '@angular/router';
// @Injectable()
// export class TokenInterceptor implements HttpInterceptor {
//   constructor(private router: Router) {}
//   intercept(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     return next.handle(request).pipe(
//       catchError((error) => {
//         if (error.status === 401) {
//           // Token expired, redirect to login page
//                     this.router.navigate(['/login']);

//         }
        
//         return throwError(error);
//       })
//     );
//   }
// }
