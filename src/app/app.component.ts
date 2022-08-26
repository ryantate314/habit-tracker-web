import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'habits';

  public googleClientId = environment.googleClientId;

  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    
  }

  public ngAfterViewInit(): void {
    (window as any).handleGoogleSignin = (response: any) => {
      console.log("Got authentication response:", response);
      const jwt = response.credential;
      this.http.post(`${environment.apiUrl}/users/login`, { token: jwt })
        .subscribe(res => {
          console.log("Login response:", res);
        });
    }
  }
}
