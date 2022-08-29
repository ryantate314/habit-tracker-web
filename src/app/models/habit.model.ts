export interface Habit {
    id?: string,
    name: string
}

export interface HabitCategory extends RootCategory {
    id?: string;
    name: string;
    color?: string;
    habits: Habit[];
    subCategories: HabitCategory[]
}

export interface RootCategory {
    habits: Habit[];
    subCategories: HabitCategory[];
    color?: string;
    name?: string;
}