import { createResourceApiHooks } from "../helpers/createResourceApi";

// Types
export interface Expense {
  id: number;
  store: number | null;
  store_name?: string;
  shift: number | null;
  category: number | null;
  payment_method: number;
  amount: string;
  currency: { id: number; name: string; symbol: string };
  comment: string;
  date: string;
}

// API endpoints
const EXPENSE_URL = "expenses/";

// Create expense API hooks using the factory function
export const {
  useGetResources: useGetExpenses,
  useGetResource: useGetExpense,
  useCreateResource: useCreateExpense,
  useUpdateResource: useUpdateExpense,
  useDeleteResource: useDeleteExpense,
} = createResourceApiHooks<Expense>(EXPENSE_URL, "expenses");
