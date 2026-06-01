import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Banknote, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourseTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { type Loan, useGetLoans, useCreateLoan, useDeleteLoan } from '../api/loan';
import { useGetSponsor } from '../api/sponsors';
import { useGetStores } from '../api/store';
import { useGetCurrencies } from '../api/currency';
import { useGetPaymentMethods } from '../api/payment-methods';
import { Button } from '@/components/ui/button';
import { FaTimes } from 'react-icons/fa';

export default function SponsorLoansPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const sponsorId = Number(id);

  const { data: sponsor } = useGetSponsor(sponsorId);
  const { data: loansData, isLoading } = useGetLoans({
    params: { sponsor: sponsorId, page: currentPage },
    enabled: !!sponsorId,
  });
  const { data: storesData } = useGetStores({ params: { page: 1 } });
  const { data: currenciesData } = useGetCurrencies({ params: { page: 1 } });
  const { data: paymentMethodsData } = useGetPaymentMethods({ params: { page: 1 } });

  const createLoan = useCreateLoan();
  const deleteLoan = useDeleteLoan();

  const stores = Array.isArray(storesData) ? storesData : storesData?.results || [];
  const currencies = Array.isArray(currenciesData) ? currenciesData : currenciesData?.results || [];
  const paymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : paymentMethodsData?.results || [];

  const loans: Loan[] = Array.isArray(loansData)
    ? loansData
    : (loansData as any)?.results || [];
  const totalCount = !Array.isArray(loansData)
    ? (loansData as any)?.count ?? 0
    : loans.length;

  // Compute totals
  const totals = loans.reduce<Record<string, { total: number; paid: number; unpaid: number }>>((acc, loan) => {
    const key = loan.currency?.toString() || '0';
    if (!acc[key]) acc[key] = { total: 0, paid: 0, unpaid: 0 };
    acc[key].total += Number(loan.total_amount) || 0;
    const remaining = Number(loan.remaining_balance) || 0;
    acc[key].paid += (Number(loan.total_amount) || 0) - remaining;
    acc[key].unpaid += remaining;
    return acc;
  }, {});

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  };

  const handleDelete = useCallback(async (loanId: number) => {
    try {
      await deleteLoan.mutateAsync(loanId);
      toast.success(t('messages.success.deleted'));
    } catch {
      toast.error(t('messages.error.delete'));
    }
  }, [deleteLoan, t]);

  const handleCreateLoan = async (data: any) => {
    try {
      await createLoan.mutateAsync({
        sponsor: sponsorId,
        ...data,
        store: data.store ? Number(data.store) : null,
        currency: data.currency ? Number(data.currency) : null,
        payment_method: data.payment_method ? Number(data.payment_method) : null,
        due_date: data.due_date || null,
      } as any);
      toast.success(t('messages.success.created'));
      setShowCreateModal(false);
    } catch {
      toast.error(t('messages.error.create'));
    }
  };

  const columns = [
    {
      header: t('forms.total_amount'),
      accessorKey: (row: Loan) => (
        <span className="font-medium">{Number(row.total_amount).toLocaleString()}</span>
      ),
    },
    {
      header: t('forms.remaining_balance'),
      accessorKey: (row: Loan) => (
        <span className={Number(row.remaining_balance) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
          {Number(row.remaining_balance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: t('forms.store'),
      accessorKey: (row: Loan) => row.store_name || '—',
    },
    {
      header: t('forms.due_date'),
      accessorKey: (row: Loan) => row.due_date ? formatDate(row.due_date) : '—',
    },
    {
      header: t('forms.status'),
      accessorKey: (row: Loan) => row.is_paid ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="h-3 w-3" /> {t('common.paid')}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="h-3 w-3" /> {t('common.unpaid')}
        </span>
      ),
    },
    {
      header: t('forms.created_at'),
      accessorKey: (row: Loan) => formatDate(row.created_at || ''),
    },
    {
      header: t('forms.notes'),
      accessorKey: (row: Loan) => (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-gray-400" />
          <span className="text-sm text-gray-500 truncate max-w-[120px]">{row.notes || '—'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate('/sponsors')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('navigation.loans')} — {sponsor?.name || `#${sponsorId}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('loans.subtitle')}</p>
        </div>

        {Object.entries(totals).map(([currencyId, vals]) => {
          const currency = currencies.find((c: any) => String(c.id) === currencyId);
          const sym = currency?.symbol || '';
          return (
            <div key={currencyId} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">{t('loans.total_amount')}</div>
                <div className="text-2xl font-bold text-blue-700">{vals.total.toLocaleString()} {sym}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600">{t('loans.paid')}</div>
                <div className="text-2xl font-bold text-green-700">{vals.paid.toLocaleString()} {sym}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600">{t('loans.unpaid')}</div>
                <div className="text-2xl font-bold text-red-700">{vals.unpaid.toLocaleString()} {sym}</div>
              </div>
            </div>
          );
        })}

        <ResourceTable
          data={loans}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => setShowCreateModal(true)}
          onDelete={(loanId) => handleDelete(loanId)}
          totalCount={totalCount}
          pageSize={(loansData as any)?.page_size || 30}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          actions={(loan) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/sponsors/${sponsorId}/loans/${loan.id}/payments`)}
            >
              <Banknote className="h-4 w-4 mr-1" />
              {t('loans.payments')}
            </Button>
          )}
        />

        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold">{t('loans.create')}</h4>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowCreateModal(false)}>
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <ResourceForm
                fields={[
                  { name: 'total_amount', label: t('forms.total_amount'), type: 'number', required: true },
                  { name: 'store', label: t('forms.store'), type: 'select', options: stores.map((s: any) => ({ value: s.id, label: s.name })), placeholder: t('placeholders.select_store') },
                  { name: 'currency', label: t('forms.currency'), type: 'select', options: currencies.map((c: any) => ({ value: c.id, label: `${c.name} (${c.symbol})` })), placeholder: t('placeholders.select_currency') },
                  { name: 'payment_method', label: t('forms.payment_method'), type: 'select', options: paymentMethods.map((p: any) => ({ value: p.id, label: p.name })), placeholder: t('placeholders.select_payment_method') },
                  { name: 'due_date', label: t('forms.due_date'), type: 'date' },
                  { name: 'notes', label: t('forms.notes'), type: 'textarea' },
                ]}
                onSubmit={handleCreateLoan}
                isSubmitting={createLoan.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
