import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Search, Car, Hash } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourseTable';
import { Input } from '@/components/ui/input';
import {
  type Vehicle,
  useGetVehicles,
  useDeleteVehicle,
} from '../api/vehicle';

export default function VehiclesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: vehiclesData, isLoading } = useGetVehicles({
    params: {
      page: currentPage,
      search: searchTerm || undefined,
    },
  });
  const deleteVehicle = useDeleteVehicle();

  const vehicles: Vehicle[] = Array.isArray(vehiclesData)
    ? vehiclesData
    : (vehiclesData as any)?.results || [];
  const totalCount = !Array.isArray(vehiclesData)
    ? (vehiclesData as any)?.count ?? 0
    : vehicles.length;

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteVehicle.mutateAsync(id);
        toast.success(t('messages.success.deleted'));
      } catch {
        toast.error(t('messages.error.delete'));
      }
    },
    [deleteVehicle, t],
  );

  const columns = [
    {
      header: t('forms.name') || 'Название',
      accessorKey: (row: Vehicle) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Car className="h-4 w-4" />
          </div>
          <span className="font-medium uppercase">{row.name}</span>
        </div>
      ),
    },
    {
      header: t('forms.plate_number') || 'Номер',
      accessorKey: (row: Vehicle) => (
        <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1 font-mono text-sm font-semibold tracking-wider shadow-sm">
          <Hash className="h-3.5 w-3.5 text-gray-400" />
          {row.plate_number || '—'}
        </div>
      ),
    },
    {
      header: t('forms.is_active') || 'Статус',
      accessorKey: (row: Vehicle) => (
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
      accessorKey: (row: Vehicle) =>
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
              {t('navigation.vehicles') || 'Транспорт'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} {totalCount === 1 ? 'транспорт' : 'транспортных средств'}
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
          data={vehicles}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => navigate('/create-vehicle')}
          onEdit={(vehicle) => navigate(`/edit-vehicle/${vehicle.id}`)}
          onDelete={(id) => handleDelete(id)}
          totalCount={totalCount}
          pageSize={(vehiclesData as any)?.page_size || 30}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
