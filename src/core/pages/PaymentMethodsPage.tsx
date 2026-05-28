import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { ResourceForm } from '../helpers/ResourceForm';
import { toast } from 'sonner';
import { type PaymentMethod, useGetPaymentMethods, useUpdatePaymentMethod, useDeletePaymentMethod } from '../api/payment-methods';
import { useGetCurrencies } from '../api/currency';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Pencil, Trash2, CheckCircle2, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const fields = (t: (key: string) => string, currencyOptions: { value: number; label: string }[]) => [
  {
    name: 'name',
    label: t('forms.name'),
    type: 'text',
    required: true,
  },
  {
    name: 'code',
    label: t('forms.code'),
    type: 'text',
  },
  {
    name: 'currency_id',
    label: t('forms.currency'),
    type: 'select',
    options: currencyOptions,
    required: true,
  },
  {
    name: 'icon',
    label: t('forms.icon'),
    type: 'text',
  },
  {
    name: 'is_cash',
    label: t('forms.is_cash'),
    type: 'select',
    options: [
      { value: true, label: t('common.yes') },
      { value: false, label: t('common.no') },
    ],
  },
  {
    name: 'is_active',
    label: t('forms.is_active'),
    type: 'select',
    options: [
      { value: true, label: t('common.yes') },
      { value: false, label: t('common.no') },
    ],
  },
];

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);

  const { data: dataRaw, isLoading } = useGetPaymentMethods({ params: { page, page_size: 20 } });
  const { data: currenciesData } = useGetCurrencies({});

  const results: PaymentMethod[] = Array.isArray(dataRaw) ? dataRaw : dataRaw?.results || [];
  const totalCount = Array.isArray(dataRaw) ? dataRaw.length : dataRaw?.count || 0;

  const currencies = Array.isArray(currenciesData) ? currenciesData : currenciesData?.results || [];
  const currencyOptions = currencies.map((c: any) => ({ value: c.id, label: `${c.name} (${c.symbol || ''})` }));

  const { mutate: updateItem, isPending: isUpdating } = useUpdatePaymentMethod();
  const { mutate: deleteItem } = useDeletePaymentMethod();

  const handleEdit = (item: PaymentMethod) => {
    setEditing(item);
    setIsFormOpen(true);
  };

  const handleUpdateSubmit = (data: Record<string, unknown>) => {
    if (!editing?.id) return;
    const payload: any = {
      ...data,
      id: editing.id,
      is_cash: data.is_cash === true || data.is_cash?.toString() === 'true',
      is_active: data.is_active === true || data.is_active?.toString() === 'true',
      currency_id: Number(data.currency_id),
    };
    if (!payload.code) delete payload.code;
    if (!payload.icon) delete payload.icon;
    updateItem(payload, {
      onSuccess: () => {
        toast.success(t('messages.success.updated', { item: t('navigation.payment_methods') }));
        setIsFormOpen(false);
        setEditing(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm(t('messages.confirm_delete'))) return;
    deleteItem(id, {
      onSuccess: () => toast.success(t('messages.success.deleted', { item: t('navigation.payment_methods') })),
      onError: () => toast.error(t('messages.error.delete', { item: t('navigation.payment_methods') })),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 bg-white dark:bg-card">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('navigation.payment_methods')}</h1>
            <p className="text-gray-500">{t('common.total')}: {totalCount}</p>
          </div>
          <Button
            onClick={() => navigate('/payment-methods/create')}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('common.create')}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <Card key={item.id} className="bg-white dark:bg-card shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.is_system && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          {t('common.system')}
                        </span>
                      )}
                      {item.is_active ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{t('forms.code')}:</span>
                      <span className="font-mono font-medium">{item.code || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('forms.is_cash')}:</span>
                      <span>{item.is_cash ? t('common.yes') : t('common.no')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('forms.currency')}:</span>
                      <span>{item.currency?.name || '—'} {item.currency?.symbol || ''}</span>
                    </div>
                    {item.icon && (
                      <div className="flex justify-between">
                        <span>{t('forms.icon')}:</span>
                        <span className="font-mono">{item.icon}</span>
                      </div>
                    )}
                    {item.is_foreign_currency && (
                      <div className="flex justify-between">
                        <span>{t('forms.is_foreign_currency')}:</span>
                        <span className="text-yellow-600">{t('common.yes')}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}
                      className="hover:bg-primary/5 hover:text-primary flex items-center gap-1">
                      <Pencil className="h-4 w-4" /> {t('common.edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id!)}
                      disabled={item.is_system}
                      className="hover:bg-red-50 hover:text-red-600 flex items-center gap-1">
                      <Trash2 className="h-4 w-4" /> {t('common.delete')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center items-center gap-4">
              <Button variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> {t('common.previous')}
              </Button>
              <span className="text-sm px-4 py-2 bg-gray-50 rounded-md">
                {t('common.page')} {page} {t('common.of')} {Math.ceil(totalCount / 20) || 1}
              </span>
              <Button variant="outline" onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalCount / 20)}
                className="flex items-center gap-2">
                {t('common.next')} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogDescription className="mb-4" />
            <ResourceForm
              fields={fields(t, currencyOptions)}
              onSubmit={handleUpdateSubmit}
              defaultValues={{
                name: editing?.name,
                code: editing?.code,
                currency_id: editing?.currency?.id?.toString() || '',
                icon: editing?.icon,
                is_cash: editing?.is_cash?.toString() || 'false',
                is_active: editing?.is_active?.toString() || 'true',
              }}
              isSubmitting={isUpdating}
              title={t('common.edit') + ' ' + t('navigation.payment_methods').toLowerCase()}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
