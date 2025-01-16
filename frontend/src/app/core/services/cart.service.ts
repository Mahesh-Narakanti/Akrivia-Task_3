// src/app/core/services/cart.service.ts

import { Injectable } from '@angular/core';
import { ProductService } from './product.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private productService: ProductService) {}

  // Add items to the cart
  addItemsToCart(cartItems: any[]): Observable<any> {
    return this.productService.addItemsToCart(cartItems);
  }

  // Fetch items in the cart
  getItemsToCart(): Observable<any> {
    return this.productService.getItemsToCart();
  }

  // Adjust the quantity of an item in the cart
  adjustQuantity(item: any, amount: number): void {
    item.quantity += amount;
    if (item.quantity < 1) {
      item.quantity = 0;
    }
  }

  // Remove item from the cart
  removeFromCart(cartItems: any[], item: any): any[] {
    return cartItems.filter((cartItem) => cartItem !== item);
  }
}
