import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Ruler, ArrowLeft, Save } from 'lucide-react';
import { useCreateMeasurement } from '../api/measurement';
import { useState } from 'react';

export default function CreateMeasurement() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const create = useCreateMeasurement();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await create.mutateAsync({ name: name.trim(), short_name: shortName.trim(), is_active: isActive } as any);
      toast.success(t('messages.success.created', { item: t('navigation.measurements') }));
      navigate('/measurements');
    } catch { /* handled by react-query */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/measurements')} className="mb-6 flex items-center gap-2 hover:bg-transparent">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Button>

        <Card className="bg-white dark:bg-card shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ruler className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{t('common.create')} {t('navigation.measurements')}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{t('common.fill_fields')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>{t('forms.measurement_name')}</Label>
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
                <Label>{t('forms.short_name')}</Label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={t('placeholders.enter_short_name')}
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">{t('forms.is_active')}</Label>
                  <p className="text-sm text-gray-500">{t('common.active')}</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/measurements')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={create.isPending || !name.trim()} className="flex items-center gap-2">
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
