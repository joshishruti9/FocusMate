import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

  fetchItems() {
    this.http.get<Item[]>('http://localhost:4002/items') // make sure this is your shop-service URL
      .subscribe({
        next: (data) => {
          this.items = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load items';
          this.loading = false;
        }
      });
  }

  purchaseItem(itemId: string) {
    console.log('Purchased item:', itemId);
    // Here you could call your shop-service POST /purchase endpoint
  }
}





