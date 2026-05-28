import { createResourceApiHooks } from '../helpers/createResourceApi';

// Types
export interface ChargeType {
  id?: number;
  name: string;
  code?: string;
  is_active?: boolean;
}

// API endpoints
const CHARGE_TYPE_URL = 'charge-types/';

// Create charge type API hooks using the factory function
export const {
  useGetResources: useGetChargeTypes,
  useGetResource: useGetChargeType,
  useCreateResource: useCreateChargeType,
  useUpdateResource: useUpdateChargeType,
  useDeleteResource: useDeleteChargeType,
} = createResourceApiHooks<ChargeType>(CHARGE_TYPE_URL, 'chargeTypes');
