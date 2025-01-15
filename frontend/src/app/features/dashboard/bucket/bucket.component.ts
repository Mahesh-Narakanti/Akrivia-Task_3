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

  constructor(
    private fileService: FileService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Fetch the files when the component loads
    this.fileService.getFiles().subscribe((data) => {
      this.files = data;
    });
  }

  // Handle file actions (Download, Upload)
  downloadAll() {
    const zip = new JSZip(); // Create a new JSZip instance

    // Fetch each file and add it to the ZIP
    Promise.all(this.files.map(file => this.fetchAndAddFileToZip(file.fileURL, zip)))
      .then(() => {
        // Generate the ZIP file and download it
        zip.generateAsync({ type: 'blob' }).then((content :Blob) => {
          const blob = content;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'all_files.zip';
          link.click();
        });
      })
      .catch(error => {
        console.error('Error downloading files:', error);
      });
  }

  fetchAndAddFileToZip(fileUrl: string, zip: any): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          // Extract file name from URL
          const fileName = fileUrl.split('/').pop() || 'unnamed-file';

          // Add the file to the ZIP archive
          zip.file(fileName, blob);

          resolve(); // Resolving without a value, since the promise doesn't return anything
        })
        .catch(error => {
          console.error('Error fetching file:', error);
          reject(error);
        });
    });
  }
  deleteFile(file: any) {
    console.log('Delete file:', file);
  }
  uploadFiles() {
    this.isUploadModalOpen = true;
    console.log(this.isUploadModalOpen);
  }

  // Close the modal
  closeModal() {
    this.isUploadModalOpen = false;
  }

  // Handle file selection (from file input)
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('Selected file:', this.selectedFile);
  }

  // Handle drag over event (for drag-and-drop)
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default behavior to allow dropping
  }

  // Handle drag leave event
  onDragLeave() {
    // Optional: Reset border or show effects on drag leave
  }

  // Handle drop event for drag-and-drop
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      (document.getElementById('fileInput') as HTMLInputElement).files =
        event.dataTransfer.files;
    }
  }

  // Handle file upload
  uploadFile() {
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile);
      this.upload(this.selectedFile);
    } else {
      alert('Please select a file to upload.');
    }
  }

  // Upload the file to the server
  upload(file: File): void {
    this.fileService.uploadFile(file).subscribe({
      next: (response: any) => {
        console.log('File uploaded successfully:', response.fileURL);
        this.files = [...this.files, response.fileURL];
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
    const urlSegments = url.split('/'); // Split the URL by "/"
    const fileNameWithQuery = urlSegments[urlSegments.length - 1]; // Get the last part
    return fileNameWithQuery.split('?')[0]; // Remove any query string if present
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

  // Method to open the file preview
  showPreview(url: string): void {
    this.selectedFileURL = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Set the selected file URL
    this.fileType = this.getFileType(url); // Set the file type for preview
    this.isPreviewOpen = true; // Open the preview modal
  }

  // Method to close the preview modal
  closePreview(): void {
    this.isPreviewOpen = false; // Close the preview modal
  }
}
