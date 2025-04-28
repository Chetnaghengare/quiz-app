import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
// import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="signupForm" (ngSubmit)="register()">
      <h1>Register</h1>
      <input type="text" placeholder="Name" formControlName="name">
      <input type="email" placeholder="Email" formControlName="email">
      <input type="password" placeholder="Password" formControlName="password">
      <select formControlName="role">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button type="submit" [disabled]="signupForm.invalid">Sign Up</button>
    </form>
  `,
  styles: [`
    h1 {text-align: center; }
    form { display: flex; flex-direction: column; max-width: 300px; margin: auto; margin-top: 30px; background:rgb(224, 221, 233); padding: 20px; height: 350px; border-radius: 10px;}
    input, select, button { margin: 5px 0; padding: 8px; }
    button { background: #28a745; color: white; border: none; cursor: pointer; border-radius: 40px; margin-top: 30px;}
  `]
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: ['student', Validators.required]
    });
  }

  register() {
    //console.log("Register function called"); 
  
    if (this.signupForm.valid) {
      //console.log("Signup form is valid, sending request...");
      
      this.authService.signup(this.signupForm.value).subscribe(response => {
        console.log("Signup success:", response);
        alert(response.message);
      }, error => {
        console.error("Signup failed:", error);
        alert(error.error.message);
      });
    } else {
      console.warn("Form is invalid");
      alert("Please fill all fields correctly.");
    }
  }
  
}
