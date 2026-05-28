import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface WriteoffReason {
  id?: number;
  name: string;
  is_system?: boolean;
  is_active?: boolean;
}

const URL = 'writeoff-reasons/';

export const {
  useGetResources: useGetWriteoffReasons,
  useGetResource: useGetWriteoffReason,
  useCreateResource: useCreateWriteoffReason,
  useUpdateResource: useUpdateWriteoffReason,
  useDeleteResource: useDeleteWriteoffReason,
} = createResourceApiHooks<WriteoffReason>(URL, 'writeoff-reasons');
