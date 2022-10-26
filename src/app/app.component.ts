import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationStart, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
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

  @ViewChild('sidenav')
  sideNav?: MatSidenav;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.isAuthenticated$ = this.auth.isAuthenticated$;

    // Close the sidenav if the user navigates to one of the links.
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(event => {
      this.sideNav?.close();
    });

    this.auth.init();
  }

  logout() {
    this.auth.logout();
  }
}
