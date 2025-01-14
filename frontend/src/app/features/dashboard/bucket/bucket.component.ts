import { Component, OnInit } from '@angular/core';
import { FileService } from 'src/app/core/services/file.service';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css'],
})
export class BucketComponent implements OnInit {
  files: any[] = [];

  constructor(private fileService: FileService) {}

  ngOnInit() {
    // Fetch the files when the component loads
    this.fileService.getFiles().subscribe((data) => {
      this.files = data;
    });
  }

  // Handle file actions (Download, Upload)
  downloadFile(file: any) {
    console.log('Download file:', file);
  }

  uploadFiles() {
    console.log('Uploading files...');
  }

  deleteFile(file: any) {
    console.log('Delete file:', file);
  }
}
