import { useQuery } from "@tanstack/react-query";
import api from "./api";

export interface Tenant {
  id: string;
  name: string;
  business_type: string;
  base_currency_code: string;
  subscription_status: string;
}

export interface FeatureFlags {
  has_variants: boolean;
  has_expiry: boolean;
  has_serial: boolean;
  has_weight: boolean;
  flexible_units: boolean;
  has_articles: boolean;
  has_delivery: boolean;
  has_imei: boolean;
  has_recycling: boolean;
  has_fiscal: boolean;
  has_multi_currency: boolean;
  has_loyalty: boolean;
  has_notifications: boolean;
}

export interface MenuPermissions {
  dashboard: boolean;
  pos: boolean;
  stocks: boolean;
  sales_list: boolean;
  customers: boolean;
  debts: boolean;
  refunds: boolean;
  stock_entries: boolean;
  movements: boolean;
  suppliers: boolean;
  transfers: boolean;
  recyclings: boolean;
  revaluations: boolean;
  writeoffs: boolean;
  expenses: boolean;
  incomes: boolean;
  cash_inflows: boolean;
  shifts: boolean;
  sponsors: boolean;
  drivers: boolean;
  installment_plans: boolean;
  report_sales: boolean;
  report_profit: boolean;
  report_stock: boolean;
  report_debts: boolean;
  report_staff: boolean;
  users: boolean;
  roles: boolean;
  staff_payroll: boolean;
  stores: boolean;
  categories: boolean;
  products: boolean;
  units: boolean;
  currencies: boolean;
  payment_methods: boolean;
  client_types: boolean;
  receipt_templates: boolean;
  label_sizes: boolean;
  charge_types: boolean;
  expense_categories: boolean;
  writeoff_reasons: boolean;
  loyalty_programs: boolean;
}

export interface FrontendConfig {
  tenant: Tenant;
  feature_flags: FeatureFlags;
  is_admin: boolean;
  menu: MenuPermissions;
}

export function useFrontendConfig() {
  return useQuery<FrontendConfig>({
    queryKey: ["frontend-config"],
    queryFn: async () => {
      const response = await api.get<FrontendConfig>("config/frontend-config/");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
