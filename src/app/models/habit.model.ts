export interface Habit {
    id?: string,
    name: string,
    parentCategoryId: string | null;
}

export interface HabitCategory extends RootCategory {
}

export interface RootCategory {
    habits: Habit[];
    subCategories: HabitCategory[];
    color: string | null;
    name: string;
    id?: string;
    parentCategoryId: string | null;
}