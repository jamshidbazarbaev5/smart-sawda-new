import { createResourceApiHooks } from "../helpers/createResourceApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import { toast } from "sonner";

export interface CustomerBalance {
  currency: {
    id: number;
    name: string;
    symbol: string;
  };
  amount: string;
}

export interface CustomerDebt {
  currency: number;
  currency_code?: string;
  amount: string;
}

export interface Customer {
  id: number;
  name: string;
  company_name: string;
  phone_number: string;
  email: string;
  customer_type: number | null;
  customer_type_name?: string;
  credit_limit: string;
  discount_percent: string;
  price_list: number | null;
  tax_id: string;
  date_of_birth: string | null;
  telegram_id: number | null;
  source: string;
  stores: number[];
  balances: CustomerBalance[];
  debts: CustomerDebt[];
  address: string;
  notes: string;
  tags: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerDTO {
  name: string;
  phone_number: string;
  customer_type: number | null;
  company_name?: string;
  email?: string;
  credit_limit?: string;
  discount_percent?: string;
  price_list?: number | null;
  tax_id?: string;
  date_of_birth?: string | null;
  telegram_id?: number | null;
  source?: string;
  stores?: number[];
  address?: string;
  notes?: string;
  tags?: string[];
  is_active?: boolean;
}

export type UpdateCustomerDTO = CreateCustomerDTO;

const CUSTOMER_URL = "customers/";

export const {
  useGetResources: useGetCustomers,
  useCreateResource: useCreateCustomer,
  useUpdateResource: useUpdateCustomer,
  useDeleteResource: useDeleteCustomer,
} = createResourceApiHooks<Customer>(CUSTOMER_URL, "customers");

export const useGetCustomer = (id: number) => {
  const { useGetResource } = createResourceApiHooks<Customer>(CUSTOMER_URL, "customers");
  return useGetResource(id);
};

export const useTopupBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      amount,
      store,
      payment_method,
      currency,
    }: {
      id: number;
      amount: number;
      store: number;
      payment_method: number;
      currency: number;
    }) => {
      const response = await api.post(`${CUSTOMER_URL}${id}/topup-balance/`, {
        amount,
        store,
        payment_method,
        currency,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Balance topped up successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to top up balance");
    },
  });
};

export const useCashoutBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      amount,
      store,
      payment_method,
      currency,
    }: {
      id: number;
      amount: number;
      store: number;
      payment_method: number;
      currency: number;
    }) => {
      const response = await api.post(`${CUSTOMER_URL}${id}/cashout-balance/`, {
        amount,
        store,
        payment_method,
        currency,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Balance cashed out successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to cash out balance");
    },
  });
};
