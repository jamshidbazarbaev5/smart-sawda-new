import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, ToggleLeft } from 'lucide-react';
import { useCreateDriver } from '../api/driver';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateDriver() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createDriver = useCreateDriver();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error(t('messages.error.fill_required_fields') || 'Заполните все поля');
      return;
    }
    try {
      await createDriver.mutateAsync({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        is_active: isActive,
      } as any);
      toast.success(
        t('messages.success.created', { item: t('navigation.drivers') }) ||
          'Водитель создан',
      );
      navigate('/drivers');
    } catch {
      toast.error(
        t('messages.error.create', { item: t('navigation.drivers') }) ||
          'Ошибка создания водителя',
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <button
          type="button"
          onClick={() => navigate('/drivers')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back') || 'Назад'}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('common.create') || 'Создать'} {(t('navigation.drivers') || 'Водителя').toLowerCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('placeholders.enter_driver_info') || 'Введите информацию о водителе'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.full_name') || 'ФИО'}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('placeholders.enter_full_name') || 'Введите ФИО'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.phone') || 'Телефон'}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('placeholders.enter_phone') || '900000000'}
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="is_active" className="cursor-pointer">
                      {t('forms.is_active') || 'Активен'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive
                        ? t('common.active_hint') || 'Водитель может быть назначен на рейсы'
                        : t('common.inactive_hint') || 'Водитель скрыт из выбора'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/drivers')}
                >
                  {t('common.cancel') || 'Отмена'}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createDriver.isPending}
                >
                  {createDriver.isPending
                    ? t('common.saving') || 'Сохранение...'
                    : t('buttons.save') || 'Сохранить'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
