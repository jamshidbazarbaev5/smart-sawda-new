import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState } from 'react';
import { useCreateStore } from '../api/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Store, Settings } from 'lucide-react';

export default function CreateStore() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createStore = useCreateStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('validation.required_field', { field: t('forms.store_name') }));
      return;
    }

    try {
      await createStore.mutateAsync({
        name: name.trim(),
        address: address.trim(),
        phone_number: phoneNumber.trim(),
        is_main: isMain,
        is_active: isActive,
      });
      toast.success(t('messages.success.created', { item: t('navigation.stores') }));
      navigate('/stores');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t('messages.error.create', { item: t('navigation.stores') }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/stores')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('common.create')} {t('navigation.stores')}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Создание нового магазина</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                {t('forms.basic_info') || 'Основная информация'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('forms.store_name')} *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('placeholders.enter_name')} required />
              </div>
              <div className="space-y-2">
                <Label>{t('forms.address')}</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('placeholders.enter_address')} />
              </div>
              <div className="space-y-2">
                <Label>{t('forms.phone')}</Label>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={t('placeholders.enter_phone')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                {t('forms.settings') || 'Настройки'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="is_main" className="cursor-pointer text-sm">{t('forms.is_main_store')}</Label>
                  <Switch id="is_main" checked={isMain} onCheckedChange={setIsMain} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="is_active" className="cursor-pointer text-sm">{t('forms.is_active') || 'Активен'}</Label>
                  <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => navigate('/stores')}>
              {t('common.cancel') || 'Отмена'}
            </Button>
            <Button type="submit" disabled={createStore.isPending} size="lg">
              {createStore.isPending ? (t('common.sending') || 'Сохранение...') : (t('common.create') || 'Создать')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
