import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Ban,
  LogIn,
  LogOut,
  Globe,
  Clock,
  User as UserIcon,
  Store as StoreIcon,
  Hash,
  FileText,
  Database,
  GitCompare,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetActivityLog } from '../api/activity-log';
import { toast } from 'sonner';

const ACTION_META: Record<
  string,
  {
    label: string;
    icon: typeof Plus;
    tone: string;
    gradient: string;
    accent: string;
  }
> = {
  create: {
    label: 'Создание',
    icon: Plus,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
  },
  update: {
    label: 'Изменение',
    icon: Pencil,
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'amber',
  },
  delete: {
    label: 'Удаление',
    icon: Trash2,
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
    gradient: 'from-rose-500 to-red-600',
    accent: 'rose',
  },
  approve: {
    label: 'Подтверждение',
    icon: CheckCircle2,
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
    gradient: 'from-sky-500 to-blue-600',
    accent: 'sky',
  },
  void: {
    label: 'Отмена',
    icon: Ban,
    tone: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    gradient: 'from-zinc-500 to-slate-700',
    accent: 'zinc',
  },
  login: {
    label: 'Вход',
    icon: LogIn,
    tone: 'bg-violet-50 text-violet-700 border-violet-200',
    gradient: 'from-violet-500 to-purple-600',
    accent: 'violet',
  },
  logout: {
    label: 'Выход',
    icon: LogOut,
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    gradient: 'from-slate-500 to-slate-700',
    accent: 'slate',
  },
};

const RESOURCE_LABELS: Record<string, string> = {
  Sale: 'Продажа',
  Product: 'Товар',
  Stock: 'Склад',
  StockEntry: 'Поступление товара',
  Debt: 'Долг',
  POSShift: 'Кассовая смена',
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
  Measurement: 'Единица измерения',
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
    return d.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '-';
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

const isObject = (v: any): v is Record<string, any> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const formatValue = (v: any): string => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'Да' : 'Нет';
  if (typeof v === 'string' && ISO_DATE_RE.test(v)) {
    try {
      const d = new Date(v);
      if (v.includes('T')) {
        return d.toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }
      return d.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return v;
    }
  }
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
};

const humanizeKey = (k: string) => {
  if (FIELD_LABELS[k]) return FIELD_LABELS[k];
  const stripped = k.replace(/_id$/, '');
  if (FIELD_LABELS[stripped]) return FIELD_LABELS[stripped];
  return stripped
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
};

