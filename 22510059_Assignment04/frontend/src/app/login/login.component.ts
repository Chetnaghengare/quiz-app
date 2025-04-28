import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="login()">
      <h1>Login form</h1>
      <input type="email" placeholder="Email" formControlName="email">
      <input type="password" placeholder="Password" formControlName="password">
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
    </form>
  `,
  styles: [`
    h1 { text-align: center; }
    form { display: flex; flex-direction: column; max-width: 300px; margin: auto; margin-top: 50px; background: rgb(224, 221, 233); padding: 20px; height: 250px; border-radius: 10px; }
    input, button { margin: 5px 0; padding: 8px; }
    button { background: #28a745; color: white; border: none; cursor: pointer; border-radius: 40px; margin-top: 30px; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(response => {
        localStorage.setItem('name', response.name);  
        localStorage.setItem('email', response.email); 
        localStorage.setItem('token', response.token); 
        localStorage.setItem('role', response.role);  

        // Redirect based on role
        if (response.role === 'teacher') {
          this.router.navigate(['/dashboard']);
        } else if (response.role === 'student') {
          this.router.navigate(['/test']);
        }
      }, error => {
        alert(error.error.message);
      });
    } else {
      alert("Please enter valid email and password.");
    }
  }
}
