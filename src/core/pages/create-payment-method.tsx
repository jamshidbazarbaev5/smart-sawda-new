import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, ArrowLeft, Save } from 'lucide-react';
import { useCreatePaymentMethod } from '../api/payment-methods';
import { useGetCurrencies } from '../api/currency';
import { useState } from 'react';

export default function CreatePaymentMethod() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const create = useCreatePaymentMethod();
  const { data: currenciesData } = useGetCurrencies({});

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [icon, setIcon] = useState('');
  const [isCash, setIsCash] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const currencies = Array.isArray(currenciesData) ? currenciesData : currenciesData?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currencyId) return;

    try {
      await create.mutateAsync({
        name: name.trim(),
        code: code.trim() || undefined,
        currency_id: Number(currencyId),
        icon: icon.trim() || undefined,
        is_cash: isCash,
        is_active: isActive,
      } as any);
      toast.success(t('messages.success.created', { item: t('navigation.payment_methods') }));
      navigate('/payment-methods');
    } catch { /* handled */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/payment-methods')} className="mb-6 flex items-center gap-2 hover:bg-transparent">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Button>

        <Card className="bg-white dark:bg-card shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{t('common.create')} {t('navigation.payment_methods')}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{t('common.fill_fields')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>{t('forms.name')}</Label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={t('placeholders.enter_name')}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>{t('forms.code')}</Label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={t('placeholders.enter_code')}
                />
                <p className="text-xs text-gray-500">{t('messages.auto_generated')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('forms.currency')}</Label>
                <Select value={currencyId} onValueChange={setCurrencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.select_currency')} />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name} ({c.symbol || ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('forms.icon')}</Label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={t('placeholders.enter_icon')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">{t('forms.is_cash')}</Label>
                  <p className="text-sm text-gray-500">{t('common.cash_hint')}</p>
                </div>
                <Switch checked={isCash} onCheckedChange={setIsCash} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">{t('forms.is_active')}</Label>
                  <p className="text-sm text-gray-500">{t('common.active')}</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/payment-methods')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={create.isPending || !name.trim() || !currencyId} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {create.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
