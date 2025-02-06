import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = 'http://localhost:3000/files/list-files'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Get files from S3
  getFiles(userBranch?: string): Observable<any[]> {
    let params=new HttpParams();
    params=params.append("branch", userBranch!);
    return this.http.get<any[]>(this.apiUrl, { params });
  }
  uploadFile(file: File ,userBranch?:string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('uploadedFileName', file, file.name);
    formData.append('branch', userBranch!);
    return this.http.post('http://localhost:3000/files', formData);
  }

  // add(fileURL: any) {
  //   this.http.post('http://localhost:3000/files/add', { fileURL }).subscribe({
  //     next: (response) => {
  //       console.log("file uploaded to database");
  //     }
  //   });
  // }

  // downloadAll(fileUrls: any[]): Observable<any>{
  //   return this.http.post('http://localhost:3000/files/download-all',

  //     { fileUrls },
  //     { responseType: 'blob' }
  //   );
  // }
}
