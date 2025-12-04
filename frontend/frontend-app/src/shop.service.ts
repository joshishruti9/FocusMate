import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShopService {
  private apiUrl = 'https://shopservice-d5aegnddhfg3f6c4.centralus-01.azurewebsites.net/shop'; // correct port and base path

  constructor(private http: HttpClient) {}

  // Get all items
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`);
  }

  // Purchase an item
  purchaseItem(userId: string, itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase`, { userId, itemId });
  }
  
  // Create an item
  createItem(itemData: { name: string; price: number; imageUrl: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, itemData);
  }
}


