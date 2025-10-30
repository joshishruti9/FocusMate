import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../NavbarComponent/navbar.component';
import { FooterComponent } from '../FooterComponent/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  earnedRewards: number = 45; // Example: dynamically fetched from user data
  totalRewards: number = 100;
  rewardProgress: number = 0;

  ngOnInit(): void {
    this.calculateRewardProgress();
  }

  calculateRewardProgress(): void {
    this.rewardProgress = (this.earnedRewards / this.totalRewards) * 100;
  }
}