import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Measurement {
  id?: number;
  name: string;
  short_name?: string;
  is_system?: boolean;
  is_active?: boolean;
  measurement_name?: string;
}

const MEASUREMENT_URL = 'units/';

export const {
  useGetResources: useGetMeasurements,
  useGetResource: useGetMeasurement,
  useCreateResource: useCreateMeasurement,
  useUpdateResource: useUpdateMeasurement,
  useDeleteResource: useDeleteMeasurement,
} = createResourceApiHooks<Measurement>(MEASUREMENT_URL, 'measurements');
