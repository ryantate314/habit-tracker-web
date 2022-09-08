import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Habit, HabitCategory, HabitRoot, RootCategory } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private _habits$ = new ReplaySubject<HabitRoot>(1);

  public get habits$(): Observable<HabitRoot> {
    return this._habits$;
  }

  constructor(private http: HttpClient) { }

  public getHabits(): Observable<HabitRoot> {
    return this.http.get<HabitRoot>(
      `${environment.apiUrl}/habit-categories`
    ).pipe(
      tap(habits => {
        this._habits$.next(habits);
      })
    );
  }

  public createHabit(habit: Habit, categoryId?: string): Observable<Habit> {
    return this.http.post<Habit>(
      `${environment.apiUrl}/habits`,
      habit,
      {
        params: {
          categoryId: categoryId ?? ''
        }
      }
    );
  }

  public createCategory(category: HabitCategory, parentCategoryId?: string): Observable<HabitCategory> {
    return this.http.post<HabitCategory>(
      `${environment.apiUrl}/habit-categories`,
      category,
      {
        params: {
          parentCategoryId: parentCategoryId ?? ''
        }
      }
    );
  }
}
