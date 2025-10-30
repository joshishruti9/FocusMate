import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../NavbarComponent/navbar.component';
import {FooterComponent} from '../FooterComponent/footer.component'; // check your actual path

@Component({
  selector: 'app-login', // lowercase and kebab-case (Angular style guide)
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // plural and array
})
export class LoginComponent {}


