import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProductService } from 'src/app/core/services/product.service';



@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  modalOpen: boolean = false; // Controls modal visibility
  previewOpen: boolean = false; // Controls preview modal visibility
  previewUrl: SafeUrl | null = null; // The URL of the file to be previewed
  filesData :any[]= [];

  constructor(private sanitizer: DomSanitizer,private productService:ProductService) {}

  // Open the modal
  openModal() {
    this.modalOpen = true;
    this.productService.getFiles().subscribe({
      next: (response) => {
        console.log(response);
        this.filesData = response;
      },
      error: (err) => {
        alert("error fetching files");
      }
        })
  }

  // Close the modal
  closeModal(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.modalOpen = false;
  }

  // Open the preview modal with the file URL
  openPreview(url: string) {
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.previewOpen = true;
  }

  // Close the preview modal
  closePreview() {
    this.previewUrl = null;
    this.previewOpen = false;
  }

  // Stop propagation of click events to avoid closing modals when clicking inside
  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }
}
