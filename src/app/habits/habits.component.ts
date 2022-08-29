import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Habit, HabitCategory, RootCategory } from '../models/habit.model';
import { HabitService } from '../services/habit.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.scss']
})
export class HabitsComponent implements OnInit, OnDestroy {

  breadCrumbs: RootCategory[] = [];

  // public get breadCrumbs(): string[] {
  //   return this._breadCrumbs
  //     .filter(crumb => crumb.name)
  //     .map(crumb => crumb.name!);
  // }

  public habits: RootCategory | null = null;

  private root: RootCategory | null = null;

  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    console.log("Getting habits");
    
    this.habitService.getHabits().subscribe(root => {
      this.root = root;
      this.habits = root;
    });
  }

  ngOnDestroy(): void {
    
  }

  openCategory(category: HabitCategory) {
    this.breadCrumbs.push(category!);
    this.habits = category;
  }

  addHabit() {

  }

  clickHabit(habit: Habit) {

  }

  back() {
    if (this.breadCrumbs.length > 0)
      this.breadCrumbs.pop()!;
    if (this.breadCrumbs.length == 0)
      this.habits = this.root;
    else
      this.habits = this.breadCrumbs[this.breadCrumbs.length - 1];
  }

}
