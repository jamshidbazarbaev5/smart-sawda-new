import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Search, Phone, User } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourseTable';
import { Input } from '@/components/ui/input';
import {
  type Driver,
  useGetDrivers,
  useDeleteDriver,
} from '../api/driver';

export default function DriversPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: driversData, isLoading } = useGetDrivers({
    params: {
      page: currentPage,
      search: searchTerm || undefined,
    },
  });
  const deleteDriver = useDeleteDriver();

  const drivers: Driver[] = Array.isArray(driversData)
    ? driversData
    : (driversData as any)?.results || [];
  const totalCount = !Array.isArray(driversData)
    ? (driversData as any)?.count ?? 0
    : drivers.length;

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteDriver.mutateAsync(id);
        toast.success(t('messages.success.deleted'));
      } catch {
        toast.error(t('messages.error.delete'));
      }
    },
    [deleteDriver, t],
  );

  const columns = [
    {
      header: t('forms.full_name') || 'Водитель',
      accessorKey: (row: Driver) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{row.full_name}</span>
        </div>
      ),
    },
    {
      header: t('forms.phone') || 'Телефон',
      accessorKey: (row: Driver) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          <span className="font-mono">{row.phone_number || '—'}</span>
        </div>
      ),
    },
    {
      header: t('forms.is_active') || 'Статус',
      accessorKey: (row: Driver) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
            row.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              row.is_active ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          {row.is_active ? t('common.active') || 'Активен' : t('common.inactive') || 'Неактивен'}
        </span>
      ),
    },
    {
      header: t('forms.created_at') || 'Дата создания',
      accessorKey: (row: Driver) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('navigation.drivers') || 'Водители'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} {totalCount === 1 ? 'водитель' : 'водителей'}
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('placeholders.search') || 'Поиск...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <ResourceTable
          data={drivers}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => navigate('/create-driver')}
          onEdit={(driver) => navigate(`/edit-driver/${driver.id}`)}
          onDelete={(id) => handleDelete(id)}
          totalCount={totalCount}
          pageSize={(driversData as any)?.page_size || 30}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
