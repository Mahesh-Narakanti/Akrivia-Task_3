import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  users:any[] = []; // Store users from the API
  selectedUser: any=null; // For editing user role
  @Input() user: any;
  constructor(private authService:AuthService ) {}

  ngOnInit(): void {
    this.loadUsers();
  }
  editUserRole(user: any) {
    this.selectedUser = { ...user }; // Copy user details for editing
  }

  // To save the edited role
  saveRole() {
    if (this.selectedUser) {
      console.log(this.selectedUser.role_id);
      this.authService.updateUserRole(this.selectedUser.id,this.selectedUser.role_id).subscribe(updatedUser => {
        this.selectedUser = null;
        this.loadUsers();
      });
    }
  }

  loadUsers(): void{
    this.authService.getUsers(this.user.branchId).subscribe({
      next: (response) => {
        console.log(response);
        this.users = response;
      },
      error: (err) => {
        console.log("failed to get all users:" + err);
      }
    })
  }
  
}
