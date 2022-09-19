import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Habit, HabitCategory } from "@app/models/habit.model";
import { HabitService } from "@app/services/habit.service";

export interface DialogData {
    parentCategoryId: string | null;
}

@Component({
    selector: 'app-add-habit-modal',
    templateUrl: 'add-habit-modal.component.html',
})
export class AddHabitModalComponent {

    public addHabitForm: FormGroup;

    constructor(
        fb: FormBuilder,
        public dialogRef: MatDialogRef<AddHabitModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private service: HabitService
    ) {
        this.addHabitForm = fb.group({
            category: 'habit',
            name: ['', [
                Validators.required
            ]]
        });
    }

    public onSubmit() {
        if (this.addHabitForm.get('category')!.value === 'habit') {
            const habit: Habit = {
                name: this.addHabitForm.get('name')!.value,
                numInstancesToday: 0,
                parentCategoryId: this.data.parentCategoryId,
            };
            this.dialogRef.close(
                this.service.createHabit(habit)
            );
        }
        else {
            const category: HabitCategory = {
                name: this.addHabitForm.get('name')!.value,
                color: null,
                parentCategoryId: this.data.parentCategoryId,
                habits: [],
                subCategories: []
            };
            this.dialogRef.close(
                this.service.createCategory(category)
            );
        }
    }
}