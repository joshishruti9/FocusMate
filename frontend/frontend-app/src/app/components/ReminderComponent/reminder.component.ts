import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';


export interface ReminderConfig {
  enabled: boolean;
  frequency: string;
  time: string;
  weekDay?: string;
  advanceNotice: number;
}

@Component({
  selector: 'app-reminder',
  standalone: true, 
  imports: [FormsModule, CommonModule], 
  providers: [TaskService],
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.css']
})

export class ReminderComponent implements OnInit {
  
  reminderEnabled: boolean = false;
  frequency: string = '';
  reminderTime: string = '';
  selectedWeekDay: string = '';
  advanceNotice: number = 0;
  
  @Output() reminderChange = new EventEmitter<ReminderConfig>();

  constructor() { }

  ngOnInit(): void {
    this.reminderTime = '09:00';
  }

  onReminderToggle(): void {
    if (!this.reminderEnabled) {
      this.resetSettings();
    }
    this.emitReminderConfig();
  }

  onFrequencyChange(): void {
    if (this.frequency !== 'weekly') {
      this.selectedWeekDay = '';
    }
    this.emitReminderConfig();
  }

  emitReminderConfig(): void {
    const config: ReminderConfig = {
      enabled: this.reminderEnabled,
      frequency: this.frequency,
      time: this.reminderTime,
      weekDay: this.selectedWeekDay,
      advanceNotice: this.advanceNotice
    };
    this.reminderChange.emit(config);
  }

  getReminderSummary(): string {
    if (!this.frequency) return 'Not set';

    switch (this.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return this.selectedWeekDay 
          ? `Every ${this.selectedWeekDay.charAt(0).toUpperCase() + this.selectedWeekDay.slice(1)}`
          : 'Weekly (day not selected)';
      default:
        return 'Not set';
    }
  }

  getAdvanceNoticeSummary(): string {
    if (this.advanceNotice === 0) return 'At the time';
    if (this.advanceNotice < 60) return `${this.advanceNotice} minutes before`;
    if (this.advanceNotice === 60) return '1 hour before';
    return `${this.advanceNotice} minutes before`;
  }

  resetSettings(): void {
    this.frequency = '';
    this.reminderTime = '09:00';
    this.selectedWeekDay = '';
    this.advanceNotice = 0;
  }

  isValid(): boolean {
    if (!this.reminderEnabled) return true;
    
    const hasFrequency = !!this.frequency;
    const hasTime = !!this.reminderTime;
    
    let frequencyValid = true;
    if (this.frequency === 'weekly') {
      frequencyValid = !!this.selectedWeekDay;
    }
    
    return hasFrequency && hasTime && frequencyValid;
  }
}