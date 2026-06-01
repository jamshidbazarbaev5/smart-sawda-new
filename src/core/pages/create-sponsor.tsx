import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, FileText, ToggleLeft } from 'lucide-react';
import { useCreateSponsor } from '../api/sponsors';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateSponsorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createSponsor = useCreateSponsor();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('messages.error.fill_required_fields'));
      return;
    }
    try {
      await createSponsor.mutateAsync({
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        notes: notes.trim(),
        is_active: isActive,
      } as any);
      toast.success(t('messages.success.created', { item: t('navigation.sponsors') }));
      navigate('/sponsors');
    } catch {
      toast.error(t('messages.error.create', { item: t('navigation.sponsors') }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <button
          type="button"
          onClick={() => navigate('/sponsors')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('common.create')} {t('navigation.sponsors')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('placeholders.enter_sponsor_info')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('placeholders.enter_name')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.phone')}
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="900000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('placeholders.enter_notes')}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="is_active" className="cursor-pointer">
                      {t('forms.is_active')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive ? t('common.active_hint') : t('common.inactive_hint')}
                    </p>
                  </div>
                </div>
                <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/sponsors')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={createSponsor.isPending}>
                  {createSponsor.isPending ? t('common.saving') : t('buttons.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
