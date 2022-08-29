import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HabitsComponent } from './habits/habits.component';
import { AUTH_INTERCEPTOR } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HabitsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AUTH_INTERCEPTOR
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
