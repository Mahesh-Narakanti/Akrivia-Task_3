import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatureRoutingModule } from './feature-routing.module';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { InventoryComponent } from 'src/app/shared/components/inventory/inventory.component';
import { BucketComponent } from '../bucket/bucket.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { AddProductComponent } from 'src/app/shared/components/add-product/add-product.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UserEditComponent } from '../user-edit/user-edit.component';


@NgModule({
  declarations: [
    DashboardComponent,
        InventoryComponent,
        BucketComponent,
        FileUploadComponent,
    AddProductComponent,
        UserEditComponent
  ],
  imports: [
    CommonModule,
    FeatureRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule
  ]
})
export class FeatureModule { }
