import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FileService } from 'src/app/core/services/file.service';
import * as JSZip from 'jszip';


@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css'],
})
export class BucketComponent implements OnInit {
  files: any[] = [];
  isUploadModalOpen: boolean = false;
  selectedFile: File | null = null;
  isPreviewOpen: boolean = false; // Flag to control modal visibility
  selectedFileURL: SafeResourceUrl = ''; // Use SafeUrl type
  fileType: string = '';
  selectedFiles: any[] = [];

  constructor(
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.fileService.getFiles().subscribe((data) => {
      this.files = data;
    });
  }

  toggleProductSelection(event: any, product: any): void {
    if (event.target.checked) {
      this.selectedFiles.push(product);
    } else {
      const index = this.selectedFiles.indexOf(product);
      if (index > -1) {
        this.selectedFiles.splice(index, 1);
      }
    }
  }

  downloadAll() {
    const zip = new JSZip();
    let filesToDownload = this.files;
    if (this.selectedFiles.length != 0)
      filesToDownload = this.selectedFiles;
    Promise.all(
      filesToDownload.map((file) => this.fetchAndAddFileToZip(file.fileURL, zip))
    )
      .then(() => {
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
          const blob = content;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'all_files.zip';
          link.click();
        });
      })
      .catch((error) => {
        console.error('Error downloading files:', error);
      });
  }

  fetchAndAddFileToZip(fileUrl: string, zip: any): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          // Extract file name from URL
          const fileName = fileUrl.split('/').pop() || 'unnamed-file';

          zip.file(fileName, blob);

          resolve();
        })
        .catch((error) => {
          console.error('Error fetching file:', error);
          reject(error);
        });
    });
  }

  uploadFiles() {
    this.isUploadModalOpen = true;
    console.log(this.isUploadModalOpen);
  }

  closeModal() {
    this.isUploadModalOpen = false;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('Selected file:', this.selectedFile);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave() {}

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      (document.getElementById('fileInput') as HTMLInputElement).files =
        event.dataTransfer.files;
    }
  }

  uploadFile() {
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile);
      this.upload(this.selectedFile);
    } else {
      alert('Please select a file to upload.');
    }
  }

  upload(file: File): void {
    this.fileService.uploadFile(file).subscribe({
      next: (response: any) => {
        console.log('File uploaded successfully:', response.fileURL);
        this.files = [...this.files, this.getFileName(response.fileURL)];
        this.fileService.add(response.fileURL);
        alert('Profile picture updated successfully!');
        this.isUploadModalOpen = false; // Close the modal
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        alert('Error updating profile picture');
      },
    });
  }

  getFileName(url: string): string {
    const urlSegments = url.split('/');
    const fileNameWithQuery = urlSegments[urlSegments.length - 1];
    return fileNameWithQuery.split('?')[0];
  }

  getFileType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase(); // Extract the file extension
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension!)) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(extension!)) {
      return 'video';
    } else {
      return 'other'; // For any unsupported file types
    }
  }

  showPreview(url: string): void {
    this.selectedFileURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.fileType = this.getFileType(url);
    this.isPreviewOpen = true;
  }

  closePreview(): void {
    this.isPreviewOpen = false;
  }
}
