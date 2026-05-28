import { createResourceApiHooks } from '../helpers/createResourceApi';
import { useMutation } from '@tanstack/react-query';
import api from './api';

export interface User {
  id?: number;
  name: string;
  phone_number: string;
  role: number | null;
  store: number | null;
  password?: string;
  is_active: boolean;
  is_mobile_user: boolean;
  can_view_quantity?: boolean;
  can_view_cost_price?: boolean;
  can_view_profit?: boolean;
  fixed_salary?: string;
  sales_percentage?: string;
  has_active_shift?: boolean;
  is_superuser?: boolean;
  sale_period?: string;
}

const USER_URL = 'users/';

export const {
  useGetResources: useGetUsers,
  useGetResource: useGetUser,
  useCreateResource: useCreateUser,
  useUpdateResource: useUpdateUser,
  useDeleteResource: useDeleteUser,
} = createResourceApiHooks<User>(USER_URL, 'users');

export const useUpdateCurrentUser = () => {
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.patch<User>('users/me/', data);
      return response.data;
    }
  });
};
