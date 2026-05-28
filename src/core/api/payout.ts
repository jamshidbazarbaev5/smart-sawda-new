import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export type PayoutType = 'salary' | 'bonus' | 'penalty' | 'advance';

export interface Payout {
  id?: number;
  staff: number;
  staff_name?: string;
  store?: number;
  payout_type: PayoutType;
  period_year: number;
  period_month: number;
  base_salary?: string;
  bonus_amount?: string;
  penalty_amount?: string;
  total_amount: string;
  payment_method?: number;
  currency?: number;
  paid_at?: string | number | null;
  notes?: string;
}

const PAYOUT_URL = 'payouts/';

export const {
  useGetResources: useGetPayouts,
  useGetResource: useGetPayout,
  useCreateResource: useCreatePayout,
  useUpdateResource: useUpdatePayout,
  useDeleteResource: useDeletePayout,
} = createResourceApiHooks<Payout>(PAYOUT_URL, 'payouts');

export const fetchPayoutDetails = async (id: number): Promise<Payout> => {
  const response = await api.get<Payout>(`${PAYOUT_URL}${id}/`);
  return response.data;
};

export const patchPayout = async (id: number, data: Partial<Payout>): Promise<Payout> => {
  const response = await api.patch<Payout>(`${PAYOUT_URL}${id}/`, data);
  return response.data;
};
