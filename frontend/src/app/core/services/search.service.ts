// src/app/core/services/search.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor() {}

  // Filter products based on the search query and selected columns
  filteredProducts(
    products: any[],
    searchQuery: string,
    selectedColumns: string[]
  ): any[] {
    if (!searchQuery) {
      return products;
    }

    return products.filter((product) => {
      return selectedColumns.every((column) => {
        const valueToCheck = product[column];
        if (column === 'vendors') {
          return product.vendors.some(
            (vendor: any) =>
              vendor?.vendor_name
                ?.toLowerCase()
                ?.includes(searchQuery.toLowerCase()) ?? false
          );
        } else {
          return valueToCheck
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
      });
    });
  }
}
