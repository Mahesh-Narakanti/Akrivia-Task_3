import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute,private router:Router) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  resetPassword() {

     if (this.newPassword !== this.confirmPassword) {
       alert('Passwords do not match.');
       return;
     }
    
    this.http
      .post('http://localhost:3000/mail/reset-password', {
        token: this.token,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (response) => {
          alert('Password reset successfull!');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => alert('Error resetting password: ' + error.message),
      });
  }
}
