import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { providePrimeNG } from 'primeng/config';
import { SelectModule } from 'primeng/select';
import Aura from '@primeuix/themes/aura';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslatePipe } from './i18n/translate.pipe';
import { LanguageSwitcherComponent } from './language-switcher/language-switcher.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BackendErrorComponent } from './backend-error/backend-error.component';
import { BackendErrorInterceptor } from './backend-error/backend-error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LanguageSwitcherComponent,
    NotFoundComponent,
    BackendErrorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    SelectModule,
    TranslatePipe,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BackendErrorInterceptor,
      multi: true
    },
    provideCharts(withDefaultRegisterables()),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: false,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
