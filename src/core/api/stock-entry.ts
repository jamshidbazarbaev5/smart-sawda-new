import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface StockEntryStockLotInput {
  product: number;
  variant: number | null;
  quantity: string;
  purchase_unit: number;
  cost_per_unit: string;
  batch_number?: string;
  expiry_date?: string | null;
}

export interface StockEntryCreateInput {
  entry_number?: string | null;
  supplier?: number | null;
  store: number;
  currency?: number | null;
  rate_at_purchase?: string;
  total_amount?: string;
  is_debt?: boolean;
  is_inventory_adjustment?: boolean;
  note?: string;
  stocks: StockEntryStockLotInput[];
}

export interface StockEntry {
  id?: number;
  entry_number?: string | null;
  supplier?: number | null;
  supplier_name?: string;
  store?: number;
  store_name?: string;
  total_amount?: string;
  total_paid?: string;
  currency?: { id: number; name: string; symbol: string } | null;
  rate_at_purchase?: string;
  is_debt?: boolean;
  is_inventory_adjustment?: boolean;
  date_arrived?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

const STOCK_ENTRY_URL = 'stock-entries/';

export const {
  useGetResources: useGetStockEntries,
  useGetResource: useGetStockEntry,
  useCreateResource: useCreateStockEntry,
  useUpdateResource: useUpdateStockEntry,
  useDeleteResource: useDeleteStockEntry,
} = createResourceApiHooks<StockEntryCreateInput>(STOCK_ENTRY_URL, 'stock-entries');
