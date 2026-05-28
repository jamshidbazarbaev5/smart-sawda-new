import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface StoreBudget {
  id: number;
  budget_type: string;
  amount: string;
}

export interface Store {
  id?: number;
  name: string;
  address: string;
  phone_number: string;
  is_main: boolean;
  is_active: boolean;
  budgets?: StoreBudget[];
  created_at?: string;
  updated_at?: string;
  // backward compat
  budget?: string;
  color?: string;
  parent_store?: number | null;
  owner?: number;
}

const STORE_URL = 'stores/';

export const {
  useGetResources: useGetStores,
  useGetResource: useGetStore,
  useCreateResource: useCreateStore,
  useUpdateResource: useUpdateStore,
  useDeleteResource: useDeleteStore,
} = createResourceApiHooks<Store>(STORE_URL, 'stores');
