import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetIncome } from '../api/income';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Wallet,
  CreditCard,
  Store,
} from 'lucide-react';

export default function IncomeDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: income, isLoading } = useGetIncome(Number(id));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!income) return null;

  const source = income.sale ? 'Продажа' : income.debt_payment ? 'Погашение долга' : 'Прочее';

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('ru-RU').format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Наличные':
        return <Wallet className="h-4 w-4 text-green-600" />;
      case 'Карта':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'Click':
        return <Wallet className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        {t('navigation.income')} #{income.id}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-500" />
              {t('forms.store_info')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">{t('forms.store')}</h3>
                <p className="font-medium">{income.store_name || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">{t('forms.worker')}</h3>
                <p className="font-medium">#{income.worker}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">{t('forms.date')}</h3>
                <p className="font-medium">{formatDate(income.timestamp)}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">{t('forms.type')}</h3>
                <p className="font-medium">{source}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              {t('forms.payment_info')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">{t('forms.total_amount')}</h3>
                <p className="font-medium text-emerald-600">{formatCurrency(income.total_amount)} UZS</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500">{t('forms.payment_method')}</h3>
                <div className="space-y-1">
                  {income.payments?.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      {getPaymentIcon(payment.payment_method?.name)}
                      <span>{payment.payment_method?.name}: {formatCurrency(payment.amount)} UZS</span>
                    </div>
                  ))}
                </div>
              </div>
              {income.description && (
                <div>
                  <h3 className="text-sm text-gray-500">{t('forms.description')}</h3>
                  <p className="font-medium">{income.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
