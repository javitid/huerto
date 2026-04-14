import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { TranslatePipe } from '../i18n/translate.pipe';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    TranslatePipe,
    LoginRoutingModule
  ]
})
export class LoginModule {}
