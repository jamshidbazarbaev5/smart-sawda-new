import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Shift {
  id?: number;
  store: number;
  store_name?: string;
  register: number;
  cashier: number;
  cashier_name?: string;
  opened_at: string;
  closed_at?: string | null;
  opening_cash: string;
  closing_cash?: string;
  opening_comment?: string;
  closing_comment?: string;
  is_active: boolean;
  is_awaiting_approval: boolean;
  is_approved: boolean;
}

export interface ShiftCreateInput {
  store: number;
  register: number;
  cashier: number;
  opening_cash: string;
  opening_comment?: string;
}

export interface CloseShiftInput {
  closing_cash: string;
  closing_comment?: string;
}

const SHIFT_URL = 'shifts/';

export const {
  useGetResources: useGetShifts,
  useGetResource: useGetShift,
  useCreateResource: useCreateShift,
  useUpdateResource: useUpdateShift,
  useDeleteResource: useDeleteShift,
} = createResourceApiHooks<Shift>(SHIFT_URL, 'shifts');

export const useApproveShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`${SHIFT_URL}${id}/approve/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const useCloseShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CloseShiftInput }) => {
      const response = await api.post(`${SHIFT_URL}${id}/close/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

// --- v1 backward compatibility ---

export interface Store {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  budget: string;
  created_at: string;
  is_main: boolean;
  color: string;
  parent_store: number | null;
}

export interface Cashier {
  id: number;
  name: string;
  phone_number: string;
  role: string;
}

export interface Register {
  id: number;
  store: Store;
  name: string;
  is_active: boolean;
  last_opened_at: string | null;
  current_budget?: string;
  last_closing_cash: number;
}

export interface Payment {
  id: number;
  payment_method: string;
  income: string;
  expense: string;
  expected: string;
  actual: string;
}

export interface ShiftV1 {
  id: number;
  store: Store;
  register: Register;
  cashier: Cashier;
  total_expected: string;
  total_actual: string;
  total_sales_amount: number;
  total_debt_amount: number;
  total_sales_count: number;
  total_returns_amount: number;
  total_returns_count: number;
  total_income: number;
  total_expense: number;
  opened_at: string;
  closed_at: string | null;
  opening_cash: string;
  closing_cash: string | null;
  opening_comment: string | null;
  closing_comment: string | null;
  approval_comment: string | null;
  is_active: boolean;
  is_awaiting_approval: boolean;
  is_approved: boolean;
  approved_by: number | null;
  payments: Payment[];
  summary_data?: ShiftSummary;
}

export interface OpenShiftData {
  store: number;
  register_id: number;
  opening_cash: string;
  comment?: string;
}

export interface ShiftCreateData {
  store: number;
  register: number;
  cashier: number;
  opened_at: string;
  opening_cash: string;
  opening_comment?: string;
}

export interface ShiftUpdateData extends Partial<ShiftCreateData> {
  closed_at?: string;
  closing_cash?: string;
  opening_comment?: string;
  closing_comment?: string;
  approval_comment?: string;
  total_expected?: string;
  total_actual?: string;
  is_active?: boolean;
  is_awaiting_approval?: boolean;
  is_approved?: boolean;
  approved_by?: number;
  payments?: Payment[];
}

export interface ShiftSummaryPayment {
  payment_method: string;
  payment_method_display: string;
  income: number;
  expense: number;
  expected: number;
  actual: number;
}

export interface PaymentByType {
  payment_method: string;
  amount: number;
}

export interface PaymentSummary {
  total: number;
  total_in_usd: number;
  by_type: PaymentByType[];
}

export interface DepositClient {
  client_name: string;
  deposit: number;
  deposit_payment_method: string;
}

export interface DebtClient {
  client_name: string;
  amount: number;
  payment_method: string;
}

export interface ShiftSummary {
  shift_id: number;
  cashier: string;
  store: string;
  opened_at: string;
  closed_at: string | null;
  total_sales_count: number;
  total_sales_amount: number;
  total_debt_amount: number;
  total_returns_count: number;
  total_returns_amount: number;
  sales_payments: PaymentSummary;
  deposit_payments: PaymentSummary;
  debt_payments: PaymentSummary;
  expenses: PaymentSummary;
  remaining: PaymentSummary;
  debt_clients: DebtClient[];
  deposit_clients: DepositClient[];
}

export interface CloseShiftPayment {
  payment_method: string;
  actual: number;
}

export interface CloseShiftDataV1 {
  payments: CloseShiftPayment[];
  closing_cash: number;
  closing_comment: string;
}

export interface ShiftResponse {
  results: ShiftV1[];
  count: number;
  links: { first: string | null; last: string | null; next: string | null; previous: string | null };
  total_pages: number;
  current_page: number;
  page_range: number[];
  page_size: number;
}

const BASE_URL = "pos/pos-shifts/";
const OPEN_SHIFT_URL = "pos/pos-shifts/open/";

export const shiftsApi = {
  getAll: (params?: {
    store?: number; register?: number; cashier?: number;
    approved_by?: number; is_active?: boolean; is_approved?: boolean; is_awaiting_approval?: boolean;
  }) => api.get<ShiftResponse>(BASE_URL, { params }),
  getById: (id: number) => api.get<ShiftV1>(`${BASE_URL}${id}/`),
  create: (data: ShiftCreateData) => api.post<ShiftV1>(BASE_URL, data),
  update: (id: number, data: ShiftUpdateData) => api.patch<ShiftV1>(`${BASE_URL}${id}/`, data),
  delete: (id: number) => api.delete(`${BASE_URL}${id}/`),
  openShift: (data: { opening_cash: string; opening_comment: string; store: number; register_id: number }) =>
    api.post<ShiftV1>(OPEN_SHIFT_URL, data),
  getSummary: (id: number) => api.get<ShiftSummary>(`${BASE_URL}${id}/summary/`),
  closeShift: (id: number, data: CloseShiftDataV1) => api.post<ShiftV1>(`${BASE_URL}${id}/close/`, data),
};
