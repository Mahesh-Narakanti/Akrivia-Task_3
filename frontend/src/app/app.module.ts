import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { RouterOutlet } from '@angular/router';
// import { LoginComponent } from './features/entry/login/login.component';
// import { RegisterComponent } from './features/entry/register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { HeaderInterceptor } from './core/interceptors/header-interceptor';
// import { TokenInterceptor } from './core/interceptors/token-interceptor';
// import { AddProductComponent } from './shared/components/add-product/add-product.component';
import { EncryptionInterceptor } from './core/interceptors/encryption.interceptor';
import { ForgotPasswordComponent } from './features/entry/forgot-password/forgot-password.component';
// import { AuthModule } from './features/entry/auth/auth.module';
// import { FeatureModule } from './features/dashboard/feature/feature.module';

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, BrowserModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EncryptionInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true,
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
