import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test" *ngIf="!testStarted && !viewingScore">
      <h1>Student Test</h1>
      <button (click)="startTest()">Start Test</button>
      <button (click)="viewscore()">View Score</button>
    </div>
    
    <!-- Test Questions -->
    <div class="test-container" *ngIf="testStarted">
      <h2>Time Left: {{ minutes }}:{{ seconds | number:'2.0-0' }}</h2>

      <div *ngFor="let question of questions">
        <h3>{{ question.question_text }}</h3>
        <img *ngIf="question.image_url" [src]="'http://localhost:5000' + question.image_url" alt="Question Image" class="question-image">

        <div class="options">
          <label *ngFor="let option of ['A', 'B', 'C', 'D']">
            <input 
              type="radio" 
              [name]="'answer' + question.id" 
              [value]="option" 
              [(ngModel)]="selectedAnswers[question.id]">
            {{ getOptionText(question, option) }}
          </label>
        </div>
      </div>

      <button (click)="submitTest()">Submit Test</button>
    </div>

    <!-- Score Display -->
    <div class="score-container" *ngIf="viewingScore">
      <h2>Your Test Submissions</h2>
      <button (click)="goBack()">Go Back</button>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Score</th>
            <th>Time Taken (seconds)</th>
            <th>Submitted On</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let submission of scoreData; let i = index">
            <td>{{ i + 1 }}</td>
            <td>{{ submission.score }}</td>
            <td>{{ submission.time_taken }}</td>
            <td>{{ formatDate(submission.submitted_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .test, .score-container { text-align: center; margin-top: 50px; }
    .test-container { text-align: center; margin: auto; width: 50%; }
    .question-block { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
    .options { display: flex; flex-direction: column; align-items: start; }
    .question-image { display: block; margin: 10px auto; max-width: 100%; height: auto; border-radius: 5px; }
    .score-container { width: 60%; margin: auto; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid black; padding: 10px; text-align: center; }
    button { margin: 10px; padding: 10px 20px; cursor: pointer; background: rgb(152, 183, 234); border-radius: 20px; }
  `]
})
export class StudentTestComponent implements OnInit {
  questions: any[] = [];
  selectedAnswers: { [key: number]: string } = {};
  testStarted: boolean = false;
  viewingScore: boolean = false;
  startTime: number = 0;
  timer: any;
  timeLeft: number = 600; // 10 minutes
  minutes: number = 10;
  seconds: number = 0;
  scoreData: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  startTest() {
    this.http.get<any[]>('http://localhost:5000/api/questions').subscribe(data => {
      this.questions = data;
      this.testStarted = true;
      this.startTime = Date.now();
      this.startTimer();
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.minutes = Math.floor(this.timeLeft / 60);
        this.seconds = this.timeLeft % 60;
      } else {
        clearInterval(this.timer);
        this.submitTest();
      }
    }, 1000);
  }

  submitTest() {
    clearInterval(this.timer);
    const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
    const submissionData = {
      studentName: localStorage.getItem('email'),
      answers: this.selectedAnswers,
      timeTaken: timeTaken,
      score: 0 // To be calculated later
    };
    
    this.http.post('http://localhost:5000/api/questions/submit-test', submissionData).subscribe(response => {
      console.log("Test submitted", response);
      alert("Test submitted successfully!");
      this.testStarted = false;
    });
  }

  viewscore() {
    const studentEmail = localStorage.getItem('email');

    if (!studentEmail) {
      alert("No student email found. Please log in again.");
      return;
    }

    this.http.get<any[]>(`http://localhost:5000/api/score/getscore/${studentEmail}`).subscribe(
      (data) => {
        console.log("Test Submissions:", data);
        this.scoreData = data;
        this.viewingScore = true;
        this.testStarted = false;
      },
      (error) => {
        console.error("Error fetching scores:", error);
        alert("Failed to load scores. Please try again.");
      }
    );
  }

  goBack() {
    this.viewingScore = false;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getOptionText(question: any, option: string): string {
    return question[`option_${option.toLowerCase()}`] || '';
  }
}
