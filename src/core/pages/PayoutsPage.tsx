import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Search, Wallet, Calendar, User } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourseTable';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type Payout,
  type PayoutType,
  useGetPayouts,
  useDeletePayout,
} from '../api/payout';

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const TYPE_META: Record<PayoutType, { label: string; classes: string }> = {
  salary: { label: 'Зарплата', classes: 'bg-blue-100 text-blue-700' },
  bonus: { label: 'Бонус', classes: 'bg-green-100 text-green-700' },
  penalty: { label: 'Штраф', classes: 'bg-red-100 text-red-700' },
  advance: { label: 'Аванс', classes: 'bg-amber-100 text-amber-700' },
};

const formatAmount = (raw?: string) => {
  if (!raw) return '0';
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
};

export default function PayoutsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: payoutsData, isLoading } = useGetPayouts({
    params: {
      page: currentPage,
      search: searchTerm || undefined,
      payout_type: typeFilter !== 'all' ? typeFilter : undefined,
    },
  });
  const deletePayout = useDeletePayout();

  const payouts: Payout[] = Array.isArray(payoutsData)
    ? payoutsData
    : (payoutsData as any)?.results || [];
  const totalCount = !Array.isArray(payoutsData)
    ? (payoutsData as any)?.count ?? 0
    : payouts.length;

  const totalSum = useMemo(
    () => payouts.reduce((acc, p) => acc + Number(p.total_amount || 0), 0),
    [payouts],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deletePayout.mutateAsync(id);
        toast.success(t('messages.success.deleted'));
      } catch {
        toast.error(t('messages.error.delete'));
      }
    },
    [deletePayout, t],
  );

  const columns = [
    {
      header: t('forms.staff') || 'Сотрудник',
      accessorKey: (row: Payout) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{row.staff_name || `#${row.staff}`}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Тип',
      accessorKey: (row: Payout) => {
        const meta = TYPE_META[row.payout_type] || {
          label: row.payout_type,
          classes: 'bg-gray-100 text-gray-700',
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${meta.classes}`}
          >
            {meta.label}
          </span>
        );
      },
    },
    {
      header: 'Период',
      accessorKey: (row: Payout) => (
        <div className="inline-flex items-center gap-1.5 text-sm">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            {MONTHS_RU[row.period_month - 1] || row.period_month}{' '}
            {row.period_year}
          </span>
        </div>
      ),
    },
    {
      header: 'Сумма',
      accessorKey: (row: Payout) => (
        <span className="font-mono font-semibold text-gray-900">
          {formatAmount(row.total_amount)}
        </span>
      ),
    },
    {
      header: 'Выплачено',
      accessorKey: (row: Payout) =>
        row.paid_at ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
            Да
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
            Ожидает
          </span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              Всего выплат
            </div>
            <div className="mt-1 text-2xl font-bold">{totalCount}</div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-card">
            <div className="text-sm text-muted-foreground">Сумма на странице</div>
            <div className="mt-1 text-2xl font-bold font-mono">
              {totalSum.toLocaleString('ru-RU')}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-card">
            <div className="text-sm text-muted-foreground">Страница</div>
            <div className="mt-1 text-2xl font-bold">{currentPage}</div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Выплаты сотрудникам</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
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
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Тип выплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="salary">Зарплата</SelectItem>
                <SelectItem value="bonus">Бонус</SelectItem>
                <SelectItem value="penalty">Штраф</SelectItem>
                <SelectItem value="advance">Аванс</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ResourceTable
          data={payouts}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => navigate('/create-payout')}
          onEdit={(payout) => navigate(`/edit-payout/${payout.id}`)}
          onDelete={(id) => handleDelete(id)}
          totalCount={totalCount}
          pageSize={(payoutsData as any)?.page_size || 30}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
