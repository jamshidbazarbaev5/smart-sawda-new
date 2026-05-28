import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Penalty {
  id?: number;
  staff: number;
  staff_name?: string;
  store: number;
  penalty_type: string;
  amount: string;
  currency?: number;
  date: string;
  reason?: string;
}

export interface PenaltyCreateInput {
  staff: number;
  store: number;
  penalty_type: string;
  amount: string;
  currency?: number;
  date?: string;
  reason?: string;
}

const PENALTY_URL = 'penalties/';

export const {
  useGetResources: useGetPenalties,
  useGetResource: useGetPenalty,
  useCreateResource: useCreatePenalty,
  useUpdateResource: useUpdatePenalty,
  useDeleteResource: useDeletePenalty,
} = createResourceApiHooks<Penalty>(PENALTY_URL, 'penalties');
