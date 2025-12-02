import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';


export interface ReminderConfig {
  enabled: boolean;
  frequency: string;
  time: string;
  weekDay?: string;
  monthDay?: number;
  customInterval?: number;
  customUnit?: string;
  sendEmail: boolean;
  sendMobile: boolean;
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
  
  // Reminder settings
  reminderEnabled: boolean = false;
  frequency: string = '';
  reminderTime: string = '';
  selectedWeekDay: string = '';
  selectedMonthDay: number | null = null;
  customInterval: number = 1;
  customUnit: string = 'days';
  
  // Notification channels
  sendEmail: boolean = true;
  sendMobile: boolean = false;
  channelError: boolean = false;
  
  // Advance notice
  advanceNotice: number = 0;
  
  // Month days array (1-31)
  monthDays: number[] = Array.from({length: 31}, (_, i) => i + 1);
  
  @Output() reminderChange = new EventEmitter<ReminderConfig>();

  constructor() { }

  ngOnInit(): void {
    // Set default time to 9:00 AM
    this.reminderTime = '09:00';
  }

  onReminderToggle(): void {
    if (!this.reminderEnabled) {
      // Reset all settings when disabled
      this.resetSettings();
    }
    this.emitReminderConfig();
  }

  onFrequencyChange(): void {
    // Reset specific selections when frequency changes
    if (this.frequency !== 'weekly') {
      this.selectedWeekDay = '';
    }
    if (this.frequency !== 'monthly') {
      this.selectedMonthDay = null;
    }
    if (this.frequency !== 'custom') {
      this.customInterval = 1;
      this.customUnit = 'days';
    }
    this.emitReminderConfig();
  }

  validateChannels(): void {
    this.channelError = !this.sendEmail && !this.sendMobile;
    this.emitReminderConfig();
  }

  emitReminderConfig(): void {
    const config: ReminderConfig = {
      enabled: this.reminderEnabled,
      frequency: this.frequency,
      time: this.reminderTime,
      weekDay: this.selectedWeekDay,
      monthDay: this.selectedMonthDay || undefined,
      customInterval: this.customInterval,
      customUnit: this.customUnit,
      sendEmail: this.sendEmail,
      sendMobile: this.sendMobile,
      advanceNotice: this.advanceNotice
    };
    
    this.reminderChange.emit(config);
  }

  getReminderSummary(): string {
    if (!this.frequency) {
      return 'Not set';
    }

    switch (this.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return this.selectedWeekDay 
          ? `Every ${this.selectedWeekDay.charAt(0).toUpperCase() + this.selectedWeekDay.slice(1)}`
          : 'Weekly (day not selected)';
      case 'monthly':
        return this.selectedMonthDay 
          ? `Every month on day ${this.selectedMonthDay}`
          : 'Monthly (day not selected)';
      case 'custom':
        return `Every ${this.customInterval} ${this.customUnit}`;
      default:
        return 'Not set';
    }
  }

  getChannelsSummary(): string {
    const channels = [];
    if (this.sendEmail) channels.push('Email');
    if (this.sendMobile) channels.push('Mobile');
    return channels.length > 0 ? channels.join(', ') : 'None selected';
  }

  getAdvanceNoticeSummary(): string {
    if (this.advanceNotice === 0) return 'At the time';
    if (this.advanceNotice < 60) return `${this.advanceNotice} minutes before`;
    if (this.advanceNotice === 60) return '1 hour before';
    if (this.advanceNotice === 1440) return '1 day before';
    return `${this.advanceNotice} minutes before`;
  }

  resetSettings(): void {
    this.frequency = '';
    this.reminderTime = '09:00';
    this.selectedWeekDay = '';
    this.selectedMonthDay = null;
    this.customInterval = 1;
    this.customUnit = 'days';
    this.sendEmail = true;
    this.advanceNotice = 0;
    this.channelError = false;
  }

  isValid(): boolean {
    if (!this.reminderEnabled) return true;
    
    const hasFrequency = !!this.frequency;
    const hasTime = !!this.reminderTime;
    const hasChannel = this.sendEmail || this.sendMobile;
    
    let frequencyValid = true;
    if (this.frequency === 'weekly') {
      frequencyValid = !!this.selectedWeekDay;
    } else if (this.frequency === 'monthly') {
      frequencyValid = !!this.selectedMonthDay;
    }
    
    return hasFrequency && hasTime && hasChannel && frequencyValid;
  }
}