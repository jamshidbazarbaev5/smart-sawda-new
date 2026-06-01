import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, FileText, ToggleLeft, Calendar } from 'lucide-react';
import {
  useGetSponsor,
  useUpdateSponsor,
  type Sponsor,
} from '../api/sponsors';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSponsorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateSponsor = useUpdateSponsor();
  const { data: sponsor, isLoading: loading } = useGetSponsor(Number(id));

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (sponsor) {
      setName(sponsor.name || '');
      setPhoneNumber(sponsor.phone_number || '');
      setNotes(sponsor.notes || '');
      setIsActive(sponsor.is_active ?? true);
    }
  }, [sponsor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('messages.error.fill_required_fields'));
      return;
    }
    try {
      await updateSponsor.mutateAsync({
        id: Number(id),
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        notes: notes.trim(),
        is_active: isActive,
      } as any);
      toast.success(t('messages.success.updated', { item: t('navigation.sponsors') }));
      navigate('/sponsors');
    } catch {
      toast.error(t('messages.error.update', { item: t('navigation.sponsors') }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent></Card>
      </div>
    );
  }

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

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('common.edit')}: {sponsor?.name}
            </h1>
            {sponsor?.created_at && (
              <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {t('forms.created_at')}: {new Date(sponsor.created_at).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isActive ? t('common.active') : t('common.inactive')}
          </span>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.name')} <span className="text-red-500">*</span>
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.phone')}
                </Label>
                <Input id="phone_number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('forms.notes')}
                </Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="is_active" className="cursor-pointer">{t('forms.is_active')}</Label>
                  </div>
                </div>
                <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/sponsors')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={updateSponsor.isPending}>
                  {updateSponsor.isPending ? t('common.saving') : t('buttons.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
