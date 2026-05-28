import { createResourceApiHooks } from "../helpers/createResourceApi";

export interface ClientType {
  id?: number;
  name: string;
  is_system: boolean;
  is_active: boolean;
}

const CLIENT_TYPE_URL = "client-types/";

export const {
  useGetResources: useGetClientTypes,
  useGetResource: useGetClientType,
  useCreateResource: useCreateClientType,
  useUpdateResource: useUpdateClientType,
  useDeleteResource: useDeleteClientType,
} = createResourceApiHooks<ClientType>(CLIENT_TYPE_URL, "client-types");
