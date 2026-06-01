import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Sponsor {
  id?: number;
  name: string;
  phone_number: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const SPONSOR_URL = 'sponsors/';

export const {
  useGetResources: useGetSponsors,
  useGetResource: useGetSponsor,
  useCreateResource: useCreateSponsor,
  useUpdateResource: useUpdateSponsor,
  useDeleteResource: useDeleteSponsor,
} = createResourceApiHooks<Sponsor>(SPONSOR_URL, 'sponsors');
