import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListResponse } from '../interfaces/products';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000'; // Adjust API URL as needed

  constructor(private http: HttpClient) {}

  // Method to get all products along with vendor and category info
  getProducts(page: number, limit: number): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(
      `${this.apiUrl}/inventory/products?page=${page}&limit=${limit}`
    );
  }

  getVendors(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/vendor`);
  }

  getCategory(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/category`);
  }

  addItemsToCart(cartItems: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, { itemsToSend: cartItems });
  }

  getItemsToCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/get`);
  }

  addProduct(newProduct: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/addNew`, newProduct);
  }

  delete(productId: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/del/${productId}`, { status: 99 });
  }

  addProducts(products: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/import`, { productsData: products });
  }

  updateProduct(updatedProduct: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/update`, updatedProduct);
  }
}
