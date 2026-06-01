import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export interface Vehicle {
  id?: number;
  name: string;
  plate_number: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const VEHICLE_URL = 'vehicles/';

export const {
  useGetResources: useGetVehicles,
  useGetResource: useGetVehicle,
  useCreateResource: useCreateVehicle,
  useUpdateResource: useUpdateVehicle,
  useDeleteResource: useDeleteVehicle,
} = createResourceApiHooks<Vehicle>(VEHICLE_URL, 'vehicles');

export const fetchVehicleDetails = async (id: number): Promise<Vehicle> => {
  const response = await api.get<Vehicle>(`${VEHICLE_URL}${id}/`);
  return response.data;
};

export const patchVehicle = async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.patch<Vehicle>(`${VEHICLE_URL}${id}/`, data);
  return response.data;
};
