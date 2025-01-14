import { Injectable } from '@angular/core';
import {HttpClient} from  '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Observable<any> {
    const data = { firstName, lastName, email, password };
    return this.http.post('http://localhost:3000/auth/signup', data);
  }

  login(user: string, password: string): Observable<any> {
    return this.http.post('http://localhost:3000/auth/login', {
      user,
      password,
    });
  }

  getUser(): Observable<any>{
    return this.http.get('http://localhost:3000/auth/user');
  }

  profileImage(thumbnailUrl: string, profilePicUrl: string): void{
    const data = { profilePicUrl, thumbnailUrl };
    this.http.post('http://localhost:3000/auth/pic', data).subscribe({
      next: (response) => {
        console.log(response);
      }
    });
  }

  // In your Angular service

  uploadFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('uploadedFileName', file, file.name);

    return this.http.post('http://localhost:3000/upload', formData);
  }
}
