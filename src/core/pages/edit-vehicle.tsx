import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Car, Hash, ToggleLeft, Calendar } from 'lucide-react';
import {
  fetchVehicleDetails,
  useUpdateVehicle,
  type Vehicle,
} from '../api/vehicle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditVehicle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateVehicle = useUpdateVehicle();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchVehicleDetails(parseInt(id, 10));
        setVehicle(data);
        setName(data.name || '');
        setPlateNumber(data.plate_number || '');
        setIsActive(data.is_active ?? true);
      } catch {
        toast.error(
          t('messages.error.not_found', { item: t('navigation.vehicles') }) ||
            'Транспорт не найден',
        );
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plateNumber.trim()) {
      toast.error(t('messages.error.fill_required_fields') || 'Заполните все поля');
      return;
    }
    try {
      await updateVehicle.mutateAsync({
        id: parseInt(id!, 10),
        name: name.trim().toUpperCase(),
        plate_number: plateNumber.trim(),
        is_active: isActive,
      } as any);
      toast.success(
        t('messages.success.updated', { item: t('navigation.vehicles') }) ||
          'Транспорт обновлён',
      );
      navigate('/vehicles');
    } catch {
      toast.error(
        t('messages.error.update', { item: t('navigation.vehicles') }) ||
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
          onClick={() => navigate('/vehicles')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back') || 'Назад'}
        </button>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('common.edit') || 'Редактировать'}: {vehicle?.name}
            </h1>
            {vehicle?.created_at && (
              <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {t('forms.created_at') || 'Создан'}:{' '}
                {new Date(vehicle.created_at).toLocaleDateString('ru-RU')}
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
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.vehicle') || 'Модель / Название'}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('placeholders.enter_vehicle_name') || 'COBALT'}
                  className="uppercase"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate_number" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.plate_number') || 'Гос. номер'}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="plate_number"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder={t('placeholders.enter_plate_number') || '01 A 123 BC'}
                  className="font-mono tracking-wider"
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
                        ? 'Транспорт используется в рейсах'
                        : 'Транспорт скрыт из выбора'}
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
                  onClick={() => navigate('/vehicles')}
                >
                  {t('common.cancel') || 'Отмена'}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateVehicle.isPending}
                >
                  {updateVehicle.isPending
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
