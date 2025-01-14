import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = 'http://localhost:3000/files/list-files'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Get files from S3
  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
