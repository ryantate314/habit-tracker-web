import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HabitCategory, RootCategory } from '../models/habit.model';
import { HabitService } from '../services/habit.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.scss']
})
export class HabitsComponent implements OnInit {

  public habits$: Observable<RootCategory> | null = null;

  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    this.habits$ = this.habitService.getHabits();
  }

}
