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

  constructor() {}

  public ngOnInit(): void {
    
  }

  public ngAfterViewInit(): void {
    (window as any).handleGoogleSignin = (response: any) => {
      console.log("Got authentication response:", response);
      const jwt = response.credential;
    }
  }
}
