import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'habits';

  public googleClientId = environment.googleClientId;

  constructor(private auth: AuthService, private router: Router) {}

  public ngOnInit(): void {
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(["habits"]);
      }
    })
  }

  public ngAfterViewInit(): void {
    (window as any).handleGoogleSignin = (response: any) => {
      console.log("Got authentication response:", response);
      const jwt = response.credential;
      this.auth.login(jwt)
        .subscribe();
    }
  }
}
