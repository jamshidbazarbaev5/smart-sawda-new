import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGetIncomes } from "../api/income";
import { useGetUsers } from "../api/user";
import { ResourceTable } from "../helpers/ResourseTable";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  CreditCard,
  Wallet,
  SmartphoneNfc,
  Landmark,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetStores } from "../api/store";
import type { Store } from "../api/store";
import "react-datepicker/dist/react-datepicker.css";
import { useCurrentUser } from "../hooks/useCurrentUser";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

export default function IncomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    setPage(1);
  }, [selectedStore, selectedWorker, startDate, endDate]);

  const { data: storesData } = useGetStores();
  const { data: usersData } = useGetUsers();
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];
  const { data: currentUser } = useCurrentUser();

  const { data: incomesData, isLoading } = useGetIncomes({
    params: {
      ...(selectedStore !== "all" && { store: selectedStore }),
      ...(selectedWorker !== "all" && { worker: selectedWorker }),
      ...(startDate && { start_date: format(startDate, "yyyy-MM-dd") }),
      ...(endDate && { end_date: format(endDate, "yyyy-MM-dd") }),
      page: page,
    },
  });

  const incomes = Array.isArray(incomesData)
    ? incomesData
    : incomesData?.results || [];
  const totalCount = Array.isArray(incomesData)
    ? incomes.length
    : incomesData?.count || 0;

  const totalsData: any = !Array.isArray(incomesData) ? incomesData : null;
  const totalAmountAll = totalsData?.total_amount_all || 0;
  const totalAmountPage = totalsData?.total_amount_page || 0;
  const totalPaymentsAll = totalsData?.total_payments_all || {};
  const totalPaymentsPage = totalsData?.total_payments_page || {};

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("ru-RU").format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.name || `#${userId}`;
  };

  const getSource = (row: any) => {
    if (row.sale) return t("table.sale");
    if (row.debt_payment) return t("navigation.debts");
    return "-";
  };

  const columns = [
    {
      header: t("forms.store"),
      accessorKey: "store_name",
      cell: (row: any) => row.store_name || "-",
    },
    {
      header: t("table.source"),
      accessorKey: "sale",
      cell: (row: any) => getSource(row),
    },
    {
      header: t("forms.amount"),
      accessorKey: "total_amount",
      cell: (row: any) => (
        <span className="font-medium text-emerald-600">
          {formatCurrency(row.total_amount)} UZS
        </span>
      ),
    },
    {
      header: t("forms.payment_method"),
      accessorKey: "payments",
      cell: (row: any) => {
        if (!row.payments?.length) return "-";
        return row.payments.map((p: any) => p.payment_method?.name).join(", ");
      },
    },
    {
      header: t("forms.worker"),
      accessorKey: "worker",
      cell: (row: any) => getUserName(row.worker),
    },
    {
      header: t("forms.date"),
      accessorKey: "timestamp",
      cell: (row: any) => formatDate(row.timestamp),
    },
    {
      header: t("forms.comment"),
      accessorKey: "description",
      cell: (row: any) => row.description || "-",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.incomes")}</h1>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        {currentUser?.is_superuser && (
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("forms.select_store")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("forms.all_stores")}</SelectItem>
              {stores.map((store: Store) => (
                <SelectItem key={store.id} value={String(store.id)}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={selectedWorker} onValueChange={setSelectedWorker}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("forms.select_worker")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("forms.all_workers")}</SelectItem>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={String(user.id)}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-4">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            placeholderText={t("forms.start_date")}
            className="w-[200px] flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || undefined}
            dateFormat="dd/MM/yyyy"
            placeholderText={t("forms.end_date")}
            className="w-[200px] flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <Card>
        <ResourceTable
          data={incomes}
          columns={columns}
          isLoading={isLoading}
          totalCount={totalCount}
          pageSize={30}
          currentPage={page}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>

      {totalsData && (
        <Card className="p-4 sm:p-6 mb-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Итоги</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Общая сумма (все)
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(totalAmountAll)} UZS
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Сумма на странице
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(totalAmountPage)} UZS
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Всего записей
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {totalCount}
                </p>
              </div>
            </div>

            {Object.keys(totalPaymentsAll).length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Способы оплаты (все страницы)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(totalPaymentsAll).map(([method, amount]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        {method === "Наличные" && <Wallet className="h-5 w-5 text-green-600" />}
                        {method === "Карта" && <CreditCard className="h-5 w-5 text-blue-600" />}
                        {method === "Click" && <SmartphoneNfc className="h-5 w-5 text-purple-600" />}
                        {method === "Перечисление" && <Landmark className="h-5 w-5 text-orange-500" />}
                        {method === "Валюта" && <DollarSign className="h-5 w-5 text-yellow-600" />}
                        <span className="font-medium text-gray-700">{method}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(amount as number)}{method === "Валюта" ? " $" : " UZS"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(totalPaymentsPage).length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  Способы оплаты (текущая страница)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(totalPaymentsPage).map(([method, amount]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        {method === "Наличные" && <Wallet className="h-5 w-5 text-green-600" />}
                        {method === "Карта" && <CreditCard className="h-5 w-5 text-blue-600" />}
                        {method === "Click" && <SmartphoneNfc className="h-5 w-5 text-purple-600" />}
                        {method === "Перечисление" && <Landmark className="h-5 w-5 text-orange-500" />}
                        {method === "Валюта" && <DollarSign className="h-5 w-5 text-yellow-600" />}
                        <span className="font-medium text-gray-700">{method}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(amount as number)}{method === "Валюта" ? " $" : " UZS"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
