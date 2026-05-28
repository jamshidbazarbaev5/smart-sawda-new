import { createResourceApiHooks } from '../helpers/createResourceApi';

// Types
export interface Income {
  id: number;
  store: number;
  store_name: string;
  shift: number | null;
  worker: number;
  sale: number | null;
  debt_payment: number | null;
  total_amount: string;
  timestamp: string;
  description: string;
  payments: Array<{
    id: number;
    payment_method: {
      id: number;
      name: string;
      currency: { id: number; name: string; symbol: string };
    };
    amount: string;
  }>;
  created_at: string;
  updated_at: string;
}

// API endpoints
const INCOME_URL = 'incomes/';

// Create income API hooks using the factory function
export const {
  useGetResources: useGetIncomes,
  useGetResource: useGetIncome,
  useCreateResource: useCreateIncome,
  useUpdateResource: useUpdateIncome,
  useDeleteResource: useDeleteIncome,
} = createResourceApiHooks<Income>(INCOME_URL, 'incomes');
