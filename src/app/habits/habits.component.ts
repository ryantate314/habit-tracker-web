import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, withLatestFrom } from 'rxjs';
import { Habit, HabitCategory, HabitRoot, RootCategory } from '../models/habit.model';
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

  public currentCategory$: Observable<RootCategory | HabitCategory>;
  public subCategories$: Observable<HabitCategory[]>;
  public habits$: Observable<Habit[]>;
  public parentCategory$: Observable<RootCategory | HabitCategory | null>;

  private root$: Observable<HabitRoot>;

  @ViewChild("addModal")
  addModal: TemplateRef<any> | undefined;

  addHabitForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private habitService: HabitService,
    private modalService: BsModalService,
    private router: Router,
    fb: FormBuilder,
    private auth: AuthService
  ) {

    this.addHabitForm = fb.group({
      category: 'habit',
      name: ['', [
        Validators.required
      ]]
    });

    this.root$ = this.habitService.habits$;

    const currentCategoryId$: Observable<string | null> = this.route.paramMap.pipe(
      map(params => params.get("id"))
    );

    this.currentCategory$ = combineLatest([
      this.root$,
      currentCategoryId$
    ]).pipe(
      map(([root, categoryId]) => categoryId ?
        root.categoryDictionary[categoryId]
        : root.root
      )
    );

    this.subCategories$ = this.currentCategory$.pipe(
      withLatestFrom(this.root$),
      map(([currentCategory, root]) => currentCategory.subCategories.map(categoryId =>
        root.categoryDictionary[categoryId]
      ))
    );

    this.habits$ = this.currentCategory$.pipe(
      withLatestFrom(this.root$),
      map(([currentCategory, root]) => currentCategory.habits.map(habitId =>
          root.habitDictionary[habitId]
      ))
    );

    this.parentCategory$ = this.currentCategory$.pipe(
      withLatestFrom(this.root$),
      map(([currentCategory, root]) => {
        const castCategory = currentCategory as HabitCategory;
        if (castCategory.parentCategoryId)
          return root.categoryDictionary[castCategory.parentCategoryId];
        else if (currentCategory === root.root)
          return null;
        else
          return root.root;
      })
    );
  };

  ngOnInit(): void {
    this.habitService.getHabits().subscribe();
  }

  ngOnDestroy(): void {
    
  }

  addHabitClick() {
    this.modalRef = this.modalService.show(this.addModal!);
  }

  addHabitSubmit(parentCategoryId: string) {
    // if (this.addHabitForm.valid) {
    //   if (this.addHabitForm.get("category")?.value === "habit") {
    //     const habit: Habit = {
    //       name: this.addHabitForm.get("name")!.value,
    //       parentCategoryId: castParent?.id ?? null
    //     };
    //     this.habitService.createHabit(habit)
    //       .subscribe(habit => {
    //         parent.habits.push(habit.id!);
    //         this.modalRef?.hide();
    //       });
    //   }
    //   else {
    //     this.habitService.createCategory({
    //       name: this.addHabitForm.get("name")!.value,
    //       habits: [],
    //       subCategories: [],
    //       color: null,
    //       parentCategoryId: castParent?.id ?? null
    //     }).subscribe(category => {
    //       parent.subCategories.push(category.id!);
    //       this.modalRef?.hide();
    //     })
    //   }
    // }
  }

  clickHabit(habit: Habit) {

  }

  back(parentCategoryId: string | undefined) {
    if (parentCategoryId)
      this.router.navigate(["habits", parentCategoryId]);
    else
      this.router.navigate(["habits"]);
  }

}
