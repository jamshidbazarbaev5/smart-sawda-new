import { createResourceApiHooks } from "../helpers/createResourceApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export interface SaleItemInput {
  product: number;
  variant?: number | null;
  quantity: string;
  selling_unit: number;
  price_per_unit: string;
  discount_amount?: string;
  discount_type?: string;
  discount_rule?: number | null;
}

export interface SalePaymentInput {
  payment_method: number;
  amount: string;
  exchange_rate?: string;
  change_amount?: string;
  reference?: string;
}

export interface SaleCreateInput {
  sale_number?: string;
  order?: number | null;
  store: number;
  shift?: number | null;
  sold_by?: number | null;
  client?: number | null;
  total_amount: string;
  discount_amount?: string;
  final_amount?: string;
  change_amount?: string;
  use_client_balance?: boolean;
  paid_from_balance?: string;
  balance_currency?: number | null;
  on_credit?: boolean;
  is_paid?: boolean;
  exchange_rate?: string;
  coupon?: number | null;
  fiscal_provider?: string;
  comment?: string;
  sale_items: SaleItemInput[];
  sale_payments: SalePaymentInput[];
}

export interface SaleDebt {
  client: number;
  due_date: string;
  deposit?: string | number;
  deposit_payment_method?: string;
  client_read?: {
    id: number;
    name: string;
    phone_number: string;
    address: string;
  };
}

export interface SaleItem {
  stock_read?: any;
  sale_unit?: string;
  selling_unit_name?: string;
  price_per_unit?: string;
  price_with_discount?: string;
  id?: number;
  stock_write?: number;
  stock_name?: string | null;
  product_read?: {
    id: number;
    product_name: string;
    barcode: string;
    ikpu: string;
    category_read?: {
      id: number;
      category_name: string;
    };
    base_unit?: number;
    measurement?: Array<{
      id: number;
      from_unit?: {
        id: number;
        measurement_name: string;
        short_name: string;
      };
      to_unit?: {
        id: number;
        measurement_name: string;
        short_name: string;
      };
      number: string;
    }>;
    available_units?: Array<{
      id: number;
      selling_price: number;
      min_price: number;
      short_name: string;
      factor: number;
      is_base: boolean;
    }>;
  };
  selling_unit?: number;
  selling_method?: "Штук" | "Ед.измерения";
  quantity: string;
  subtotal?: string;
}

export interface SaleRefund {
  id: number;
  store: number;
  refund_items: Array<{
    id: number;
    sale_item: {
      id: number;
      stock_name?: string | null;
      product_read?: {
        id: number;
        product_name: string;
        barcode: string;
        ikpu: string;
        category_read?: {
          id: number;
          category_name: string;
        };
        base_unit?: number;
        measurement?: Array<{
          id: number;
          from_unit?: {
            id: number;
            measurement_name: string;
            short_name: string;
          };
          to_unit?: {
            id: number;
            measurement_name: string;
            short_name: string;
          };
          number: string;
        }>;
        available_units?: Array<{
          id: number;
          short_name: string;
          selling_price: number;
          min_price: number;
          selling_price_in_currency: number;
          factor: number;
          is_base: boolean;
        }>;
      };
      quantity: string;
      selling_unit: number;
      price_per_unit: string;
      subtotal: string;
    };
    quantity: string;
    subtotal: string;
  }>;
  refund_payments?: Array<{
    payment_method: number;
    amount: string;
  }>;
  total_refund_amount: string;
  notes: string;
  refunded_by: number;
  created_at: string;
}

export interface Sale {
  comment?: string;
  id?: number;
  use_client_balance: boolean;
  sale_id?: string;
  discount_amount?: string;
  store?: number;
  store_read?: {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    created_at: string;
    is_main: boolean;
    parent_store: number | null;
    owner: number;
  };
  payment_method: number;
  sale_items: SaleItem[];
  on_credit: boolean;
  is_paid?: boolean;
  sale_debt?: SaleDebt;
  debt_currency?: "UZS" | "USD";
  debt_usd_rate?: string | number;
  total_amount: string;
  total_pure_revenue?: string;
  charges_total?: string;
  change_amount?: string;
  sale_charges?: {
    id?: number;
    charge_type: number;
    charge_type_name?: string;
    amount: string;
  }[];
  sale_payments?:
    | {
        payment_method: number;
        amount: string;
        change_amount?: string;
      }[]
    | undefined;
  sale_refunds?: SaleRefund[];
  client?: number;
  created_at?: string;
  sold_date?: string;
  worker_read?: any;
  sale_number?: string;
  fiscal_provider?: string;
  balance_currency?: number | null;
  paid_from_balance?: string;
  final_amount?: string;
}

const SALE_URL = "sales/";

const { useUpdateResource: useUpdateSale, useDeleteResource: useDeleteSale } =
  createResourceApiHooks<Sale>(SALE_URL, "sales");

const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSale: SaleCreateInput) => {
      const response = await api.post<Sale>(SALE_URL, newSale);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export interface SalesResponse {
  results: Sale[];
  count: number;
  total_sum_all: number;
  total_sum_page: number;
  total_payments_all: Record<string, number>;
  total_payments_page: Record<string, number>;
  total_debt_sum: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  page_range: number[];
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    previous: string | null;
  };
}

export const useGetSales = (options?: { params?: Record<string, any> }) => {
  return useQuery({
    queryKey: ["sales", options?.params],
    queryFn: async () => {
      const response = await api.get<Sale[] | SalesResponse>(SALE_URL, {
        params: options?.params,
      });
      return response.data;
    },
  });
};

export const useGetSale = (id: number) => {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      const response = await api.get<Sale>(`${SALE_URL}${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGetSaleDebt = (saleId: number) => {
  return useQuery({
    queryKey: ["sales", saleId, "debt"],
    queryFn: async () => {
      const response = await api.get<{ remaining_debt_amount: number }>(
        `${SALE_URL}${saleId}/debt`
      );
      return response.data;
    },
    enabled: !!saleId,
  });
};

export { useCreateSale, useUpdateSale, useDeleteSale };
