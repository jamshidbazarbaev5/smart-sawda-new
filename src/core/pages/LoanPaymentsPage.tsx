import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Banknote, FileText } from 'lucide-react';
import { ResourceTable } from '../helpers/ResourseTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { type LoanPayment, useGetLoanPayments, useCreateLoanPayment, useDeleteLoanPayment } from '../api/loanpayment';
import { useGetLoan } from '../api/loan';
import { useGetStores } from '../api/store';
import { useGetPaymentMethods } from '../api/payment-methods';
import { Button } from '@/components/ui/button';
import { FaTimes } from 'react-icons/fa';

export default function LoanPaymentsPage() {
  const { t } = useTranslation();
  const { id: sponsorId, loanId } = useParams<{ id: string; loanId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: loan, isLoading: isLoanLoading } = useGetLoan(Number(loanId));
  const { data: paymentsData, isLoading } = useGetLoanPayments({
    params: { loan: loanId, page: currentPage },
    enabled: !!loanId,
  });
  const { data: storesData } = useGetStores({ params: { page: 1 } });
  const { data: paymentMethodsData } = useGetPaymentMethods({ params: { page: 1 } });

  const createLoanPayment = useCreateLoanPayment();
  const deleteLoanPayment = useDeleteLoanPayment();

  const stores = Array.isArray(storesData) ? storesData : storesData?.results || [];
  const paymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : paymentMethodsData?.results || [];

  const payments: LoanPayment[] = Array.isArray(paymentsData)
    ? paymentsData
    : (paymentsData as any)?.results || [];
  const totalCount = !Array.isArray(paymentsData)
    ? (paymentsData as any)?.count ?? 0
    : payments.length;

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleDelete = useCallback(async (paymentId: number) => {
    try {
      await deleteLoanPayment.mutateAsync(paymentId);
      toast.success(t('messages.success.deleted'));
    } catch {
      toast.error(t('messages.error.delete'));
    }
  }, [deleteLoanPayment, t]);

  const handleCreatePayment = async (data: any) => {
    try {
      await createLoanPayment.mutateAsync({
        loan: Number(loanId),
        ...data,
        store: data.store ? Number(data.store) : null,
        payment_method: Number(data.payment_method),
      } as any);
      toast.success(t('messages.success.created'));
      setShowCreateModal(false);
    } catch {
      toast.error(t('messages.error.create'));
    }
  };

  const columns = [
    {
      header: t('forms.amount'),
      accessorKey: (row: LoanPayment) => (
        <span className="font-medium">{Number(row.amount).toLocaleString()}</span>
      ),
    },
    {
      header: t('forms.payment_method'),
      accessorKey: (row: LoanPayment) => row.payment_method?.name || '—',
    },
    {
      header: t('forms.store'),
      accessorKey: () => loan?.store_name || '—',
    },
    {
      header: t('forms.notes'),
      accessorKey: (row: LoanPayment) => (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-gray-400" />
          <span className="text-sm text-gray-500 truncate max-w-[200px]">{row.notes || '—'}</span>
        </div>
      ),
    },
    {
      header: t('forms.date'),
      accessorKey: (row: LoanPayment) => formatDate(row.created_at || ''),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate(`/sponsors/${sponsorId}/loans`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('loans.payments_for')} #{loanId}
          </h1>
          {loan && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600">{t('forms.total_amount')}</div>
                <div className="text-lg font-bold text-blue-700">{Number(loan.total_amount).toLocaleString()}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-xs text-red-600">{t('forms.remaining_balance')}</div>
                <div className="text-lg font-bold text-red-700">{Number(loan.remaining_balance || 0).toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">{t('forms.due_date')}</div>
                <div className="text-lg font-bold">{loan.due_date || '—'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">{t('forms.status')}</div>
                <div className="text-lg font-bold">{loan.is_paid ? t('common.paid') : t('common.unpaid')}</div>
              </div>
            </div>
          )}
        </div>

        <ResourceTable
          data={payments}
          columns={columns}
          isLoading={isLoading || isLoanLoading}
          onAdd={() => setShowCreateModal(true)}
          onDelete={(paymentId) => handleDelete(paymentId)}
          totalCount={totalCount}
          pageSize={(paymentsData as any)?.page_size || 30}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold">{t('loans.add_payment')}</h4>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowCreateModal(false)}>
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <ResourceForm
                fields={[
                  { name: 'amount', label: t('forms.amount'), type: 'number', required: true },
                  { name: 'payment_method', label: t('forms.payment_method'), type: 'select', required: true, options: paymentMethods.map((p: any) => ({ value: p.id, label: p.name })), placeholder: t('placeholders.select_payment_method') },
                  { name: 'store', label: t('forms.store'), type: 'select', options: stores.map((s: any) => ({ value: s.id, label: s.name })), placeholder: t('placeholders.select_store') },
                  { name: 'notes', label: t('forms.notes'), type: 'textarea' },
                ]}
                onSubmit={handleCreatePayment}
                isSubmitting={createLoanPayment.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
