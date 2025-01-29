import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { user } from 'src/app/core/interfaces/user';
import { AuthService } from 'src/app/core/services/auth.service';

declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userData: { id?: string; profile_pic?: string; username?: string,email?:string } = {};
  selectedFile: File | null = null;
  

  constructor(private auth: AuthService , private router:Router) {
    this.auth.getUser().subscribe({
      next: (response) => {
        this.userData.id = response.id;
        this.userData.profile_pic = response.thumbnail;
        this.userData.username = response.username;
        this.userData.email = response.email;
        console.log("here: "+response.thumbnail);
      },
    });
  }

  ngOnInit(): void {}

  updateProfile(): void {
    this.openModal(); 
  }

  // Open the modal
  openModal() {
    const modal = new window.bootstrap.Modal(
      document.getElementById('fileUploadModal') as HTMLElement
    );
    modal.show();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); 
  }

  onDragLeave() {
  }

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
      this.uploadProfilePicture(this.selectedFile);
    } else {
      alert('Please select a file to upload.');
    }
  }

  // Upload the profile picture
  uploadProfilePicture(file: File): void {
    this.auth.uploadFile(file).subscribe({
      next: (response) => {
        this.userData.profile_pic = response.thumbnailUrl;
        console.log(response.thumbnailUrl);
        this.auth.profileImage(response.thumbnailUrl, response.profilePicUrl);
        alert('Profile picture updated successfully!');
      },
      error: () => {
        alert('Error updating profile picture');
      },
    });
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
