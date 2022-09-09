export interface Habit {
    id?: string,
    name: string,
    parentCategoryId: string | null;
    numInstancesToday: number;
}

export interface HabitCategory extends RootCategory {
    color: string | null;
    name: string;
    parentCategoryId: string | null;
}

export interface RootCategory {
    id?: string;
    name?: string;
    habits: string[];
    subCategories: string[];
}

export interface HabitRoot {
    habitDictionary: {[key: string]: Habit};
    categoryDictionary: {[key: string]: HabitCategory};
    root: RootCategory;
}

export interface HabitInstance {
    habitId: string;
}