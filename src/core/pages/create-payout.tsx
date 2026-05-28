import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Calendar,
  Wallet,
  Calculator,
  Store,
  Coins,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useCreatePayout, type Payout, type PayoutType } from '../api/payout';
import { useGetStaffs } from '../api/staff';
import { useGetStores } from '../api/store';
import { useGetCurrencies } from '../api/currency';
import { useGetPaymentMethods } from '../api/payment-methods';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const TYPE_OPTIONS: { value: PayoutType; label: string }[] = [
  { value: 'salary', label: 'Зарплата' },
  { value: 'bonus', label: 'Бонус' },
  { value: 'penalty', label: 'Штраф' },
  { value: 'advance', label: 'Аванс' },
];

export default function CreatePayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createPayout = useCreatePayout();

  const now = new Date();
  const [staff, setStaff] = useState('');
  const [store, setStore] = useState('');
  const [payoutType, setPayoutType] = useState<PayoutType>('salary');
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
  const [baseSalary, setBaseSalary] = useState('0');
  const [bonusAmount, setBonusAmount] = useState('0');
  const [penaltyAmount, setPenaltyAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [notes, setNotes] = useState('');

  const { data: staffsData } = useGetStaffs({});
  const { data: storesData } = useGetStores({});
  const { data: currenciesData } = useGetCurrencies({});
  const { data: paymentMethodsData } = useGetPaymentMethods({});

  const staffs = Array.isArray(staffsData) ? staffsData : (staffsData as any)?.results || [];
  const stores = Array.isArray(storesData) ? storesData : (storesData as any)?.results || [];
  const currencies = Array.isArray(currenciesData)
    ? currenciesData
    : (currenciesData as any)?.results || [];
  const paymentMethods = Array.isArray(paymentMethodsData)
    ? paymentMethodsData
    : (paymentMethodsData as any)?.results || [];

  const totalAmount = useMemo(() => {
    const base = Number(baseSalary) || 0;
    const bonus = Number(bonusAmount) || 0;
    const penalty = Number(penaltyAmount) || 0;
    return base + bonus - penalty;
  }, [baseSalary, bonusAmount, penaltyAmount]);

  useEffect(() => {
    if (!currency && currencies.length > 0) {
      setCurrency(String(currencies[0].id));
    }
  }, [currencies, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !store || !payoutType || !paymentMethod || !currency) {
      toast.error(t('messages.error.fill_required_fields') || 'Заполните обязательные поля');
      return;
    }
    try {
      const payload: Payout = {
        staff: Number(staff),
        store: Number(store),
        payout_type: payoutType,
        period_year: periodYear,
        period_month: periodMonth,
        base_salary: baseSalary || '0',
        bonus_amount: bonusAmount || '0',
        penalty_amount: penaltyAmount || '0',
        total_amount: String(totalAmount),
        payment_method: Number(paymentMethod),
        currency: Number(currency),
        paid_at: paidAt ? paidAt : null,
        notes: notes || '',
      };
      await createPayout.mutateAsync(payload as any);
      toast.success('Выплата создана');
      navigate('/payouts');
    } catch {
      toast.error('Ошибка создания выплаты');
    }
  };

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <button
          type="button"
          onClick={() => navigate('/payouts')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back') || 'Назад'}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Создать выплату</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ежемесячная выплата сотруднику с расчётом (база + бонус − штраф)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Сотрудник <span className="text-red-500">*</span>
                  </Label>
                  <Select value={staff} onValueChange={setStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffs.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.user_read?.name || `Сотрудник #${s.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-muted-foreground" />
                    Магазин <span className="text-red-500">*</span>
                  </Label>
                  <Select value={store} onValueChange={setStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите магазин" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    Тип выплаты <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={payoutType}
                    onValueChange={(v) => setPayoutType(v as PayoutType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Период <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={String(periodMonth)}
                      onValueChange={(v) => setPeriodMonth(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS_RU.map((m, i) => (
                          <SelectItem key={m} value={String(i + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(periodYear)}
                      onValueChange={(v) => setPeriodYear(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calculator className="h-4 w-4" />
                Расчёт суммы
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="base_salary">База</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus_amount" className="text-green-700">
                    + Бонус
                  </Label>
                  <Input
                    id="bonus_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="penalty_amount" className="text-red-700">
                    − Штраф
                  </Label>
                  <Input
                    id="penalty_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Итого к выплате
                </div>
                <div className="text-2xl font-bold font-mono text-primary">
                  {totalAmount.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    Способ оплаты <span className="text-red-500">*</span>
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите способ" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((pm: any) => (
                        <SelectItem key={pm.id} value={String(pm.id)}>
                          {pm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                    Валюта <span className="text-red-500">*</span>
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите валюту" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.code ? `(${c.code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="paid_at" className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Дата выплаты
                  </Label>
                  <Input
                    id="paid_at"
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Оставьте пустым, если выплата ещё не произведена
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Комментарий
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Дополнительная информация..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/payouts')}
            >
              {t('common.cancel') || 'Отмена'}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createPayout.isPending}
            >
              {createPayout.isPending
                ? t('common.saving') || 'Сохранение...'
                : t('buttons.save') || 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
