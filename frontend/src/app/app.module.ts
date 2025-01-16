import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './features/entry/login/login.component';
import { RegisterComponent } from './features/entry/register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { InventoryComponent } from './shared/components/inventory/inventory.component';
import { BucketComponent } from './features/dashboard/bucket/bucket.component';
import { FileUploadComponent } from './shared/components/file-upload/file-upload.component';
import { NgIf } from '@angular/common';
import { HeaderInterceptor } from './core/interceptors/header-interceptor';
import { TokenInterceptor } from './core/interceptors/token-interceptor';
import { EncryptionService } from './core/services/encryption.service';
import { AddProductComponent } from './shared/components/add-product/add-product.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    InventoryComponent,
    BucketComponent,
    FileUploadComponent,
    AddProductComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
