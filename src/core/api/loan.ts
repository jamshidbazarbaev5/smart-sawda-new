import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Loan {
  id?: number;
  sponsor: number;
  sponsor_name?: string;
  store?: number | null;
  store_name?: string;
  payment_method?: number | null;
  total_amount: string;
  remaining_balance?: string;
  currency?: number | null;
  exchange_rate?: string | null;
  due_date?: string | null;
  is_paid?: boolean;
  notes?: string;
  payments?: LoanPaymentInline[];
  created_at?: string;
  updated_at?: string;
}

export interface LoanPaymentInline {
  id: number;
  loan: number;
  amount: string;
  payment_method: { id: number; name: string };
  notes?: string;
  created_at: string;
}

const LOAN_URL = 'loans/';

export const {
  useGetResources: useGetLoans,
  useGetResource: useGetLoan,
  useCreateResource: useCreateLoan,
  useUpdateResource: useUpdateLoan,
  useDeleteResource: useDeleteLoan,
} = createResourceApiHooks<Loan>(LOAN_URL, 'loans');
