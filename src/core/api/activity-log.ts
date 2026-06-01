import { useQuery } from '@tanstack/react-query';
import api from './api';

export type ActivityLogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'void'
  | 'login'
  | 'logout';

export interface ActivityLog {
  id: number;
  user: number | null;
  user_name: string;
  action: ActivityLogAction | string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  store: number | null;
  store_name: string;
  description: string;
  changes: Record<string, any>;
  snapshot: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export interface ActivityLogPaginatedResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_range: number[];
  next: string | null;
  previous: string | null;
  results: ActivityLog[];
}

export interface ActivityLogListParams {
  page?: number;
  page_size?: number;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  store?: number;
  user?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
}

const ACTIVITY_LOG_URL = 'activity-logs/';

export const useGetActivityLogs = (params: ActivityLogListParams) => {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      if (params.page) queryParams.page = params.page;
      if (params.page_size) queryParams.page_size = params.page_size;
      if (params.action && params.action !== 'all') queryParams.action = params.action;
      if (params.resource_type && params.resource_type !== 'all') queryParams.resource_type = params.resource_type;
      if (params.resource_id) queryParams.resource_id = params.resource_id;
      if (params.store) queryParams.store = params.store;
      if (params.user) queryParams.user = params.user;
      if (params.date_from) queryParams.date_from = params.date_from;
      if (params.date_to) queryParams.date_to = params.date_to;
      if (params.search) queryParams.search = params.search;
      if (params.ordering) queryParams.ordering = params.ordering;

      const response = await api.get<ActivityLogPaginatedResponse>(
        ACTIVITY_LOG_URL,
        { params: queryParams },
      );
      return response.data;
    },
  });
};

export const useGetActivityLog = (id: number | undefined) => {
  return useQuery({
    queryKey: ['activity-log', id],
    queryFn: async () => {
      const response = await api.get<ActivityLog>(`${ACTIVITY_LOG_URL}${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const RESOURCE_TYPES = [
  'Sale',
  'Product',
  'Stock',
  'StockEntry',
  'Debt',
  'POSShift',
  'Refund',
  'Transfer',
  'WriteOff',
  'Customer',
  'Supplier',
  'Order',
] as const;

export const ACTION_TYPES: ActivityLogAction[] = [
  'create',
  'update',
  'delete',
  'approve',
  'void',
  'login',
  'logout',
];
