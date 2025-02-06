import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from  '@angular/common/http'
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    branch: string,
    role: string
  ): Observable<any> {
    const data = { firstName, lastName, email, password, branch, role };
    return this.http.post('http://localhost:3000/auth/signup', data);
  }

  login(user: string, password: string): Observable<any> {
    return this.http.post('http://localhost:3000/auth/login', {
      user,
      password,
    });
  }

  getUser(): Observable<any> {
    return this.http.get('http://localhost:3000/auth/user');
  }

  profileImage(thumbnailUrl: string, profilePicUrl: string): void {
    const data = { profilePicUrl, thumbnailUrl };
    this.http.post('http://localhost:3000/auth/pic', data).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  uploadFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('uploadedFileName', file, file.name);

    return this.http.post(`http://localhost:3000/upload`, formData);
  }

  isAuthentic(): Observable<boolean> {
    const token = window.sessionStorage.getItem('token');

    if (token) {
      return this.http.get('http://localhost:3000/api/protected-data').pipe(
        map((response) => {
          console.log('Authenticated: ', response);
          return true;
        }),
        catchError((error) => {
          console.error('Token expired or invalid', error);
          return of(false);
        })
      );
    } else {
      return of(false);
    }
  }

  refreshToken(): Observable<any> {
    return this.http.post<{ token: string }>(
      `http://localhost:3000/auth/refresh-token`,
      {
        refreshToken: sessionStorage.getItem('refreshToken'),
      }
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post('http://localhost:3000/mail/forgot-password', {
      email,
    });
  }

  getUsers(userBranch: any): Observable<any> {
    let params = new HttpParams();
    params = params.append('branch', userBranch!);
    return this.http.get('http://localhost:3000/auth/getUsers', { params });
  }

  updateUserRole(userId: number, roleId: number): Observable<any> {
    return this.http.put('http://localhost:3000/auth/editUser', {
      role_id: roleId,
      user_id:userId
    });
  }
}
