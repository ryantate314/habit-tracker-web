import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'habits';

  isAuthenticated$: Observable<boolean>;


  constructor(private readonly auth: AuthService) {
    this.isAuthenticated$ = this.auth.isAuthenticated$;
  }

  logout() {
    this.auth.logout();
  }
}
