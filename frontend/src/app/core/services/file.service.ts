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
  uploadFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('uploadedFileName', file, file.name);

    return this.http.post('http://localhost:3000/files', formData);
  }

  // add(fileURL: any) {
  //   this.http.post('http://localhost:3000/files/add', { fileURL }).subscribe({
  //     next: (response) => {
  //       console.log("file uploaded to database");
  //     }
  //   });
  // }

  downloadAll(fileUrls: any[]): Observable<any>{
    return this.http.post('http://localhost:3000/files/download-all',

      { fileUrls },
      { responseType: 'blob' }
    );
  }
}