const FIELD_LABELS: Record<string, string> = {
  // Common
  id: 'ID',
  name: 'Название',
  description: 'Описание',
  comment: 'Комментарий',
  note: 'Примечание',
  is_active: 'Активен',
  is_system: 'Системный',
  is_main: 'Основной',
  is_debt: 'В долг',
  is_mobile_user: 'Мобильный пользователь',
  is_superuser: 'Суперпользователь',
  is_recyclable: 'Перерабатываемый',
  is_transferred: 'Перенесён',
  is_inventory_adjustment: 'Корректировка склада',
  sell_from_stock: 'Продажа со склада',
  has_active_shift: 'Активная смена',
  can_view_quantity: 'Видит количество',
  can_view_cost_price: 'Видит себестоимость',
  can_view_profit: 'Видит прибыль',
  tenant_id: 'Тенант',
  created_at: 'Создано',
  updated_at: 'Обновлено',
  parent: 'Родитель',
  parent_id: 'Родитель',
  parent_store: 'Главный магазин',
  // User/Auth
  user: 'Пользователь',
  user_name: 'Имя пользователя',
  worker: 'Работник',
  worker_name: 'Имя работника',
  cashier: 'Кассир',
  role: 'Роль',
  password: 'Пароль',
  phone_number: 'Телефон',
  email: 'Email',
  ip_address: 'IP-адрес',
  // Store
  store: 'Магазин',
  store_id: 'Магазин',
  store_name: 'Название магазина',
  address: 'Адрес',
  color: 'Цвет',
  budget: 'Бюджет',
  budgets: 'Бюджеты',
  // Product/Stock
  product: 'Товар',
  product_id: 'Товар',
  product_name: 'Название товара',
  category: 'Категория',
  category_id: 'Категория',
  barcode: 'Штрих-код',
  ikpu: 'ИКПУ',
  base_unit: 'Базовая единица',
  measurement: 'Единица измерения',
  variant: 'Вариант',
  variant_id: 'Вариант',
  attribute: 'Атрибут',
  // Prices
  min_price: 'Мин. цена',
  selling_price: 'Цена продажи',
  cost_per_unit: 'Себестоимость',
  price_per_unit: 'Цена за ед.',
  total_amount: 'Общая сумма',
  total_paid: 'Оплачено',
  total_cost: 'Общая стоимость',
  total_pure_revenue: 'Чистая прибыль',
  amount: 'Сумма',
  discount_amount: 'Скидка',
  change_amount: 'Сдача',
  rate_at_purchase: 'Курс при покупке',
  exchange_rate: 'Курс обмена',
  usd_rate_at_payment: 'Курс USD',
  currency: 'Валюта',
  currency_id: 'Валюта',
  // Stock/Quantity
  quantity: 'Количество',
  quantity_initial: 'Начальное количество',
  reserved_quantity: 'Зарезервировано',
  extra_quantity: 'Доп. количество',
  purchase_unit: 'Единица закупки',
  purchase_unit_id: 'Единица закупки',
  purchase_unit_quantity: 'Кол-во в ед. закупки',
  conversion_factor: 'Коэф. конверсии',
  batch_number: 'Партия',
  expiry_date: 'Срок годности',
  fifo_date: 'Дата FIFO',
  // Supplier
  supplier: 'Поставщик',
  supplier_id: 'Поставщик',
  // Stock entry
  stock_entry: 'Поступление',
  stock_entry_id: 'Поступление',
  entry_number: 'Номер поступления',
  date_arrived: 'Дата прихода',
  source_store: 'Магазин-источник',
  source_store_id: 'Магазин-источник',
  source_sale: 'Продажа-источник',
  source_sale_id: 'Продажа-источник',
  created_by: 'Кем создано',
  created_by_id: 'Кем создано',
  // Sale
  sale: 'Продажа',
  sale_id: 'ID продажи',
  sold_date: 'Дата продажи',
  paid_at: 'Оплачено в',
  on_credit: 'В кредит',
  client: 'Клиент',
  client_id: 'Клиент',
  client_name: 'Имя клиента',
  customer: 'Покупатель',
  payment_method: 'Способ оплаты',
  payment_type: 'Тип оплаты',
  // Shift
  shift: 'Смена',
  shift_id: 'Смена',
  register: 'Касса',
  opened_at: 'Открыта',
  closed_at: 'Закрыта',
  opening_cash: 'Касса на открытие',
  closing_cash: 'Касса на закрытие',
  // Debt
  debt: 'Долг',
  deposit: 'Аванс',
  deposit_payment_method: 'Способ оплаты аванса',
  // Expense
  expense: 'Расход',
  expense_name: 'Название расхода',
  expense_category: 'Категория расхода',
  // Misc
  date: 'Дата',
  related_type: 'Связанный тип',
  related_id: 'Связанный ID',
  history: 'История',
};

