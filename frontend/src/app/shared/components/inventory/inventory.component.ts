import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { jsPDF } from 'jspdf'; // Import jsPDF


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
  isAddProductModalOpen = false; // Modal visibility for Add Product
  isImportModalOpen = false;
  cartItems: any[] = [];
  toggleView = 'viewAll';
  cartIt: any[] = [];
  selectedVendors: number[] = []; // This array will hold the selected vendor IDs
  parsedProducts: any[] = []; // To store products parsed from the Excel file
  errorMessage: string | null = null;
  editModeMap: { [productId: number]: boolean } = {}; // Mapping to track edit mode state
  totalPages: number = 1;
  currentPage: number = 1;
  limit: number = 10; // You can change the default limit
  pageSize: number = 10; // Number of products per page
  totalUsers: number = 0; // Total number of products

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private auth: AuthService,
  ) {
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

  ngOnInit(): void { }
  
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
      product_id:item.product_id,
      product_name: item.product_name, // Only take product name
      product_image: item.product_image, // Only take product image
      quantity: 0, // Set initial quantity to 0
      selected_vendor_name:
        item.vendors.length > 0 ? item.vendors[0].vendor_id : null, // Set selected vendor name (default to first vendor)
      category_name: item.category_name, // Include category name
      created_at: new Date().toISOString(), // Set the current timestamp for created_at
      vendors: item.vendors,
    }));

    this.isCartModalOpen = true;
  }

  closeCartModal(): void {
    this.isCartModalOpen = false; // Close the modal
  }

  adjustQuantity(item: any, amount: number): void {
    item.quantity += amount; // Increase or decrease quantity
    if (item.quantity < 1) {
      item.quantity = 0; // Prevent quantity from being less than 1
    }
  }

  removeFromCart(item: any): void {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1); // Remove item from cart
    }
  }

  moveToCart(): void {
    const itemsToSend = this.cartItems.map((item) => ({
      product_id:item.product_id,
      product_name: item.product_name, // Product name
      product_image: item.product_image, // Product image URL
      quantity: item.quantity, // Quantity in the cart
      selected_vendor_name:
        item.vendors.length > 0 ? item.vendors[0].vendor_name : null, // Select the first vendor or null if no vendors
      category_name: item.category_name, // Category name
      created_at: new Date().toISOString(), // Current timestamp for created_at
    }));

    console.log('Moving products to cart:', itemsToSend);

    this.productService.addItemsToCart(itemsToSend).subscribe({
      next: (response) => {
        console.log('Cart items added successfully:', response);
        alert('products added to the cart successfully');
        this.closeCartModal(); // Close the modal after moving items to cart
      },
      error: (err) => {
        console.error('Error adding items to cart:', err);
      },
    });
  }

  toggleViewSelection(view: string) {
    this.toggleView = view; // Update the toggleView variable
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
    const formattedData = this.products.map((product) => ({
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

    // Create a new worksheet with the formatted data
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);

    // Create a new workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Trigger the download of the Excel file
    XLSX.writeFile(wb, 'products.xlsx');
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true; // Open modal
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false; // Close modal
  }

 
  openImportModal(): void {
    // Open the modal using NgbModal or any modal library you are using
    this.isImportModalOpen = true;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];

    if (file && file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });

        // Assuming the first sheet contains the product data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const productsData = XLSX.utils.sheet_to_json(worksheet);

        if (productsData.length > 0) {
          // Transform the data to match the backend expected structure
          this.parsedProducts = productsData.map((product: any) => {
            const vendors = product['Vendor Name']
              ? product['Vendor Name']
                  .split(',')
                  .map((vendorName: string, index: number) => ({
                    vendor_id: index + 1, // Assuming vendor IDs are assigned sequentially
                    vendor_name: vendorName.trim(),
                  }))
              : [];

            return {
              product_id: product['Product ID'],
              product_name: product['Product Name'],
              category_name: product['Category'],
              quantity_in_stock: product['Quantity'],
              unit_price: parseFloat(product['Unit Price']),
              product_image: product['Product Image'] || 'default_image.jpg', // Or fetch the image from another source
              vendors: vendors,
            };
          });

          this.errorMessage = null; // Clear any previous error messages
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
      // Send the parsed products to the backend
      this.productService.addProducts(this.parsedProducts).subscribe({
        next: (response) => {
          // Close the modal and clear any error messages
          this.isImportModalOpen = false;
          this.errorMessage = null;

          // Optionally, refresh the table with the new products
          this.products = [...this.products, ...this.parsedProducts];

          // You can also make a call to the backend to get the updated products if needed
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

  // Handling actions (Edit, Delete, Download)
  downloadProduct(product: any) {
    console.log('Download product:', product);
  }

  isEditMode(product: any): boolean {
    return this.editModeMap[product.product_id] || false;
  }

  // Enable inline editing for the selected product
  editProduct(product: any) {
    this.editModeMap[product.product_id] = true;
  }

  // Save changes made to the product
  saveProduct(product: any) {
    // Send the updated product to the backend API

    // After saving, disable edit mode
    this.editModeMap[product.product_id] = false;
    const updatedProduct = {
      product_id: product.product_id,
      product_name: product.product_name,
      status: product.status,
      category_id: product.category.category_id,
      vendors: product.vendors
        .map((vendor: any) => vendor.vendor_id) // Extract the vendor_id
        .filter(
          (vendor_id: any) => vendor_id !== undefined && vendor_id !== null
        ), // Remove undefined and null values
      quantity_in_stock: product.quantity_in_stock,
      unit_price: product.unit_price,
      product_image: product.product_image,
    };
    console.log(updatedProduct);
    this.productService.updateProduct(updatedProduct).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
    console.log('Product saved:', product);
  }
  isVendor(vendor: any, product: any): boolean {
    // Ensure product.vendors is an array of objects, and check if the vendor_id matches
    return (
      Array.isArray(product.vendors) &&
      product.vendors.some(
        (productVendor: any) => productVendor.vendor_id === vendor.vendor_id
      )
    );
  }

  // Toggle vendor selection: add or remove vendor_id from product.vendors array
  toggleVendorSelection(event: any, vendor: any, product: any) {
    // Ensure product.vendors is initialized as an array

    if (event.target.checked) {
      // If checked, add vendor object with both vendor_id and vendor_name to product.vendors
      const vendorObject = {
        vendor_id: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
      };
      product.vendors.push(vendorObject);
    } else {
      // If unchecked, remove the vendor object from product.vendors
      product.vendors = product.vendors.filter(
        (v: any) => v.vendor_id !== vendor.vendor_id
      );
    }
  }

  // Cancel editing and revert any changes
  cancelEdit(product: any) {
    // Revert changes made during edit (you may need to refetch original data from the backend)
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

    // Add the product details to the PDF
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);

    // Add product name
    doc.text(`Product Name: ${product.product_name}`, 10, 10);

    // Add category
    doc.text(`Category: ${product.category_name}`, 10, 20);

    // Add quantity in stock
    doc.text(`Quantity in Stock: ${product.quantity_in_stock}`, 10, 30);

    // Add unit price
    doc.text(`Unit Price: $${product.unit_price}`, 10, 40);

    // Add vendors
    doc.text(`Vendors:`, 10, 50);
    product.vendors.forEach((vendor: any, index: number) => {
      doc.text(`${index + 1}. ${vendor.vendor_name}`, 10, 60 + index * 10);
    });

    // Add product image (assuming the image path is correct and the image is locally available)
    if (product.full_image) {
      this.convertImageToBase64(product.full_image)
        .then((base64Image) => {
          // Add Base64 image to the PDF
          doc.addImage(base64Image, 'JPEG', 10, 80, 50, 50); // Adjust the width and height as needed
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
      img.crossOrigin = 'Anonymous'; // To handle CORS issues with external images

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

  // Search term and selected filter columns
  searchQuery = '';
  selectedFilterColumns: string[] = []; // Allows multiple column selection

  onSearchChange(event: any): void {
    this.searchQuery = event.target.value;
    console.log('Search Query: ', this.searchQuery);
    this.filteredProducts();
  }

  toggleFilterSelection(event: any, columnValue: string): void {
    // If the checkbox is checked, add the column to selectedFilterColumns
    if (event.target.checked) {
      this.selectedFilterColumns.push(columnValue);
    } else {
      // If the checkbox is unchecked, remove the column from selectedFilterColumns
      const index = this.selectedFilterColumns.indexOf(columnValue);
      if (index > -1) {
        this.selectedFilterColumns.splice(index, 1);
      }
    }

    console.log('Selected Filter Columns: ', this.selectedFilterColumns);
  }
  // Method to filter products based on the search query and selected columns
  filteredProducts() {
    if (!this.searchQuery) {
      return this.products;
    }

    return this.products.filter((product) => {

      if (this.selectedFilterColumns.length === 0) {
        return this.filterColumns.some((filterColumn) => {
          const column = filterColumn.value;
          const valueToCheck = product[column];
          if (column === 'vendors') {
            // If 'vendors' column is selected, check if any vendor's name matches the search query
            return product.vendors.some(
              (vendor:any) =>
                vendor?.vendor_name
                  ?.toLowerCase()
                  .includes(this.searchQuery.toLowerCase()) ?? false
            );
          } else {
            // Otherwise, check if the column's value contains the search query
            return valueToCheck
              .toString()
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase());
          }
        });
      }
      // Check if all selected columns match the search query
      return this.selectedFilterColumns.some((column) => {
        const valueToCheck = product[column];

        if (column === 'vendors') {
          // If 'vendors' column is selected, check if any vendor's name matches the search query
          return product.vendors.some(
            (vendor: any) =>
              vendor?.vendor_name
                ?.toLowerCase()
                ?.includes(this.searchQuery.toLowerCase()) ?? false
          );
        } else {
          // Otherwise, check if the column's value contains the search query
          return valueToCheck
            .toString()
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
        }
      });
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
  loadProducts(): void {
    this.productService.getProducts(this.currentPage, this.pageSize).subscribe({
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
