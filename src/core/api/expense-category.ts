import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface ExpenseCategory {
  id?: number;
  name: string;
  is_system?: boolean;
  is_active?: boolean;
}

const URL = 'expense-categories/';

export const {
  useGetResources: useGetExpenseCategories,
  useGetResource: useGetExpenseCategory,
  useCreateResource: useCreateExpenseCategory,
  useUpdateResource: useUpdateExpenseCategory,
  useDeleteResource: useDeleteExpenseCategory,
} = createResourceApiHooks<ExpenseCategory>(URL, 'expense-categories');
