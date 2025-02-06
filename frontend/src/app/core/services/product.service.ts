import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, ObservedValueOf, switchMap } from 'rxjs';
import { ProductListResponse } from '../interfaces/products';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000'; // Adjust API URL as needed

  constructor(private http: HttpClient) {}

  // Method to get all products along with vendor and category info
  getProducts(
    page: number,
    limit: number,
    searchQuery: string,
    filterColumns: string[],
    branchId?:string 
  ): Observable<any> {
    console.log(branchId);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', searchQuery)
      .set('branchId', branchId!);
    if (filterColumns.length > 0) {
      params = params.set('filterColumns', filterColumns.join(','));
    }
    return this.http.get<ProductListResponse>(
      `${this.apiUrl}/inventory/products`,
      { params }
    );
  }

  getVendors(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/inventories/vendor`);
  }

  getCategory(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/inventories/category`);
  }

  addItemsToCart(cartItems: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, {
      itemsToSend: cartItems,
    });
  }

  getItemsToCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/get`);
  }

  removeItemCart(cart_id: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/del/${cart_id}`, {
      status: 99,
    });
  }

  adjustQuantity(
    userId: number,
    cartId: number,
    productName: string,
    amount: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/adjust-quantity`, {
      user_id: userId,
      cart_id: cartId,
      product_name: productName,
      amount,
    });
  }

  addProduct(newProduct: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/addNew`, newProduct);
  }

  delete(productId: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/del/${productId}`, {
      status: 99,
    });
  }

  addProducts(file:File,fileName: string,branch:string): Observable<any> {
    return this.http.post(`${this.apiUrl}/file/import`, { fileName, branch }).pipe(
      switchMap((response: any) => {
        const presignedUrl = response.presignedUrl; // Extract presigned URL from response
       return this.uploadFileToS3(presignedUrl, file);
        
      })
    );
  }
  uploadFileToS3(presignedUrl: string, file: File): Observable<any> {
const headers = new HttpHeaders({
  'Content-Type': file.type, // Set content type to the file's type
});
    return this.http.put(presignedUrl, file,{headers});
  }

  addFiles(fileName: string | null): Observable<any>{
    console.log("came");
    return this.http.post(`${this.apiUrl}/file/add-file`,fileName);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/file/getFiles`);
  }

  updateProduct(updatedProduct: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/update`, updatedProduct);
  }
}
