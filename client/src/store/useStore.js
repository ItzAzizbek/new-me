import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      userId: null,
      user: null,
      plan: null,
      daysUntilBirthday: null,
      bmi: null,
      tdee: null,
      todaysMeals: [],
      todaysCalories: 0,
      workoutStreak: 0,
      
      setUserData: (data) => set({
        userId: data.userId,
        user: data.user,
        plan: data.plan,
        daysUntilBirthday: data.daysUntilBirthday,
        bmi: data.bmi,
        tdee: data.tdee
      }),
      
      addMeal: (meal) => set((state) => {
        const newMeals = [...state.todaysMeals, meal];
        const newCalories = newMeals.reduce((sum, m) => sum + m.estimatedCalories, 0);
        return {
          todaysMeals: newMeals,
          todaysCalories: newCalories
        };
      }),
      
      removeMeal: (mealId) => set((state) => {
        const newMeals = state.todaysMeals.filter(m => m.id !== mealId);
        const newCalories = newMeals.reduce((sum, m) => sum + m.estimatedCalories, 0);
        return {
          todaysMeals: newMeals,
          todaysCalories: newCalories
        };
      }),
      
      setTodaysMeals: (meals) => set({
        todaysMeals: meals,
        todaysCalories: meals.reduce((sum, m) => sum + m.estimatedCalories, 0)
      }),
      
      updateWorkoutStreak: (streak) => set({ workoutStreak: streak }),
      
      clearUserData: () => set({
        userId: null,
        user: null,
        plan: null,
        daysUntilBirthday: null,
        bmi: null,
        tdee: null,
        todaysMeals: [],
        todaysCalories: 0,
        workoutStreak: 0
      })
    }),
    {
      name: 'new-me-storage',
      partialize: (state) => ({
        userId: state.userId,
        user: state.user,
        plan: state.plan,
        daysUntilBirthday: state.daysUntilBirthday,
        bmi: state.bmi,
        tdee: state.tdee
      })
    }
  )
);

export default useStore;
