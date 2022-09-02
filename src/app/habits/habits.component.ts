import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Habit, HabitCategory, RootCategory } from '../models/habit.model';
import { HabitService } from '../services/habit.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.scss']
})
export class HabitsComponent implements OnInit, OnDestroy {

  breadCrumbs: RootCategory[] = [];

  modalRef: BsModalRef | null = null;

  public habits: RootCategory | null = null;

  private root: RootCategory | null = null;

  @ViewChild("addModal")
  addModal: TemplateRef<any> | undefined;

  addHabitForm: FormGroup;

  constructor(private habitService: HabitService, private modalService: BsModalService, fb: FormBuilder, private auth: AuthService) {
    this.addHabitForm = fb.group({
      category: 'habit',
      name: ['', [
        Validators.required
      ]]
    });
  }

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

  addHabitClick() {
    this.modalRef = this.modalService.show(this.addModal!);
  }

  addHabitSubmit() {
    ((parent) => {
      if (this.addHabitForm.valid) {
        if (this.addHabitForm.get("category")?.value === "habit") {
          const habit: Habit = {
            name: this.addHabitForm.get("name")!.value,
            parentCategoryId: parent.id ?? null
          };
          this.habitService.createHabit(habit)
            .subscribe(habit => {
              parent.habits.push(habit);
              this.modalRef?.hide();
            });
        }
        else {
          this.habitService.createCategory({
            name: this.addHabitForm.get("name")!.value,
            habits: [],
            subCategories: [],
            color: null,
            parentCategoryId: parent.id ?? null
          }).subscribe(category => {
            parent.subCategories.push(category);
            this.modalRef?.hide();
          })
        }
      }
    })(this.habits!);
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

  logout() {
    this.auth.logout();
  }

}
