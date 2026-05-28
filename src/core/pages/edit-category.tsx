import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useUpdateCategory, useGetCategory, fetchAllCategories } from '../api/category';
import type { Category } from '../api/category';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Info, Settings } from 'lucide-react';

export default function EditCategory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateCategory = useUpdateCategory();
  const { data: category } = useGetCategory(Number(id));

  const [name, setName] = useState('');
  const [parent, setParent] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [sellFromStock, setSellFromStock] = useState(true);
  const [isRecyclable, setIsRecyclable] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchAllCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setParent(category.parent ?? '');
      setIsActive(category.is_active ?? true);
      setSellFromStock(category.sell_from_stock ?? true);
      setIsRecyclable(category.is_recyclable ?? false);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('messages.error.required_field', { field: t('forms.category_name') }));
      return;
    }

    try {
      const categoryData: any = {
        id: Number(id),
        name: name.trim(),
        is_active: isActive,
        sell_from_stock: sellFromStock,
        is_recyclable: isRecyclable,
      };
      if (parent) categoryData.parent = Number(parent);

      await updateCategory.mutateAsync(categoryData);
      toast.success(t('messages.success.updated', { item: t('navigation.categories') }));
      navigate('/categories');
    } catch (error) {
      toast.error(t('messages.error.update', { item: t('navigation.categories') }));
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/categories')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('messages.edit')} {t('navigation.categories')}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Редактирование категории</p>
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
                  {categories.filter(c => c.id !== undefined && c.id !== Number(id)).map((cat) => (
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
            <Button type="submit" disabled={updateCategory.isPending} size="lg">
              {updateCategory.isPending ? (t('common.sending') || 'Сохранение...') : (t('common.save') || 'Сохранить')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
