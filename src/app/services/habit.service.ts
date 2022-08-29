import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RootCategory } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  constructor(private http: HttpClient) { }

  public getHabits(): Observable<RootCategory> {
    return this.http.get<RootCategory>(
      `${environment.apiUrl}/habit-categories`
    );
  }
}
