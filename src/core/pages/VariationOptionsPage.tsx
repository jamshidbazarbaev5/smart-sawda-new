import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, List } from 'lucide-react';
import {
  type VariationOption,
  type VariationValue,
  useGetVariationOptions,
  useCreateVariationOption,
  useUpdateVariationOption,
  useDeleteVariationOption,
  useCreateVariationValue,
  useDeleteVariationValue,
} from '../api/variation-option';

interface PaginatedResponse {
  count: number;
  total_pages: number;
  current_page: number;
  results: VariationOption[];
}

export default function VariationOptionsPage() {
  const { t } = useTranslation();

  const { data: optionsData, isLoading } = useGetVariationOptions({});
  const createOption = useCreateVariationOption();
  const updateOption = useUpdateVariationOption();
  const deleteOption = useDeleteVariationOption();
  const createValue = useCreateVariationValue();
  const deleteValue = useDeleteVariationValue();

  const options = (optionsData as PaginatedResponse)?.results || [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<VariationOption | null>(null);
  const [optionName, setOptionName] = useState('');
  const [valueInputs, setValueInputs] = useState<Record<number, string>>({});

  const handleCreate = () => {
    setEditingOption(null);
    setOptionName('');
    setIsFormOpen(true);
  };

  const handleEdit = (option: VariationOption) => {
    setEditingOption(option);
    setOptionName(option.name);
    setIsFormOpen(true);
  };

  const handleDeleteOption = async (id: number) => {
    if (!window.confirm(t('messages.confirm_delete'))) return;
    try {
      await deleteOption.mutateAsync(id);
      toast.success(t('messages.success.deleted'));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t('messages.error.general'));
    }
  };

  const handleSubmitOption = async () => {
    if (!optionName.trim()) {
      toast.error(t('validation.required_field', { field: t('forms.name') }));
      return;
    }
    try {
      if (editingOption?.id) {
        await updateOption.mutateAsync({ id: editingOption.id, name: optionName.trim() });
        toast.success(t('messages.success.updated'));
      } else {
        await createOption.mutateAsync({ name: optionName.trim() });
        toast.success(t('messages.success.created', { item: t('navigation.variation_options') }));
      }
      setIsFormOpen(false);
      setEditingOption(null);
      setOptionName('');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t('messages.error.general'));
    }
  };

  const handleAddValue = async (optionId: number) => {
    const val = valueInputs[optionId] || '';
    if (!val.trim()) return;
    try {
      await createValue.mutateAsync({ option: optionId, value: val.trim() });
      setValueInputs((prev) => ({ ...prev, [optionId]: '' }));
      toast.success(t('messages.success.created', { item: t('forms.variation_value') }));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t('messages.error.general'));
    }
  };

  const handleDeleteValue = async (id: number) => {
    if (!window.confirm(t('messages.confirm_delete'))) return;
    try {
      await deleteValue.mutateAsync(id);
      toast.success(t('messages.success.deleted'));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t('messages.error.general'));
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('navigation.variation_options') || 'Вариации'}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('common.create')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}...</p>
      ) : options.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('messages.no_data') || 'Нет данных'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {options.map((option) => (
            <Card key={option.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-base font-medium">{option.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(option)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!option.is_system && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteOption(option.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {option.values?.map((v: any) => (
                    <span key={v.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                      {v.value}
                      {!option.is_system && (
                        <button className="ml-1 hover:text-destructive" onClick={() => handleDeleteValue(v.id)}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {(!option.values || option.values.length === 0) && (
                    <span className="text-sm text-muted-foreground">{t('messages.no_values') || 'Нет значений'}</span>
                  )}
                </div>
                {!option.is_system && (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('placeholders.enter_value') || 'Значение'}
                      value={valueInputs[option.id!] || ''}
                      onChange={(e) => setValueInputs((prev) => ({ ...prev, [option.id!]: e.target.value }))}
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddValue(option.id!);
                        }
                      }}
                    />
                    <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={() => handleAddValue(option.id!)}>
                      <Plus className="h-3 w-3 mr-1" />
                      {t('common.add')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditingOption(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? t('common.edit') : t('common.create')} {t('navigation.variation_options') || 'вариацию'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('forms.name')}</Label>
              <Input
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder={t('placeholders.enter_name')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitOption();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingOption(null); }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmitOption} disabled={createOption.isPending || updateOption.isPending}>
                {editingOption ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
