import { useNavigate } from 'react-router-dom';
import { ResourceForm } from '../helpers/ResourceForm';
import { useTranslation } from 'react-i18next';
import { useGetStores } from '../api/store';
import { useGetRoles } from '../api/role';
import { toast } from 'sonner';
import { useCreateUser } from '../api/user';

interface UserFormData {
  name: string;
  phone_number: string;
  role: number;
  password: string;
  store: number;
  can_view_quantity: boolean;
  can_view_cost_price: boolean;
  can_view_profit: boolean;
  fixed_salary?: string;
  sales_percentage?: string;
  is_active: boolean;
  is_mobile_user: boolean;
}

export default function CreateUser() {
  const navigate = useNavigate();
  const createStaff = useCreateUser();
  const { t } = useTranslation();
  const { data: storesData } = useGetStores({});
  const { data: rolesData } = useGetRoles({});
  const stores = Array.isArray(storesData) ? storesData : storesData?.results || [];
  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.results || [];

  const formatUzPhone = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    return '+998' + digits;
  };

  const userFields = [
    {
      name: 'name',
      label: t('forms.name'),
      type: 'text',
      placeholder: t('placeholders.enter_name'),
      required: true,
    },
    {
      name: 'phone_number',
      label: t('forms.phone'),
      type: 'text',
      placeholder: '+998970953905',
      required: true,
      onChange: (value: string) => formatUzPhone(value),
      maxLength: 13,
      inputMode: 'numeric',
      autoComplete: 'tel',
    },
    {
      name: 'role',
      label: t('forms.role'),
      type: 'select',
      placeholder: t('placeholders.select_role'),
      required: true,
      options: roles.map((r: any) => ({ value: r.id, label: r.name })),
    },
    {
      name: 'password',
      label: t('forms.password'),
      type: 'text',
      placeholder: t('placeholders.enter_password'),
      required: true,
    },
    {
      name: 'store',
      label: t('forms.store'),
      type: 'select',
      placeholder: t('placeholders.select_store'),
      required: true,
      options: stores.map(store => ({ value: store.id, label: store.name })),
    },
    {
      name: 'is_active',
      label: t('forms.status'),
      type: 'select',
      placeholder: t('placeholders.select_status'),
      required: true,
      defaultValue: true,
      options: [
        { value: true, label: t('common.active') },
        { value: false, label: t('common.inactive') },
      ],
    },
    {
      name: 'is_mobile_user',
      label: t('forms.is_mobile_user'),
      type: 'select',
      placeholder: t('placeholders.select_device'),
      required: true,
      defaultValue: true,
      options: [
        { value: true, label: t('common.mobile') },
        { value: false, label: t('common.desktop') },
      ],
    },
    {
      name: 'can_view_quantity',
      label: t('forms.can_view_quantity'),
      type: 'select',
      placeholder: t('placeholders.select_permission'),
      required: true,
      defaultValue: true,
      options: [
        { value: true, label: t('common.yes') },
        { value: false, label: t('common.no') },
      ],
    },
    {
      name: 'can_view_cost_price',
      label: t('forms.can_view_cost_price'),
      type: 'select',
      placeholder: t('placeholders.select_permission'),
      required: true,
      defaultValue: true,
      options: [
        { value: true, label: t('common.yes') },
        { value: false, label: t('common.no') },
      ],
    },
    {
      name: 'can_view_profit',
      label: t('forms.can_view_profit'),
      type: 'select',
      placeholder: t('placeholders.select_permission'),
      required: true,
      defaultValue: true,
      options: [
        { value: true, label: t('common.yes') },
        { value: false, label: t('common.no') },
      ],
    },
    {
      name: 'fixed_salary',
      label: t('forms.fixed_salary'),
      type: 'text',
      placeholder: t('placeholders.enter_salary'),
    },
    {
      name: 'sales_percentage',
      label: t('forms.sales_percentage'),
      type: 'text',
      placeholder: t('placeholders.enter_percentage'),
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      const staffData = {
        name: data.name,
        phone_number: data.phone_number,
        role: Number(data.role),
        password: data.password,
        store: Number(data.store),
        is_mobile_user: data.is_mobile_user === "true" || data.is_mobile_user === true,
        is_active: data.is_active === "true" || data.is_active === true,
        can_view_quantity: data.can_view_quantity === "true" || data.can_view_quantity === true,
        can_view_cost_price: data.can_view_cost_price === "true" || data.can_view_cost_price === true,
        can_view_profit: data.can_view_profit === "true" || data.can_view_profit === true,
        fixed_salary: data.fixed_salary || undefined,
        sales_percentage: data.sales_percentage || undefined,
      };

      await createStaff.mutateAsync(staffData as any);
      toast.success(t('messages.success.created', { item: t('navigation.users') }));
      navigate('/users');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ResourceForm<UserFormData>
        fields={userFields}
        onSubmit={handleSubmit}
        isSubmitting={createStaff.isPending}
        title={t('common.create') + ' ' + t('navigation.users')}
      />
    </div>
  );
}
