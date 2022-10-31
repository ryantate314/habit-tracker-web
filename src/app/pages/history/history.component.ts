import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitInstance } from '@app/models/habit.model';
import { HabitService } from '@app/services/habit.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { catchError, combineLatest, map, Observable, of, Subject, switchMap, withLatestFrom } from 'rxjs';

function midnight(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function startOfWeek(date: Date): Date {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = clone.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(clone.setDate(diff));
}

function endOfWeek(date: Date): Date {
  const clone = new Date(date);
  return new Date(clone.setDate(startOfWeek(date).getDate() + 6));
}

function addDays(date: Date, numDays: number = 1) {
  const clone = new Date(date);
  return new Date(clone.setDate(date.getDate() + numDays));
}

interface DayGroup {
  date: Date,
  habits: HabitInstance[]
}

interface PageParams {
  startDate: Date,
  endDate: Date,
  previousWindowStart: Date,
  nextWindowStart: Date,
  displayMode: 'day' | 'week'
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  public pageParams$: Observable<PageParams>;

  public instances$: Observable<DayGroup[]>;

  public next$ = new Subject<void>();
  public previous$ = new Subject<void>();

  constructor(private route: ActivatedRoute,
    private service: HabitService,
    private router: Router,
    private admiralSnackbar: SnackbarService
  ) {
    const displayMode$ = this.route.queryParamMap.pipe(
      map(params => params.get('display')),
      map(display => display != 'day' && display != 'week' ? null : display),
      map(display => display ?? 'week')
    );

    const date$ = this.route.paramMap.pipe(
      map(params => params.get('date')),
      map(date => {
        const match = date && /([0-9]{4})-([0-1][0-9])-([0-3][0-9])/.exec(date);
        if (match) {
          return new Date(+match[1], +match[2] - 1, +match[3]);
        }
        else {
          return midnight(new Date())
        }
      })
    );

    this.pageParams$ = combineLatest([
      displayMode$,
      date$
    ]).pipe(
      map(([displayMode, date]) => {
        const startDate: Date = displayMode === 'week' ? startOfWeek(date) : date;
        const endDate: Date = displayMode === 'week' ? endOfWeek(date) : addDays(date, 1);
        return {
          startDate: startDate,
          endDate: endDate,
          previousWindowStart: addDays(startDate, displayMode === 'week' ? -7 : -1),
          nextWindowStart: addDays(startDate, displayMode === 'week' ? 7 : 1),
          displayMode: displayMode
        };
      })
    );

    this.instances$ = this.pageParams$.pipe(
      switchMap((params) => {
        return this.service.getHabitInstances(params.startDate, params.endDate).pipe(
          map(instances => params.displayMode === 'week'
            ? this.groupByDay(params.startDate, instances)
            : [{
              date: params.startDate,
              habits: instances
            }]
          ),
          catchError(err => {
            this.admiralSnackbar.showError("Error getting habit history.");
            return of(err);
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.next$.pipe(
      withLatestFrom(this.pageParams$)
    ).subscribe(([_, params]) => {
      this.router.navigate([
          '/history',
          this.getDateLinkParam(params.nextWindowStart)
        ], {
          queryParams: {
            display: params.displayMode
          }
      });
    });

    this.previous$.pipe(
      withLatestFrom(this.pageParams$)
    ).subscribe(([_, params]) => {
      this.router.navigate([
          '/history',
          this.getDateLinkParam(params.previousWindowStart)
        ], {
          queryParams: {
            display: params.displayMode
          }
      });
    });
  }

  private groupByDay(startDate: Date, instances: HabitInstance[]): DayGroup[] {
    const groups: DayGroup[] = [];
    let lastDate = startDate;
    for (let i = 0; i < 7; i++) {
      groups.push({
        date: lastDate,
        habits: []
      });
      lastDate = addDays(lastDate, 1);
    }

    for (let instance of instances) {
      const dayStart = midnight(instance.instanceDate);
      let group = groups.find(g => g.date.getTime() == dayStart.getTime());
      if (group) {
        group.habits.push(instance);
      }
      else {
        console.error("Habit instance outside of range:", instance);
      }
    }

    return groups;
  }

  public getDateLinkParam(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key == "ArrowLeft") {
      this.previous$.next();
    }
    else if (event.key == "ArrowRight") {
      this.next$.next();
    }
  }

}
