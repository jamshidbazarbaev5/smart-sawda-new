import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateCategory, fetchAllCategories } from '../api/category';
import type { Category } from '../api/category';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Info, Settings } from 'lucide-react';

export default function CreateCategory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCategory = useCreateCategory();

  const [name, setName] = useState('');
  const [parent, setParent] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [sellFromStock, setSellFromStock] = useState(true);
  const [isRecyclable, setIsRecyclable] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchAllCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('messages.error.required_field', { field: t('forms.category_name') }));
      return;
    }

    try {
      const categoryData: any = {
        name: name.trim(),
        is_active: isActive,
        sell_from_stock: sellFromStock,
        is_recyclable: isRecyclable,
      };
      if (parent) categoryData.parent = Number(parent);

      await createCategory.mutateAsync(categoryData);
      toast.success(t('messages.success.created', { item: t('navigation.categories') }));
      navigate('/categories');
    } catch (error) {
      toast.error(t('messages.error.create', { item: t('navigation.categories') }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/categories')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('common.create')} {t('navigation.categories')}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Создание новой категории</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                {t('forms.basic_info') || 'Основная информация'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('forms.category_name')} *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('placeholders.enter_name')} required />
              </div>
              <div className="space-y-2">
                <Label>{t('forms.parent_category') || 'Родительская категория'}</Label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={parent}
                  onChange={(e) => setParent(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">{t('placeholders.select_parent') || 'Без родителя'}</option>
                  {categories.filter(c => c.id !== undefined).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
                  <Label htmlFor="is_active" className="cursor-pointer text-sm">{t('forms.is_active') || 'Активна'}</Label>
                  <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="sell_from_stock" className="cursor-pointer text-sm">{t('forms.sell_from_stock') || 'Продажа со склада'}</Label>
                  <Switch id="sell_from_stock" checked={sellFromStock} onCheckedChange={setSellFromStock} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="is_recyclable" className="cursor-pointer text-sm">{t('forms.is_recyclable') || 'Переработка'}</Label>
                  <Switch id="is_recyclable" checked={isRecyclable} onCheckedChange={setIsRecyclable} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => navigate('/categories')}>
              {t('common.cancel') || 'Отмена'}
            </Button>
            <Button type="submit" disabled={createCategory.isPending} size="lg">
              {createCategory.isPending ? (t('common.sending') || 'Сохранение...') : (t('common.create') || 'Создать')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
