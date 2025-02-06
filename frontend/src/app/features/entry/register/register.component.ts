import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup | any;
  branches = [
    { id: 1, branch_name: 'India', branch_location: 'India Office, New Delhi' },
    {
      id: 2,
      branch_name: 'England',
      branch_location: 'England Office, London',
    },
    {
      id: 3,
      branch_name: 'Australia',
      branch_location: 'Australia Office, Sydney',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      branch: ['', Validators.required],
      role:['',Validators.required]
    });
  }

  onSubmit(): void {
    console.log(this.registerForm);
    this.authService
      .signUp(
        this.registerForm.value.firstName,
        this.registerForm.value.lastName,
        this.registerForm.value.email,
        this.registerForm.value.password,
        this.registerForm.value.branch,
        this.registerForm.value.role
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          alert('You are successfully registered');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.log('error: ' + err);
          alert('signup failed');
        },
      });
  }
}
