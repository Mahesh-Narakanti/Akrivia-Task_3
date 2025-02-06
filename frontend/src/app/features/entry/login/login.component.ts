import { JsonpInterceptor } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup | any = null;
  forgotPasswordEmail: string = '';
  showForgotPasswordModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm?.valid) {
      this.authService
        .login(this.loginForm.value.user, this.loginForm.value.password)
        .subscribe({
          next: (response) => {
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('refreshToken', response.refreshToken);
            alert('login successfull');
            this.router.navigate(['/dashboard'], {
              state: { user: response.userData },
            });
          },
          error: (err) => {
            alert('login failed');
          },
        });
    }
  }

  openForgotPasswordModal() {
    this.showForgotPasswordModal = true;
  }

  // Close the Forgot Password Modal
  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }

  sendResetLink() {
    if (this.forgotPasswordEmail) {
      this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
        next: (response) => {
          alert('Password reset link has been sent to your email!');
          this.closeForgotPasswordModal(); // Close the modal
        },
        error: (err) => {
          console.log(err);
          if (err.status === 404)
            alert("email not found");
          else
            alert("there was an error sending the reset link");
        }
      });
    }
  }
}
