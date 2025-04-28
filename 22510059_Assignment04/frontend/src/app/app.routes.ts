import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';
import { StudentTestComponent } from './student-test/student-test.component'; 

export const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },

  // Protect teacher dashboard (Only teachers can access)
  { path: 'dashboard', component: TeacherDashboardComponent, canActivate: [AuthGuard], data: { role: 'teacher' } },

  // Protect student test page (Only students can access)
  { path: 'test', component: StudentTestComponent, canActivate: [AuthGuard], data: { role: 'student' } },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
