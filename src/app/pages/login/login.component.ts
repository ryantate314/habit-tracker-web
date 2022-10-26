import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';

const googleIdentityUrl = "https://accounts.google.com/gsi/client";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  public googleClientId = environment.googleClientId;

  constructor(private auth: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

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

    this.addGoogleIdentity();
  }

  private addGoogleIdentity() {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = googleIdentityUrl;
    this.renderer.appendChild(this.document.body, script);
  }

}
