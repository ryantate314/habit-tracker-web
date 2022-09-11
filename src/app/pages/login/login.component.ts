import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public googleClientId = environment.googleClientId;
  
  constructor(private auth: AuthService, private router: Router, private ngZone: NgZone) {}

  public ngOnInit(): void {
    // TODO MOVE THIS TO A GUARD
    this.auth.isAuthenticated$.pipe(
      take(1)
    ).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(["habits"]);
      }
    });
  }

  public ngAfterViewInit(): void {
    (window as any).handleGoogleSignin = (response: any) => {
      const jwt = response.credential;
      this.auth.login(jwt)
        .subscribe(() => {
          this.ngZone.run(() => 
            this.router.navigate(["habits"])
          )
        });
    };
  }

}
