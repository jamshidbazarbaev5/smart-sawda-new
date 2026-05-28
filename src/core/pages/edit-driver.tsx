import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, ToggleLeft, Calendar } from 'lucide-react';
import {
  fetchDriverDetails,
  useUpdateDriver,
  type Driver,
} from '../api/driver';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditDriver() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateDriver = useUpdateDriver();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchDriverDetails(parseInt(id, 10));
        setDriver(data);
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setIsActive(data.is_active ?? true);
      } catch {
        toast.error(
          t('messages.error.not_found', { item: t('navigation.drivers') }) ||
            'Водитель не найден',
        );
        navigate('/drivers');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error(t('messages.error.fill_required_fields') || 'Заполните все поля');
      return;
    }
    try {
      await updateDriver.mutateAsync({
        id: parseInt(id!, 10),
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        is_active: isActive,
      } as any);
      toast.success(
        t('messages.success.updated', { item: t('navigation.drivers') }) ||
          'Водитель обновлён',
      );
      navigate('/drivers');
    } catch {
      toast.error(
        t('messages.error.update', { item: t('navigation.drivers') }) ||
          'Ошибка обновления',
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('common.edit') || 'Редактировать'}: {driver?.full_name}
            </h1>
            {driver?.created_at && (
              <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {t('forms.created_at') || 'Создан'}:{' '}
                {new Date(driver.created_at).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isActive ? t('common.active') || 'Активен' : t('common.inactive') || 'Неактивен'}
          </span>
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
                  disabled={updateDriver.isPending}
                >
                  {updateDriver.isPending
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
