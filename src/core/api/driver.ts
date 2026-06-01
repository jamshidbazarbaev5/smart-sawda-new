import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export interface Driver {
  id?: number;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const DRIVER_URL = 'drivers/';

export const {
  useGetResources: useGetDrivers,
  useGetResource: useGetDriver,
  useCreateResource: useCreateDriver,
  useUpdateResource: useUpdateDriver,
  useDeleteResource: useDeleteDriver,
} = createResourceApiHooks<Driver>(DRIVER_URL, 'drivers');

export const fetchDriverDetails = async (id: number): Promise<Driver> => {
  const response = await api.get<Driver>(`${DRIVER_URL}${id}/`);
  return response.data;
};

export const patchDriver = async (id: number, data: Partial<Driver>): Promise<Driver> => {
  const response = await api.patch<Driver>(`${DRIVER_URL}${id}/`, data);
  return response.data;
};
