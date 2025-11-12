import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = 'http://localhost:3003/shop';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
  return this.http.get<Item[]>(`${this.apiUrl}/items`);
}

  purchaseItem(userId: string, itemId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase`, { userId, itemId });
  }
}
