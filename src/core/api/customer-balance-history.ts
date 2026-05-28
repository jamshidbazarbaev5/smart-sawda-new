import { useQuery } from "@tanstack/react-query";
import api from "./api";

export interface BalanceHistoryCurrency {
  id: number;
  name: string;
  symbol: string;
}

export interface CustomerBalanceHistoryEntry {
  id: number;
  customer: number;
  customer_name: string;
  type: "topup" | "cashout" | "adjustment" | "payment" | "refund";
  payment_method: number | null;
  currency: BalanceHistoryCurrency;
  amount: string;
  previous_balance: string;
  new_balance: string;
  sale: number | null;
  store: number;
  worker: number;
  notes: string;
  created_at: string;
}

export interface BalanceHistoryParams {
  customer?: number;
  date_from?: string;
  date_to?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  page_range: number[];
  next: string | null;
  previous: string | null;
  results: T[];
}

const BALANCE_HISTORY_URL = "customer-balance-history/";

export const useGetCustomerBalanceHistory = (params?: BalanceHistoryParams) => {
  return useQuery({
    queryKey: ["customer-balance-history", params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<CustomerBalanceHistoryEntry>>(
        BALANCE_HISTORY_URL,
        { params },
      );
      return response.data;
    },
  });
};