const FieldRow = ({ k, v }: { k: string; v: any }) => {
  const value = formatValue(v);
  const isJson = typeof v === 'object' && v !== null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-md transition-colors">
      <div className="md:col-span-4 text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
        {humanizeKey(k)}
      </div>
      <div className="md:col-span-8 text-sm text-slate-800 font-mono break-all">
        {isJson ? (
          <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto whitespace-pre-wrap text-slate-800">
            {value}
          </pre>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );
};

const DiffRow = ({ k, v }: { k: string; v: any }) => {
  let oldVal: any;
  let newVal: any;
  if (isObject(v) && ('old' in v || 'new' in v)) {
    oldVal = v.old;
    newVal = v.new;
  } else if (Array.isArray(v) && v.length === 2) {
    oldVal = v[0];
    newVal = v[1];
  } else {
    newVal = v;
  }
  return (
    <div className="px-4 py-3 border-b border-slate-100 last:border-b-0">
      <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
        {humanizeKey(k)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1">
            До
          </div>
          <div className="text-sm font-mono text-slate-800 break-all whitespace-pre-wrap">
            {formatValue(oldVal)}
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
            После
          </div>
          <div className="text-sm font-mono text-slate-800 break-all whitespace-pre-wrap">
            {formatValue(newVal)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActivityLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: log, isLoading } = useGetActivityLog(id ? Number(id) : undefined);

  const meta = useMemo(
    () => (log ? ACTION_META[log.action] || ACTION_META.void : null),
    [log],
  );

  const handleCopyJson = () => {
    if (!log) return;
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    toast.success('JSON скопирован');
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-[1400px] bg-white">
        <Skeleton className="h-12 w-32 mb-6" />
        <Skeleton className="h-40 w-full mb-6 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!log || !meta) {
    return (
      <div className="container mx-auto py-20 px-4 text-center bg-white">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Activity className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-700 font-medium">Запись не найдена</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/activity-logs')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          К списку
        </Button>
      </div>
    );
  }

  const Icon = meta.icon;
  const resourceLabel = RESOURCE_LABELS[log.resource_type] || log.resource_type;
  const hasChanges = log.changes && Object.keys(log.changes).length > 0;
  const hasSnapshot = log.snapshot && Object.keys(log.snapshot).length > 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px] bg-white text-slate-900">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/activity-logs')}
        className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        К журналу
      </Button>

      {/* Hero header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-[0.08]`} />
        <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br ${meta.gradient} opacity-20 blur-3xl`} />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg shadow-${meta.accent}-500/30 flex-shrink-0`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.tone}`}>
                    {meta.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {resourceLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
                    <Hash className="h-3 w-3" />
                    {log.id}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {log.description ||
                    `${meta.label} ${resourceLabel} #${log.resource_id}`}
                </h1>
                {log.resource_name && (
                  <p className="text-sm text-slate-600 mt-1">{log.resource_name}</p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="flex-shrink-0 bg-white"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Скопировано' : 'Копировать JSON'}
            </Button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: metadata */}
        <div className="space-y-4">
          {/* User card */}
          <Card className="p-5 border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <UserIcon className="h-3.5 w-3.5" />
              Пользователь
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
                {getInitials(log.user_name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {log.user_name || 'Система'}
                </p>
                {log.user && (
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {log.user}
                  </p>
                )}
              </div>
            </div>
            {log.ip_address && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">IP:</span>
                <span className="font-mono text-slate-700">{log.ip_address}</span>
              </div>
            )}
          </Card>

          {/* Time card */}
          <Card className="p-5 border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <Clock className="h-3.5 w-3.5" />
              Время
            </div>
            <p className="font-semibold text-slate-800">
              {formatDateTime(log.created_at)}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {log.created_at}
            </p>
          </Card>

          {/* Resource card */}
          <Card className="p-5 border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <Database className="h-3.5 w-3.5" />
              Ресурс
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Тип</span>
                <span className="text-sm font-medium text-slate-700">
                  {resourceLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">ID</span>
                <span className="text-sm font-mono text-slate-700">
                  #{log.resource_id}
                </span>
              </div>
              {log.resource_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Имя</span>
                  <span className="text-sm font-medium text-slate-700 truncate ml-2">
                    {log.resource_name}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Store card */}
          {log.store_name && (
            <Card className="p-5 border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                <StoreIcon className="h-3.5 w-3.5" />
                Магазин
              </div>
              <p className="font-semibold text-slate-800">{log.store_name}</p>
              {log.store && (
                <p className="text-xs text-slate-500 font-mono mt-1">
                  ID: {log.store}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right: snapshot/changes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          {log.description && (
            <Card className="p-5 border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                <FileText className="h-3.5 w-3.5" />
                Описание
              </div>
              <p className="text-slate-700">{log.description}</p>
            </Card>
          )}

          {/* Changes (for updates) */}
          {hasChanges && (
            <Card className="overflow-hidden border-slate-200 bg-white">
              <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-800">
                  Изменения
                </h3>
                <span className="ml-auto text-xs text-amber-600 font-medium">
                  {Object.keys(log.changes).length}{' '}
                  {Object.keys(log.changes).length === 1 ? 'поле' : 'полей'}
                </span>
              </div>
              <div>
                {Object.entries(log.changes).map(([k, v]) => (
                  <DiffRow key={k} k={k} v={v} />
                ))}
              </div>
            </Card>
          )}

          {/* Snapshot */}
          {hasSnapshot && (
            <Card className="overflow-hidden border-slate-200 bg-white">
              <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-indigo-800">
                  Снимок данных
                </h3>
                <span className="ml-auto text-xs text-indigo-600 font-medium">
                  {Object.keys(log.snapshot).length}{' '}
                  {Object.keys(log.snapshot).length === 1 ? 'поле' : 'полей'}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {Object.entries(log.snapshot).map(([k, v]) => (
                  <FieldRow key={k} k={k} v={v} />
                ))}
              </div>
            </Card>
          )}

          {!hasChanges && !hasSnapshot && (
            <Card className="p-10 border-slate-200 text-center bg-white">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Database className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                Нет дополнительных данных для этой записи
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
