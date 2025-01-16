// src/app/core/services/vendor.service.ts

import { Injectable } from '@angular/core';
import { ProductService } from './product.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  constructor(private productService: ProductService) {}

  // Get vendors from the product service
  getVendors(): Observable<any> {
    return this.productService.getVendors();
  }

  // Handle vendor selection
  handleVendorSelection(
    event: any,
    vendorId: number,
    selectedVendors: number[]
  ): number[] {
    if (event.target.checked) {
      selectedVendors.push(vendorId);
    } else {
      const index = selectedVendors.indexOf(vendorId);
      if (index > -1) {
        selectedVendors.splice(index, 1);
      }
    }
    return selectedVendors;
  }
}
