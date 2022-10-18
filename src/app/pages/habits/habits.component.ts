import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, filter, map, Observable, switchMap, withLatestFrom } from 'rxjs';
import { Habit, HabitCategory, HabitInstance, HabitRoot, RootCategory } from '@app/models/habit.model';
import { HabitService } from '@app/services/habit.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/services/auth.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddHabitModalComponent, DialogData } from './add-habit-modal.component';

interface ContextMenuData {
  type: 'Habit' | 'Category',
  habit?: Habit,
  category?: HabitCategory
}

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.scss']
})
export class HabitsComponent implements OnInit, OnDestroy {

  public currentCategory$: Observable<RootCategory | HabitCategory>;
  public subCategories$: Observable<HabitCategory[]>;
  public habits$: Observable<Habit[]>;
  public parentCategory$: Observable<RootCategory | HabitCategory | null>;

  public breadCrumbs$: Observable<HabitCategory[]>;

  private root$: Observable<HabitRoot>;

  /**
   * Context menu trigger for habits/categories
   */
  @ViewChild(MatMenuTrigger, { static: true})
  public menuTrigger?: MatMenuTrigger;
  public menuTopLeftPosition = { x: "0px", y: "0px" };

  constructor(
    private route: ActivatedRoute,
    private habitService: HabitService,
    private router: Router,
    fb: FormBuilder,
    private dialog: MatDialog,
    private auth: AuthService
  ) {
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

    this.breadCrumbs$ = this.currentCategory$.pipe(
      withLatestFrom(this.root$),
      map(([currentCategory, root]) => {
        let crumbs = [];
        while (currentCategory && currentCategory != root.root) {
          const castCategory = currentCategory as HabitCategory;
          crumbs.push(castCategory);
          const parentCategory = root.categoryDictionary[castCategory.parentCategoryId!];
          currentCategory = parentCategory;
        }
        return crumbs.reverse();
      })
    );
  };

  ngOnInit(): void {
    this.habitService.getHabits().subscribe();
  }

  ngOnDestroy(): void {
    
  }

  addHabitClick(category: HabitCategory | RootCategory) {
    const data: DialogData = {
      parentCategoryId: category.id ?? null
    };
    const dialogRef = this.dialog.open(AddHabitModalComponent, {
      panelClass: 'mat-dialog-md',
      data: data
    });

    // The dialog returns an observable
    dialogRef.afterClosed().pipe(
      filter(x => !!x),
      switchMap((createTask: Observable<any>) => createTask)
    ).subscribe(() => {

    });
  }

  deleteHabit(habit: Habit) {

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

  editHabit(habit: Habit) {
    
  }

  editCategory(category: HabitCategory) {

  }

  clickHabit(habit: Habit) {
    const instance: HabitInstance = {
      habitId: habit.id!,
      instanceDate: new Date()
    };

    this.habitService.logHabit(instance)
      .subscribe(() => {

      });
  }

  onHabitRightClick(event: MouseEvent, habit: Habit) {
    event.preventDefault();

    this.menuTopLeftPosition.x = event.clientX + "px";
    this.menuTopLeftPosition.y = event.clientY + "px";

    const menuData: ContextMenuData = {
      habit: habit,
      type: 'Habit'
    };
    this.menuTrigger!.menuData = { data: menuData };

    this.menuTrigger!.openMenu();
  }

  onCategoryRightClick(event: MouseEvent, category: HabitCategory) {
    event.preventDefault();

    this.menuTopLeftPosition.x = event.clientX + "px";
    this.menuTopLeftPosition.y = event.clientY + "px";

    const menuData: ContextMenuData = {
      category: category,
      type: 'Category'
    };
    this.menuTrigger!.menuData = { data: menuData };

    this.menuTrigger!.openMenu();
  }

  back(parentCategoryId: string | undefined) {
    if (parentCategoryId)
      this.router.navigate(["habits", parentCategoryId]);
    else
      this.router.navigate(["habits"]);
  }

  removeLastInstance(habit: Habit) {
    this.habitService.removeLastInstance(habit.id!)
      .subscribe(() => {});
  }

}
