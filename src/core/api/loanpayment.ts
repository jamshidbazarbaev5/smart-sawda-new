import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface LoanPayment {
  id?: number;
  loan: number;
  store?: number | null;
  amount: string;
  exchange_rate?: string;
  payment_method: { id: number; name: string };
  notes?: string;
  created_at?: string;
}

const LOAN_PAYMENT_URL = 'loan-payments/';

export const {
  useGetResources: useGetLoanPayments,
  useGetResource: useGetLoanPayment,
  useCreateResource: useCreateLoanPayment,
  useUpdateResource: useUpdateLoanPayment,
  useDeleteResource: useDeleteLoanPayment,
} = createResourceApiHooks<LoanPayment>(LOAN_PAYMENT_URL, 'loanpayments');
