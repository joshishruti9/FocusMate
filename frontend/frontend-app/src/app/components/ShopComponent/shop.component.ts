import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';

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
export class ShopComponent implements OnInit {
  items: Item[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchItems();
  }

  // For testing, you can use static mock data first
  fetchItems() {
    // Replace this.http.get(...) with mock data for UI testing
    const mockData: Item[] = [
      { _id: '1', name: 'Dog with Hat', price: 100, imageUrl: 'https://static.vecteezy.com/system/resources/previews/027/616/206/non_2x/dog-wearing-bucket-hat-vintage-logo-line-art-concept-black-and-white-color-hand-drawn-illustration-vector.jpg' },
      { _id: '2', name: 'Silver Sword', price: 200, imageUrl: 'https://static.vecteezy.com/system/resources/previews/057/282/475/non_2x/a-black-and-silver-sword-with-a-white-background-vector.jpg' },
      { _id: '3', name: 'Red Heart', price: 50, imageUrl: 'https://img.freepik.com/premium-vector/heart-pixel-8-bit-heart_668332-480.jpg' }
    ];
    of(mockData).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      }
    });

    // Uncomment when backend is ready
    // this.http.get<Item[]>('http://localhost:3003/shop/items')
    //   .subscribe({
    //     next: data => { this.items = data; this.loading = false; },
    //     error: err => { this.error = 'Failed to load items'; this.loading = false; }
    //   });
  }

  purchaseItem(itemId: string) {
    console.log('Purchased item:', itemId);
    alert(`Purchased item with ID: ${itemId}`);
  }
}

