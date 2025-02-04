import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {
  private secretKey = 'your-secret-key'; // Ensure to securely manage this key
  private excludedRoutes: string[] = [
  
    'http://localhost:3000/files',
    'http://localhost:3000/upload',
  ];

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.shouldSkipEncryption(req.url) ||
      req.url.includes('amazonaws.com')
    ) {
      return next.handle(req);
    }

    if (req.body) {
      const encryptedBody = this.encryptPayload(req.body);
      req = req.clone({
        setHeaders: { 'Content-Type': 'application/json' },
        body: { data: encryptedBody }, // Send encrypted data in the body
      });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.body) {
          const decryptedBody = this.decryptPayload(event.body);
          console.log('decryot:  ' + decryptedBody);
          return event.clone({ body: decryptedBody });
        }
        return event;
      })
    );
  }

  private encryptPayload(payload: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      this.secretKey
    ).toString();
  }

  private shouldSkipEncryption(url: string): boolean {
    return this.excludedRoutes.some((excludedUrl) => url === excludedUrl);
  }

  private decryptPayload(encryptedPayload: any): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPayload, this.secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
