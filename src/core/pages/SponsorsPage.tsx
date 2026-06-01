import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Search, User, Phone, FileText } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourseTable';
import { Input } from '@/components/ui/input';
import {
  type Sponsor,
  useGetSponsors,
  useDeleteSponsor,
} from '../api/sponsors';

export default function SponsorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sponsorsData, isLoading } = useGetSponsors({
    params: {
      page: currentPage,
      search: searchTerm || undefined,
    },
  });
  const deleteSponsor = useDeleteSponsor();

  const sponsors: Sponsor[] = Array.isArray(sponsorsData)
    ? sponsorsData
    : (sponsorsData as any)?.results || [];
  const totalCount = !Array.isArray(sponsorsData)
    ? (sponsorsData as any)?.count ?? 0
    : sponsors.length;

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteSponsor.mutateAsync(id);
        toast.success(t('messages.success.deleted'));
      } catch {
        toast.error(t('messages.error.delete'));
      }
    },
    [deleteSponsor, t],
  );

  const columns = [
    {
      header: t('forms.name'),
      accessorKey: (row: Sponsor) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: t('forms.phone'),
      accessorKey: (row: Sponsor) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          <span className="font-mono">{row.phone_number || '—'}</span>
        </div>
      ),
    },
    {
      header: t('forms.notes'),
      accessorKey: (row: Sponsor) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="h-3.5 w-3.5" />
          <span className="truncate max-w-[200px]">{row.notes || '—'}</span>
        </div>
      ),
    },
    {
      header: t('forms.is_active'),
      accessorKey: (row: Sponsor) => (
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
          {row.is_active ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      header: t('forms.created_at'),
      accessorKey: (row: Sponsor) =>
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
              {t('navigation.sponsors')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} {t('common.records')}
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('placeholders.search')}
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
          data={sponsors}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => navigate('/create-sponsor')}
          onEdit={(sponsor) => navigate(`/sponsors/edit/${sponsor.id}`)}
          onDelete={(id) => handleDelete(id)}
          totalCount={totalCount}
          pageSize={(sponsorsData as any)?.page_size || 30}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={(sponsor) => navigate(`/sponsors/${sponsor.id}/loans`)}
        />
      </div>
    </div>
  );
}
