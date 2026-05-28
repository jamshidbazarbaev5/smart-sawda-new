import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Car, Hash, ToggleLeft } from 'lucide-react';
import { useCreateVehicle } from '../api/vehicle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateVehicle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plateNumber.trim()) {
      toast.error(t('messages.error.fill_required_fields') || 'Заполните все поля');
      return;
    }
    try {
      await createVehicle.mutateAsync({
        name: name.trim().toUpperCase(),
        plate_number: plateNumber.trim(),
        is_active: isActive,
      } as any);
      toast.success(
        t('messages.success.created', { item: t('navigation.vehicles') }) ||
          'Транспорт создан',
      );
      navigate('/vehicles');
    } catch {
      toast.error(
        t('messages.error.create', { item: t('navigation.vehicles') }) ||
          'Ошибка создания транспорта',
      );
    }
  };

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

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('common.create') || 'Создать'}{' '}
            {(t('navigation.vehicles') || 'транспорт').toLowerCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('placeholders.enter_vehicle_info') || 'Введите информацию о транспортном средстве'}
          </p>
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
                  disabled={createVehicle.isPending}
                >
                  {createVehicle.isPending
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
