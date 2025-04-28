import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  template: `
    <div class="dashboard">
      <h1>Teacher Dashboard</h1>
      <button (click)="toggleCreateQuestion()">Create Question</button>
      <button (click)="toggleViewQuestions()">View Question Bank</button>
      <button (click)="monitorTests()">Monitor Tests</button>

      <!-- Create Question Form (Only visible when showCreateForm is true) -->
      <div *ngIf="showCreateForm && !showQuestionBank" class="create-question-form">
        <h2>Add a New Question</h2>
        <form [formGroup]="questionForm" (ngSubmit)="submitQuestion()" enctype="multipart/form-data">
          <input type="text" placeholder="Enter Question" formControlName="question_text">
          <input type="text" placeholder="Option A" formControlName="option_a">
          <input type="text" placeholder="Option B" formControlName="option_b">
          <input type="text" placeholder="Option C" formControlName="option_c">
          <input type="text" placeholder="Option D" formControlName="option_d">
          <select formControlName="correct_option">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <!-- File Upload Input -->
          <input type="file" (change)="onFileSelected($event)">

          <button type="submit" [disabled]="questionForm.invalid">Add Question</button>
        </form>

        <!-- Preview Image -->
        <div *ngIf="previewImage">
          <h3>Image Preview:</h3>
          <img [src]="previewImage" alt="Preview" width="200">
        </div>
      </div>

      <!-- View & Manage Questions (Only visible when showQuestionBank is true) -->
      <div *ngIf="showQuestionBank && !showCreateForm" class="question-bank">
        <h2>Question Bank</h2>
        <table>
          <tr>
            <th>Question</th>
            <th>Options</th>
            <th>Correct Answer</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
          <tr *ngFor="let question of questions">
            <td>{{ question.question_text }}</td>
            <td>
              A: {{ question.option_a }}<br>
              B: {{ question.option_b }}<br>
              C: {{ question.option_c }}<br>
              D: {{ question.option_d }}
            </td>
            <td>{{ question.correct_option }}</td>
            <td>
              <img *ngIf="question.image_url" [src]="'http://localhost:5000' + question.image_url" alt="Question Image" width="80">
            </td>
            <td>
              <button (click)="editQuestion(question)">Edit</button>
              <button (click)="deleteQuestion(question.id)">Delete</button>
            </td>
          </tr>
        </table>
      </div>

      <!-- Monitor Test Submissions -->
      <div *ngIf="showTestSubmissions" class="test-submissions">
        <h2>Student Test Submissions</h2>
        <button (click)="goBack()">Go Back</button>
        <table>
          <tr>
            <th>Student Name</th>
            <th>Score</th>
            <th>Time(s)</th>
            <th>Submitted On</th>
          </tr>
          <tr *ngFor="let submission of testSubmissions">
            <td>{{ submission.student_name }}</td>
            <td>{{ submission.score }}</td>
            <td>{{ submission.time_taken }}</td>
            <td>{{ formatDate(submission.submitted_at) }}</td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { text-align: center; margin-top: 50px; }
    button { margin: 10px; padding: 10px 20px; cursor: pointer; background: rgb(152, 183, 234); border-radius: 20px; }

    /* Styling for Create Question Form */
    .create-question-form {
      margin-top: 20px;
      background: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
      width: 50%;
      margin: auto;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #ddd;
    }
    .create-question-form h2 {
      text-align: center;
      color: #333;
      margin-bottom: 15px;
    }
    .create-question-form form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .create-question-form input,
    .create-question-form select,
    .create-question-form button {
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
      font-size: 16px;
    }
    .create-question-form input:focus,
    .create-question-form select:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0px 0px 5px rgba(0, 123, 255, 0.5);
    }
    .create-question-form button {
      background: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      transition: 0.3s;
      font-weight: bold;
    }
    .create-question-form button:hover {
      background: #0056b3;
    }
    .create-question-form img {
      display: block;
      margin: 10px auto;
      border-radius: 5px;
      max-width: 100%;
      height: auto;
    }

    /* Styling for Question Bank */
    .question-bank {
      margin-top: 20px;
      background: #f3f3f3;
      padding: 20px;
      border-radius: 10px;
      width: 70%;
      margin: auto;
    }
    .question-bank table {
      width: 100%;
      border-collapse: collapse;
    }
    .question-bank th, .question-bank td {
      border: 1px solid black;
      padding: 10px;
      text-align: left;
    }
    .question-bank img {
      border-radius: 5px;
    }

    /*Styling score page*/
    .test-submissions {
      margin-top: 20px;
      background: #f3f3f3;
      padding: 20px;
      border-radius: 10px;
      width: 70%;
      margin: auto;
    }
    .test-submissions table {
      width: 100%;
      border-collapse: collapse;
    }
    .test-submissions th, .test-submissions td {
      border: 1px solid black;
      padding: 10px;
      text-align: left;
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  showCreateForm = false;
  showQuestionBank = false;
  showTestSubmissions = false;
  questionForm: FormGroup;
  selectedFile: File | null = null;
  previewImage: string | null = null;
  questions: any[] = [];
  testSubmissions: any[] = [];


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.questionForm = this.fb.group({
      question_text: ['', Validators.required],
      option_a: ['', Validators.required],
      option_b: ['', Validators.required],
      option_c: ['', Validators.required],
      option_d: ['', Validators.required],
      correct_option: ['A', Validators.required]
    });
  }

  ngOnInit() {
    this.loadQuestions();
  }

  toggleCreateQuestion() {
    this.showCreateForm = true;
    this.showQuestionBank = false; // Hide question bank when showing form
  }

  toggleViewQuestions() {
    this.showCreateForm = false;
    this.showQuestionBank = true; // Hide form when viewing questions
    this.loadQuestions();
  }

  loadQuestions() {
    this.http.get('http://localhost:5000/api/questions').subscribe((data: any) => {
      this.questions = data;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Preview the image
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewImage = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  submitQuestion() {
    if (this.questionForm.valid) {
      const questionId = this.questionForm.value.id;
  
      if (questionId) {
        // Editing existing question
        const updatedData = {
          question_text: this.questionForm.value.question_text,
          option_a: this.questionForm.value.option_a,
          option_b: this.questionForm.value.option_b,
          option_c: this.questionForm.value.option_c,
          option_d: this.questionForm.value.option_d,
          correct_option: this.questionForm.value.correct_option
        };
  
        this.http.put(`http://localhost:5000/api/questions/${questionId}`, updatedData)
          .subscribe(() => {
            alert("Question updated successfully!");
            this.resetForm();
          }, error => {
            console.error("Error updating question:", error);
            alert("Failed to update question.");
          });
  
      } else {
        // Creating a new question (uses FormData for file upload)
        const formData = new FormData();
        Object.keys(this.questionForm.value).forEach(key => {
          formData.append(key, this.questionForm.value[key]);
        });
  
        const teacherId = localStorage.getItem('teacherId') || '1';
        formData.append("created_by", teacherId);
  
        if (this.selectedFile) {
          formData.append("image", this.selectedFile);
        }
  
        this.http.post('http://localhost:5000/api/questions/create', formData)
          .subscribe(() => {
            alert("Question added successfully!");
            this.resetForm();
          }, error => {
            console.error("Error adding question:", error);
            alert("Failed to add question.");
          });
      }
    }
  }
  
  

  deleteQuestion(id: number) {
    if (confirm("Are you sure you want to delete this question?")) {
      this.http.delete(`http://localhost:5000/api/questions/${id}`).subscribe(() => {
        alert("Question deleted successfully!");
        this.loadQuestions();
      });
    }
  }

  editQuestion(question: any) {
    this.showCreateForm = true;  // Show the form for editing
    this.showQuestionBank = false; // Hide question bank when editing
  
    // Populate the form with the selected question's details
    this.questionForm.patchValue({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option
    });
  
    // If the question has an image, show it in preview
    this.previewImage = question.image_url ? `http://localhost:5000${question.image_url}` : null;
  
    // Store the question ID to update on form submission
    this.questionForm.setControl('id', this.fb.control(question.id));
  }
  
  resetForm() {
    this.questionForm.reset();
    this.previewImage = null;
    this.selectedFile = null;
    this.showCreateForm = false;
    this.loadQuestions();
  }
  monitorTests() {
    this.http.get<any[]>('http://localhost:5000/api/questions/test-submissions').subscribe(
      (data) => {
        this.testSubmissions = data;
        this.showTestSubmissions = true;
        this.showCreateForm = false;
        this.showQuestionBank = false;
      },
      (error) => {
        console.error("Error fetching test submissions:", error);
        alert("Failed to load test submissions.");
      }
    );
  }
  goBack() {
    this.showTestSubmissions = false;
    this.showQuestionBank = false;
    this.showCreateForm = false;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
