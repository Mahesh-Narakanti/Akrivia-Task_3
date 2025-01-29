import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  selectedVendors: number[] = []; // This array will hold the selected vendor IDs
  errorMessage: string | null = null;
  imageError: boolean = false;
  selectedImage: File | null = null;

  @Input() categories: any[] = [];
  @Input() vendors: any[] = [];
  @Output() closeProductModal = new EventEmitter<Boolean>();

  constructor(private fb: FormBuilder, private auth: AuthService,private productService:ProductService) {
    this.productForm = this.fb.group({
      product_name: ['', Validators.required],
      status: [1, Validators.required],
      category_name: ['', Validators.required],
      vendors: [[], Validators.required],
      quantity_in_stock: [0],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      product_image: [null],
    });
  }

  ngOnInit(): void {}

  onVendorChange(event: any, vendorId: number): void {
    if (event.target.checked) {
      this.selectedVendors.push(vendorId);
    } else {
      const index = this.selectedVendors.indexOf(vendorId);
      if (index > -1) {
        this.selectedVendors.splice(index, 1);
      }
    }

    this.productForm.patchValue({
      vendors: this.selectedVendors,
    });
  }

  isVendorSelected(vendorId: number): boolean {
    return this.selectedVendors.includes(vendorId);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const payload = {
        product_name: this.productForm.value.product_name,
        status: this.productForm.value.status,
        category_name: this.productForm.value.category_name,
        vendors: this.productForm.value.vendors,
        quantity_in_stock: this.productForm.value.quantity_in_stock,
        unit_price: this.productForm.value.unit_price,
        product_image: '',
        full_image: '',
      };
      console.log(payload);

      if (this.selectedImage) {
        this.auth
          .uploadFile(this.selectedImage)
          .pipe(
            map((response) => ({
              thumbnailUrl: response.thumbnailUrl,
              profilePicUrl: response.profilePicUrl,
            })),
            switchMap((urls) => {
              payload.product_image = urls.thumbnailUrl;
              payload.full_image = urls.profilePicUrl;

              return this.productService.addProduct(payload);
            })
          )
          .subscribe({
            next: (response) => {
              console.log('Product added successfully:', response);
              alert("product added successfully");
              this.closeAddProductModal();
            },
            error: (err) => {
              console.error('Error adding product:', err);
            },
          });
      } else {
        // If no image is selected, proceed with the product submission without the image
        this.productService.addProduct(payload).subscribe({
          next: (response) => {
            console.log('Product added successfully:', response);
            alert("product added successfully");
            this.closeAddProductModal();
          },
          error: (err) => {
            alert("this product cant be added");
            this.closeAddProductModal();
            console.error('Error adding product:', err);
          },
        });
      }
    }
  }

  onFileSelect(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage = file;
      this.imageError = false;
      this.productForm.patchValue({ product_image: this.selectedImage });
    } else {
      this.imageError = true;
      this.selectedImage = null;
      this.productForm.patchValue({ product_image: null });
    }
  }


  closeAddProductModal() {
    this.closeProductModal.emit();
  }

}
