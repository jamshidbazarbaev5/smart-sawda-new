import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Role {
  id: number;
  name: string;
  code: string;
  is_system: boolean;
  permissions: Record<string, boolean>;
  is_admin: boolean;
  is_active: boolean;
}

const ROLE_URL = 'roles/';

export const {
  useGetResources: useGetRoles,
} = createResourceApiHooks<Role>(ROLE_URL, 'roles');
