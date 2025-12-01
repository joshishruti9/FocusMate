import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ShopService } from '../../services/shop.service';
import { Observable } from 'rxjs';

interface Item {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  loading = true;
  error: string | null = null;
  user: any = null;
  rewardPoints: number = 0;

  private userSub: any;
  constructor(private http: HttpClient, private authService: AuthService, private userService: UserService, private shopService: ShopService) {}

  ngOnInit() {
    this.fetchItems();
    // Initialize user from current auth state and subscribe to updates
    this.user = this.authService.getUser();
    this.userSub = this.authService.currentUser$.subscribe((u: any) => {
      this.user = u;
      const email = this.user?.userEmail;
      if (email) {
        this.userService.getUserByEmail(email).subscribe({ next: (profile) => { this.user = profile; this.rewardPoints = profile.rewardPoints || 0; }, error: () => { this.rewardPoints = 0; } });
      } else {
        this.rewardPoints = 0;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

  // For testing, you can use static mock data first
  fetchItems() {
    // Load from backend
    this.shopService.getItems().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: (err) => { console.error('Failed to load shop items', err); this.loading = false; this.error = 'Failed to load items'; }
    });


    const user = this.authService.getUser();
    if (user?.userEmail) {
      this.userService.getUserByEmail(user.userEmail).subscribe({
        next: (u) => { this.user = u; this.rewardPoints = u.rewardPoints || 0; },
        error: () => { this.rewardPoints = 0; }
      });
    }
  }

  purchaseItem(itemId: string) {
    const user = this.user || this.authService.getUser();
    if (!user) {
      alert('Please login to purchase items.');
      return;
    }
    this.shopService.purchaseItem(user.userEmail, itemId).subscribe({
      next: (res) => {
        // If server returns updated user, update local user
        if (res && res.user) {
          this.authService.setUser(res.user, this.authService.getToken() || undefined);
        }
        alert('Purchase successful!');
        // remove purchased item from list
        this.items = this.items.filter(i => i._id !== itemId);
        // refresh user reward points
        this.userService.getUserByEmail(user.userEmail).subscribe({
          next: (u) => { this.user = u; this.rewardPoints = u.rewardPoints || 0; },
          error: () => { this.rewardPoints = 0; }
        });
      },
      error: (err) => {
        console.error('Purchase failed', err);
        alert('Purchase failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}

