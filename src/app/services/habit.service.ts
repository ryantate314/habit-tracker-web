import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, ReplaySubject, tap } from 'rxjs';
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
    // Don't re-query habits after the first one
    // TODO enable periodically updating habits or implement web socket
    if (this.state.root)
      return of(this.state.root);

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
        this.state = this.addHabitToState(this.state, habit);
        this._habits$.next(this.state.root!);
      })
    );
  }

  private addHabitToState(state: State, habit: Habit): State{
    const newState = {
      ...state,
      root: {
        ...this.state.root!,
        habitDictionary: {
          ...this.state.root!.habitDictionary,
          [habit.id!]: habit,
        }
      }
    };

    let parent: HabitCategory | RootCategory;
    if (habit.parentCategoryId) {
      parent = newState.root.categoryDictionary[habit.parentCategoryId];
    }
    else {
      parent = newState.root.root;
    }
    parent.habits = [
      ...parent.habits,
      habit.id!
    ];

    return newState;
  }

  public createCategory(category: HabitCategory): Observable<HabitCategory> {
    return this.http.post<HabitCategory>(
      `${environment.apiUrl}/habit-categories`,
      category
    ).pipe(
      tap(category => {
        this.state = this.addCategoryToState(this.state, category);
        this._habits$.next(this.state.root!);
      })
    );
  }

  private addCategoryToState(state: State, category: HabitCategory): State{
    const newState = {
      ...state,
      root: {
        ...this.state.root!,
        categoryDictionary: {
          ...this.state.root!.categoryDictionary,
          [category.id!]: category,
        }
      }
    };

    let parent: HabitCategory | RootCategory;
    if (category.parentCategoryId) {
      parent = newState.root.categoryDictionary[category.parentCategoryId];
    }
    else {
      parent = newState.root.root;
    }
    parent.subCategories = [
      ...parent.subCategories,
      category.id!
    ];

    return newState;
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
    );
  }

  public getHabitInstances(startDate: Date, endDate: Date): Observable<HabitInstance[]> {
    return this.http.get<HabitInstance[]>(
      `${environment.apiUrl}/habit-instances`,
      {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    ).pipe(
      map(instances => instances.map(instance => ({
        ...instance,
        instanceDate: new Date(instance.instanceDate)
      })))
    )
  }

}
