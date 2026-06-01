import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Ban,
  LogIn,
  LogOut,
  Search,
  Filter,
  RotateCcw,
  Globe,
  Clock,
  Store as StoreIcon,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetActivityLogs,
  ACTION_TYPES,
  RESOURCE_TYPES,
  type ActivityLog,
} from '../api/activity-log';
import { useGetStores } from '../api/store';
import { useGetUsers } from '../api/user';
import { useDebounce } from '../hooks/useDebounce';

const ACTION_META: Record<
  string,
  { label: string; icon: typeof Plus; tone: string; dot: string }
> = {
  create: {
    label: 'Создание',
    icon: Plus,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  update: {
    label: 'Изменение',
    icon: Pencil,
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  delete: {
    label: 'Удаление',
    icon: Trash2,
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  approve: {
    label: 'Подтверждение',
    icon: CheckCircle2,
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  void: {
    label: 'Отмена',
    icon: Ban,
    tone: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    dot: 'bg-zinc-500',
  },
  login: {
    label: 'Вход',
    icon: LogIn,
    tone: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  logout: {
    label: 'Выход',
    icon: LogOut,
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};

const RESOURCE_LABELS: Record<string, string> = {
  Sale: 'Продажа',
  Product: 'Товар',
  Stock: 'Склад',
  StockEntry: 'Поступление',
  Debt: 'Долг',
  POSShift: 'Смена',
  Refund: 'Возврат',
  Transfer: 'Перемещение',
  WriteOff: 'Списание',
  Customer: 'Клиент',
  Supplier: 'Поставщик',
  Order: 'Заказ',
  Category: 'Категория',
  User: 'Пользователь',
  Store: 'Магазин',
  Expense: 'Расход',
  Income: 'Приход',
  Payout: 'Выплата',
  Vehicle: 'Транспорт',
  Driver: 'Водитель',
  Currency: 'Валюта',
  Measurement: 'Ед. изм.',
  Role: 'Роль',
  PaymentMethod: 'Способ оплаты',
  Attribute: 'Атрибут',
  VariationOption: 'Вариант',
  ChargeType: 'Тип начисления',
  WriteoffReason: 'Причина списания',
  LabelSize: 'Размер этикетки',
  Sponsor: 'Спонсор',
  Loan: 'Заём',
  Recycling: 'Переработка',
  ClientType: 'Тип клиента',
  Cassa: 'Касса',
  Penalty: 'Штраф',
  CashInflow: 'Поступление денег',
};

const formatDateTime = (s: string) => {
  try {
    const d = new Date(s);
    return {
      date: d.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      time: d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  } catch {
    return { date: '-', time: '' };
  }
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const ActionBadge = ({ action }: { action: string }) => {
  const meta = ACTION_META[action] || ACTION_META.void;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.tone}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

const ResourceChip = ({
  type,
  resourceId,
  resourceName,
}: {
  type: string;
  resourceId?: string;
  resourceName?: string;
}) => {
  const label = RESOURCE_LABELS[type] || type;
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          {label}
        </span>
        {resourceId && (
          <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 font-mono">
            <Hash className="h-3 w-3" />
            {resourceId}
          </span>
        )}
      </div>
      {resourceName && (
        <span className="text-xs text-slate-600 truncate">{resourceName}</span>
      )}
    </div>
  );
};

const UserCell = ({ name, ip }: { name?: string; ip?: string | null }) => {
  const initials = getInitials(name);
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="relative flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
          {initials}
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-slate-800 truncate">
          {name || 'Система'}
        </span>
        {ip && (
          <span className="text-[11px] text-slate-400 font-mono inline-flex items-center gap-1">
            <Globe className="h-2.5 w-2.5" />
            {ip}
          </span>
        )}
      </div>
    </div>
  );
};

interface SummaryStat {
  label: string;
  value: number;
  tone: string;
  icon: typeof Activity;
}

const StatCard = ({ label, value, tone, icon: Icon }: SummaryStat) => (
  <div className={`relative overflow-hidden rounded-2xl border p-4 ${tone}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
      </div>
      <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default function ActivityLogsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 350);

  const { data: storesData } = useGetStores({});
  const { data: usersData } = useGetUsers({});

  const stores = useMemo(
    () => (Array.isArray(storesData) ? storesData : storesData?.results || []),
    [storesData],
  );
  const users = useMemo(
    () => (Array.isArray(usersData) ? usersData : usersData?.results || []),
    [usersData],
  );

  const { data, isLoading, isFetching } = useGetActivityLogs({
    page,
    action: actionFilter,
    resource_type: resourceFilter,
    store: storeFilter !== 'all' ? Number(storeFilter) : undefined,
    user: userFilter !== 'all' ? Number(userFilter) : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    search: search || undefined,
    ordering: '-created_at',
  });

  useEffect(() => {
    setPage(1);
  }, [actionFilter, resourceFilter, storeFilter, userFilter, dateFrom, dateTo, search]);

  const logs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = data?.total_pages || 1;

  const stats = useMemo<SummaryStat[]>(() => {
    const counts = { create: 0, update: 0, delete: 0, other: 0 };
    for (const log of logs) {
      if (log.action === 'create') counts.create++;
      else if (log.action === 'update') counts.update++;
      else if (log.action === 'delete') counts.delete++;
      else counts.other++;
    }
    return [
      {
        label: 'Всего записей',
        value: totalCount,
        tone: 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 text-indigo-700',
        icon: Activity,
      },
      {
        label: 'Создано (стр.)',
        value: counts.create,
        tone: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 text-emerald-700',
        icon: Plus,
      },
      {
        label: 'Изменено (стр.)',
        value: counts.update,
        tone: 'bg-gradient-to-br from-amber-50 to-white border-amber-100 text-amber-700',
        icon: Pencil,
      },
      {
        label: 'Удалено (стр.)',
        value: counts.delete,
        tone: 'bg-gradient-to-br from-rose-50 to-white border-rose-100 text-rose-700',
        icon: Trash2,
      },
    ];
  }, [logs, totalCount]);

  const handleClear = () => {
    setActionFilter('all');
    setResourceFilter('all');
    setStoreFilter('all');
    setUserFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setPage(1);
  };

  const hasFilters =
    actionFilter !== 'all' ||
    resourceFilter !== 'all' ||
    storeFilter !== 'all' ||
    userFilter !== 'all' ||
    !!dateFrom ||
    !!dateTo ||
    !!search;

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1600px] bg-white text-slate-900">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl" />
        <div className="relative p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Журнал активности
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Полная история действий — кто, что и когда сделал
              </p>
            </div>
          </div>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Обновление...
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Filters */}
      <Card className="p-5 mb-6 border-slate-200 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Фильтры</h3>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Сбросить
            </Button>
          )}
        </div>

        {/* Action chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActionFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              actionFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Все действия
          </button>
          {ACTION_TYPES.map((a) => {
            const meta = ACTION_META[a];
            const Icon = meta.icon;
            const active = actionFilter === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setActionFilter(a)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? meta.tone + ' ring-2 ring-offset-1 ring-slate-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по описанию, имени, ID..."
              className="pl-9 bg-white text-slate-900"
            />
          </div>

          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="bg-white text-slate-900">
              <SelectValue placeholder="Тип ресурса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ресурсы</SelectItem>
              {RESOURCE_TYPES.map((r) => (
                <SelectItem key={r} value={r}>
                  {RESOURCE_LABELS[r] || r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="bg-white text-slate-900">
              <SelectValue placeholder="Магазин" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все магазины</SelectItem>
              {stores.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="bg-white text-slate-900">
              <SelectValue placeholder="Пользователь" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все пользователи</SelectItem>
              {users.map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="С даты"
            className="bg-white text-slate-900"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="По дату"
            className="bg-white text-slate-900"
          />
        </div>
      </Card>

      {/* Logs Table / List */}
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">Записи не найдены</p>
            <p className="text-sm text-slate-500 mt-1">
              Попробуйте изменить фильтры или сбросить их
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header row (visible on md+) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-50">
              <div className="col-span-2">Действие</div>
              <div className="col-span-3">Пользователь</div>
              <div className="col-span-2">Ресурс</div>
              <div className="col-span-3">Описание</div>
              <div className="col-span-2 text-right">Время</div>
            </div>

            {logs.map((log: ActivityLog) => {
              const { date, time } = formatDateTime(log.created_at);
              return (
                <button
                  key={log.id}
                  onClick={() => navigate(`/activity-logs/${log.id}`)}
                  className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group bg-white"
                >
                  <div className="md:col-span-2 flex items-center">
                    <ActionBadge action={log.action} />
                  </div>

                  <div className="md:col-span-3 min-w-0">
                    <UserCell name={log.user_name} ip={log.ip_address} />
                  </div>

                  <div className="md:col-span-2 flex items-center min-w-0">
                    <ResourceChip
                      type={log.resource_type}
                      resourceId={log.resource_id}
                      resourceName={log.resource_name}
                    />
                  </div>

                  <div className="md:col-span-3 min-w-0 flex flex-col justify-center">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {log.description || '—'}
                    </p>
                    {log.store_name && (
                      <span className="text-xs text-slate-500 inline-flex items-center gap-1 mt-0.5">
                        <StoreIcon className="h-3 w-3" />
                        {log.store_name}
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-end gap-2">
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-700 tabular-nums">
                        {date}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums inline-flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {time}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Страница <span className="font-semibold text-slate-700">{page}</span> из{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span> · Всего{' '}
              <span className="font-semibold text-slate-700">{totalCount}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Вперёд
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
