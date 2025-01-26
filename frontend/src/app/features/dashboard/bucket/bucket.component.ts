import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FileService } from 'src/app/core/services/file.service';
import * as JSZip from 'jszip';
import { SocketService } from 'src/app/core/services/socket.service';


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
  excelData: any[] = []; // Parsed data for xlsx files
  xlsxUrl: SafeResourceUrl = '';
  messages: { username: string; msg: string; color: string }[] = [];
  notificationMessages: string[] = [];
  message: string = '';
  username: string = '';
  isChatOpen: boolean = false;
  userColor: string = '';

  constructor(
    private fileService: FileService,
    private sanitizer: DomSanitizer,
    private socketService: SocketService
  ) {
    this.socketService.authenticate();
  }

  ngOnInit() {
    // Listen for authentication success and get the username
    this.socketService.onAuthentication().subscribe((data) => {
      if (data.username) {
        this.username = data.username;
        this.userColor = data.color;
      }
    });
    this.socketService.onMessage().subscribe((data) => {
      this.messages.push(data);
    });
    this.fileService.getFiles().subscribe((data) => {
      this.files = data;
      console.log('files: ', this.files);
    });

    this.socketService.onNotification().subscribe((notification) => {
      this.showNotification(notification.message);
    });
  }

  showNotification(message: string): void {
    alert(message); // Display a browser alert
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.socketService.sendMessage(this.message);
      this.message = ''; // Clear message input after sending
    }
  }

  onChatContainerClick(event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  }

  // Close the chat window if clicked outside
  @HostListener('document:click', ['$event'])
  closeChatOnOutsideClick(event: MouseEvent): void {
    const chatWindow = document.querySelector('.chat-window');
    const chatContainer = document.querySelector('.chat-container');
    if (
      this.isChatOpen &&
      chatWindow &&
      !chatWindow.contains(event.target as Node) &&
      !chatContainer?.contains(event.target as Node)
    ) {
      this.isChatOpen = false;
    }
  }

  toggleChatWindow(): void {
    this.isChatOpen = !this.isChatOpen;
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
    if (this.selectedFiles.length != 0) filesToDownload = this.selectedFiles;
    Promise.all(
      filesToDownload.map((file) => this.fetchAndAddFileToZip(file.url, zip))
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
    console.log('File selected event triggered');
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('File selected:', file.name);
    }
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
      console.log(this.selectedFile);
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
        this.files = [
          ...this.files,
          { name: file.name, url: response.fileURL },
        ];
        // this.fileService.add(response.fileURL);
        alert('file uploaded successfully!');
        this.isUploadModalOpen = false; // Close the modal
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        alert('Error uploading file');
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
    } else if (extension === 'pdf') {
      return 'pdf'; // Add support for PDF files
    } else if (extension === 'xlsx') {
      this.xlsxUrl = this.getOfficeViewerURL(url);
      return 'xlsx';
    } else {
      return 'other'; // For any unsupported file types
    }
  }
  getOfficeViewerURL(url: string): SafeUrl {
    const viewerURL = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url
    )}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerURL);
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
