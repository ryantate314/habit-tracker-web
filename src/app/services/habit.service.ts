import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Habit, HabitCategory, HabitInstance, HabitRoot, RootCategory } from '../models/habit.model';

interface State {
  root: HabitRoot | null
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private _habits$ = new ReplaySubject<HabitRoot>(1);

  public get habits$(): Observable<HabitRoot> {
    return this._habits$;
  }

  private state: State = {
    root: null
  };

  constructor(private http: HttpClient) { }

  public getHabits(): Observable<HabitRoot> {
    return this.http.get<HabitRoot>(
      `${environment.apiUrl}/habit-categories`
    ).pipe(
      tap(habits => {
        this.state = {
          ...this.state,
          root: habits
        };
        this._habits$.next(this.state.root!);
      })
    );
  }

  public createHabit(habit: Habit): Observable<Habit> {
    return this.http.post<Habit>(
      `${environment.apiUrl}/habits`,
      habit
    ).pipe(
      tap(habit => {
        this.state = {
          ...this.state,
          root: {
            ...this.state.root!,
            habitDictionary: {
              ...this.state.root!.habitDictionary,
              [habit.id!]: habit
            }
          }
        };
        this._habits$.next(this.state.root!);
      })
    );
  }

  public createCategory(category: HabitCategory): Observable<HabitCategory> {
    return this.http.post<HabitCategory>(
      `${environment.apiUrl}/habit-categories`,
      category
    ).pipe(
      tap(category => {
        this.state = {
          ...this.state,
          root: {
            ...this.state.root!,
            categoryDictionary: {
              ...this.state.root!.categoryDictionary,
              [category.id!]: category
            }
          }
        };
        this._habits$.next(this.state.root!);
      })
    );
  }

  public logHabit(instance: HabitInstance): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/habit-instances`,
      instance
    ).pipe(
      tap(() => {
        const habit = this.state.root!.habitDictionary[instance.habitId];
        this.state = {
          ...this.state,
          root: {
            ...this.state.root!,
            habitDictionary: {
              ...this.state.root!.habitDictionary,
              [habit.id!]: {
                ...habit,
                numInstancesToday: habit.numInstancesToday + 1
              }
            }
          }
        };
        this._habits$.next(this.state.root!);
      })
    );;
  }
}
