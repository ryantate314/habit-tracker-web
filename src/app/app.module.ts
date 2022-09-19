import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HabitsComponent } from './pages/habits/habits.component';
import { AddHabitModalComponent } from './pages/habits/add-habit-modal.component';
import { AUTH_INTERCEPTOR } from './interceptors/auth.interceptor';
import { UNAUTHORIZED_INTERCEPTOR } from './interceptors/unauthorized.interceptor';
import { LoginComponent } from './pages/login/login.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { HistoryComponent } from './pages/history/history.component';


@NgModule({
  declarations: [
    AppComponent,
    HabitsComponent,
    LoginComponent,
    AddHabitModalComponent,
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // Angular Material
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule
  ],
  providers: [
    AUTH_INTERCEPTOR,
    UNAUTHORIZED_INTERCEPTOR
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
