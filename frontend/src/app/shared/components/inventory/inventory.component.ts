import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
  products: any[] = [];
  vendors: any[] = [];
  categories: any[] = [];
  selectedProducts: any[] = [];
  isCartModalOpen = false;
  isAddProductModalOpen = false;
  isImportModalOpen = false;
  cartItems: any[] = [];
  toggleView = 'viewAll';
  cartIt: any[] = [];
  selectedVendors: number[] = [];
  parsedProducts: any[] = [];
  errorMessage: string | null = null;
  editModeMap: { [productId: number]: boolean } = {};
  totalPages: number = 1;
  currentPage: number = 1;
  limit: number = 10;
  pageSize: number = 10;
  totalUsers: number = 0;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.productService.getVendors().subscribe({
      next: (data) => {
        this.vendors = data;
      },
      error: (err) => {
        console.error('Error fetching vendors', err);
      },
    });

    this.productService.getCategory().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching vendors', err);
      },
    });
  }

  toggleProductSelection(event: any, product: any): void {
    if (event.target.checked) {
      this.selectedProducts.push(product);
    } else {
      const index = this.selectedProducts.indexOf(product);
      if (index > -1) {
        this.selectedProducts.splice(index, 1);
      }
    }
  }

  openCartModal(): void {
    this.cartItems = this.selectedProducts.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: 0,
      selected_vendor_name:
        item.vendors.length > 0 ? item.vendors[0].vendor_id : null,
      category_name: item.category_name,
      created_at: new Date().toISOString(),
      vendors: item.vendors,
    }));

    this.isCartModalOpen = true;
  }

  closeCartModal(): void {
    this.isCartModalOpen = false;
  }

  adjustQuantity(item: any, amount: number): void {
    item.quantity += amount;
    if (item.quantity < 1) {
      item.quantity = 0;
    }
  }

  removeFromCart(item: any): void {
    this.productService.removeItemCart(item.cart_id).subscribe({
      next: (response) => {
        alert('item deleted successfully');
         this.cartIt = this.cartIt.filter(
           (c: any) => c.cart_id !== item.cart_id
         );
      },
      error: (err) => {
        console.error('Error deleting item from cart:', err);
      },
    });
  }

  moveToCart(): void {
    const itemsToSend = this.cartItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      selected_vendor_name: item.selected_vendor_name,
        
      category_name: item.category_name,
      created_at: new Date().toISOString(),
    }));

    console.log('Moving products to cart:', itemsToSend);

    this.productService.addItemsToCart(itemsToSend).subscribe({
      next: (response) => {
        console.log('Cart items added successfully:', response);
        alert('products added to the cart successfully');
        this.closeCartModal();
      },
      error: (err) => {
        console.error('Error adding items to cart:', err);
      },
    });
  }

  toggleViewSelection(view: string) {
    this.toggleView = view;
    this.productService.getItemsToCart().subscribe({
      next: (response) => {
        this.cartIt = response;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  downloadAll() {
    let productsToDownload = this.products;
    if (this.selectedProducts.length != 0)
      productsToDownload = this.selectedProducts;
    const formattedData = productsToDownload.map((product) => ({
      'Product ID': product.product_id,
      'Product Name': product.product_name,
      Category: product.category_name,
      'Vendor Name': product.vendors
        .map((vendor: { vendor_name: string }) => vendor.vendor_name)
        .join(', '),
      Quantity: product.quantity_in_stock,
      'Unit Price': product.unit_price,
      'Product Image': product.product_image,
      Status: product.status,
      'Created At': product.created_at,
      'Updated At': product.updated_at,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    XLSX.writeFile(wb, 'products.xlsx');
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true; // Open modal
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false; // Close modal
  }

  openImportModal(): void {
    this.isImportModalOpen = true;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];

    if (file && file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const productsData = XLSX.utils.sheet_to_json(worksheet);

        if (productsData.length > 0) {
          this.parsedProducts = productsData.map((product: any) => {
            const vendors = product['Vendor Name']
              ? product['Vendor Name']
                  .split(',')
                  .map((vendorName: string, index: number) => ({
                    vendor_id: index + 1,
                    vendor_name: vendorName.trim(),
                  }))
              : [];

            return {
              product_id: product['Product ID'],
              product_name: product['Product Name'],
              category_name: product['Category'],
              quantity_in_stock: product['Quantity'],
              unit_price: parseFloat(product['Unit Price']),
              product_image: product['Product Image'] || 'default_image.jpg',
              vendors: vendors,
            };
          });

          this.errorMessage = null;
        } else {
          this.errorMessage = 'No valid data found in the Excel file.';
        }
      };
      reader.readAsBinaryString(file);
    } else {
      this.errorMessage = 'Please upload a valid .xlsx file.';
    }
  }

  uploadData(): void {
    if (this.parsedProducts.length > 0) {
      this.productService.addProducts(this.parsedProducts).subscribe({
        next: (response) => {
          this.isImportModalOpen = false;
          this.errorMessage = null;

          this.products = [...this.products, ...this.parsedProducts];
        },
        error: (err) => {
          this.errorMessage = 'Failed to upload products. Please try again.';
          console.error('Error uploading products', err);
        },
      });
    }
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  isEditMode(product: any): boolean {
    return this.editModeMap[product.product_id] || false;
  }

  editProduct(product: any) {
    this.editModeMap[product.product_id] = true;
  }

  saveProduct(product: any) {
    this.editModeMap[product.product_id] = false;
    const updatedProduct = {
      product_id: product.product_id,
      product_name: product.product_name,
      status: product.status,
      category_id: product.category.category_id,
      vendors: product.vendors
        .map((vendor: any) => vendor.vendor_id)
        .filter(
          (vendor_id: any) => vendor_id !== undefined && vendor_id !== null
        ),
      quantity_in_stock: product.quantity_in_stock,
      unit_price: product.unit_price,
      product_image: product.product_image,
    };
    console.log(updatedProduct);
    this.productService.updateProduct(updatedProduct).subscribe({
      next: (response) => {
        console.log(response);
        this.loadProducts();
      },
    });
    console.log('Product saved:', product);
  }

  isVendor(vendor: any, product: any): boolean {
    return (
      Array.isArray(product.vendors) &&
      product.vendors.some(
        (productVendor: any) => productVendor.vendor_id === vendor.vendor_id
      )
    );
  }

  toggleVendorSelection(event: any, vendor: any, product: any) {
    if (event.target.checked) {
      const vendorObject = {
        vendor_id: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
      };
      product.vendors.push(vendorObject);
    } else {
      product.vendors = product.vendors.filter(
        (v: any) => v.vendor_id !== vendor.vendor_id
      );
    }
  }

  cancelEdit(product: any) {
    this.editModeMap[product.product_id] = false;
    console.log('Editing canceled for product:', product);
  }

  deleteProduct(product: any) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(product.product_id).subscribe({
        next: (response) => {
          console.log('product deleted');
          this.products = this.products.filter(
            (p: any) => p.product_id !== product.product_id
          );
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  downloadProductPDF(product: any) {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`Product Name: ${product.product_name}`, 10, 10);
    doc.text(`Category: ${product.category_name}`, 10, 20);
    doc.text(`Quantity in Stock: ${product.quantity_in_stock}`, 10, 30);
    doc.text(`Unit Price: $${product.unit_price}`, 10, 40);
    doc.text(`Vendors:`, 10, 50);
    product.vendors.forEach((vendor: any, index: number) => {
      doc.text(`${index + 1}. ${vendor.vendor_name}`, 10, 60 + index * 10);
    });

    if (product.full_image) {
      this.convertImageToBase64(product.full_image)
        .then((base64Image) => {
          doc.addImage(base64Image, 'JPEG', 10, 80, 50, 50);
          doc.save(`${product.product_name}_details.pdf`);
        })
        .catch((err) => {
          console.error('Error converting image:', err);
          doc.save(`${product.product_name}_details.pdf`);
        });
    } else {
      doc.save(`${product.product_name}_details.pdf`);
    }
  }

  convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          resolve(dataUrl);
        } else {
          reject('Canvas context is null');
        }
      };

      img.onerror = () => reject('Error loading image');
      img.src = imageUrl;
    });
  }

  filterColumns = [
    { label: 'Product Name', value: 'product_name' },
    { label: 'Category', value: 'category_name' },
    { label: 'Vendors', value: 'vendors' },
    { label: 'Status', value: 'status' },
    { label: 'Quantity', value: 'quantity_in_stock' },
    { label: 'Unit Price', value: 'unit_price' },
  ];

  searchQuery = '';
  selectedFilterColumns: string[] = [];

  onSearchChange(event: any): void {
    this.searchQuery = event.target.value;
    console.log('Search Query: ', this.searchQuery);
    this.loadProducts();
  }

  toggleFilterSelection(event: any, columnValue: string): void {
    if (event.target.checked) {
      this.selectedFilterColumns.push(columnValue);
    } else {
      const index = this.selectedFilterColumns.indexOf(columnValue);
      if (index > -1) {
        this.selectedFilterColumns.splice(index, 1);
      }
    }

    console.log('Selected Filter Columns: ', this.selectedFilterColumns);
    this.loadProducts();
  }
  // filteredProducts() {
  //   if (!this.searchQuery) {
  //     return this.products;
  //   }

  //   return this.products.filter((product) => {
  //     if (this.selectedFilterColumns.length === 0) {
  //       return this.filterColumns.some((filterColumn) => {
  //         const column = filterColumn.value;
  //         const valueToCheck = product[column];
  //         if (column === 'vendors') {
  //           return product.vendors.some(
  //             (vendor: any) =>
  //               vendor?.vendor_name
  //                 ?.toLowerCase()
  //                 .includes(this.searchQuery.toLowerCase()) ?? false
  //           );
  //         } else {
  //           return valueToCheck
  //             .toString()
  //             .toLowerCase()
  //             .includes(this.searchQuery.toLowerCase());
  //         }
  //       });
  //     }

  //     return this.selectedFilterColumns.some((column) => {
  //       const valueToCheck = product[column];

  //       if (column === 'vendors') {
  //         return product.vendors.some(
  //           (vendor: any) =>
  //             vendor?.vendor_name
  //               ?.toLowerCase()
  //               ?.includes(this.searchQuery.toLowerCase()) ?? false
  //         );
  //       } else {
  //         return valueToCheck
  //           .toString()
  //           .toLowerCase()
  //           .includes(this.searchQuery.toLowerCase());
  //       }
  //     });
  //   });
  // }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  loadProducts(): void {
    this.productService
      .getProducts(
        this.currentPage,
        this.pageSize,
        this.searchQuery,
        this.selectedFilterColumns
      )
      .subscribe({
        next: (data) => {
          this.products = data.products;
          this.totalPages = data.totalPages;
          this.currentPage = data.currentPage;
        },
        error: (err) => {
          console.error('Error fetching products', err);
        },
      });
  }
}
