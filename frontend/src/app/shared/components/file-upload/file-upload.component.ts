import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  selectedFile: File | null = null;

  // Open the modal
  openModal() {
    const modal = new window.bootstrap.Modal(
      document.getElementById('fileUploadModal') as HTMLElement
    );
    modal.show();
  }

  // Handle file selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
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
      // Example: send the file to the server using Angular's HttpClient
    } else {
      alert('Please select a file to upload.');
    }
  }
}
