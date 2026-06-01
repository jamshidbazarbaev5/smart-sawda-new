import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  type Customer,
  useGetCustomers,
  useDeleteCustomer,
  useTopupBalance,
  useCashoutBalance,
} from "../api/customer";
import { useGetStores } from "../api/store";
import { useGetPaymentMethods } from "../api/payment-methods";
import { useGetCurrencies } from "../api/currency";
import { ResourceTable } from "../helpers/ResourseTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpFromLine, ArrowDownToLine, History } from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceDialog, setBalanceDialog] = useState<{
    id: number;
    type: "topup" | "cashout";
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [store, setStore] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [currency, setCurrency] = useState("");

  const { data: customersData, isLoading } = useGetCustomers({
    params: {
      page,
      page_size: 20,
      name: searchTerm || undefined,
      phone_number: searchTerm || undefined,
    },
  });
  const deleteCustomer = useDeleteCustomer();
  const topupBalance = useTopupBalance();
  const cashoutBalance = useCashoutBalance();
  const { data: storesData } = useGetStores({});
  const { data: paymentMethodsData } = useGetPaymentMethods({});
  const { data: currenciesData } = useGetCurrencies({});

  const currencies = Array.isArray(currenciesData)
    ? currenciesData
    : currenciesData?.results || [];

  const paymentMethods = Array.isArray(paymentMethodsData)
    ? paymentMethodsData
    : paymentMethodsData?.results || [];

  const results = Array.isArray(customersData)
    ? customersData
    : customersData?.results || [];
  const totalCount = !Array.isArray(customersData) ? customersData?.count ?? 0 : results.length;

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success(t("messages.success.deleted"));
    } catch {
      toast.error(t("messages.error.delete"));
    }
  }, [deleteCustomer, t]);

  const handleBalanceAction = async () => {
    if (!balanceDialog || !amount || !store || !paymentMethod || !currency) {
      toast.error(t("messages.error.fill_required_fields"));
      return;
    }
    try {
      const payload = {
        id: balanceDialog.id,
        amount: Number(amount),
        store: Number(store),
        payment_method: Number(paymentMethod),
        currency: Number(currency),
      };
      if (balanceDialog.type === "topup") {
        await topupBalance.mutateAsync(payload);
      } else {
        await cashoutBalance.mutateAsync(payload);
      }
      setBalanceDialog(null);
      setAmount("");
      setStore("");
      setPaymentMethod("");
      setCurrency("");
    } catch {
      // error handled in hook
    }
  };

  const getTotalBalance = (balances: any[]) => {
    if (!balances || balances.length === 0) return "0";
    return balances
      .reduce((sum: number, b: any) => sum + Number(b.amount), 0)
      .toFixed(2);
  };

  const columns = [
    {
      header: t("forms.name"),
      accessorKey: "name" as keyof Customer,
    },
    {
      header: t("forms.phone"),
      accessorKey: "phone_number" as keyof Customer,
    },
    {
      header: t("forms.client_type"),
      accessorKey: (row: Customer) =>
        row.customer_type_name ? (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
            {row.customer_type_name}
          </span>
        ) : "—",
    },
    {
      header: t("forms.company_name"),
      accessorKey: (row: Customer) => row.company_name || "—",
    },
    {
      header: t("table.balance"),
      accessorKey: (row: Customer) => (
        <span className="font-mono">{getTotalBalance(row.balances)}</span>
      ),
    },
    {
      header: t("forms.is_active"),
      accessorKey: (row: Customer) => (
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            row.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.is_active ? "active" : "inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("placeholders.search")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <ResourceTable
          data={results}
          columns={columns}
          isLoading={isLoading}
          onAdd={() => navigate("/customers/create")}
          onEdit={(item) => navigate(`/edit-customer/${item.id}`)}
          onDelete={(id) => handleDelete(id)}
          totalCount={totalCount}
          currentPage={page}
          pageSize={20}
          onPageChange={setPage}
          actions={(row: Customer) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceDialog({ id: row.id!, type: "topup" })}
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                title={t("customers.topup")}
              >
                <ArrowUpFromLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceDialog({ id: row.id!, type: "cashout" })}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                title={t("customers.cashout")}
              >
                <ArrowDownToLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/customers/${row.id}/balance-history`)}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                title={t("customer_balance_history.short")}
              >
                <History className="h-4 w-4" />
              </Button>
            </>
          )}
        />

        <Dialog open={!!balanceDialog} onOpenChange={() => setBalanceDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {balanceDialog?.type === "topup"
                  ? t("customers.topup_title")
                  : t("customers.cashout_title")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forms.amount")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("placeholders.enter_amount")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("forms.store")}</Label>
                <Select value={store} onValueChange={setStore}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.select_store")} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("forms.payment_method")}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.select_payment_method")} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm: any) => (
                      <SelectItem key={pm.id} value={String(pm.id)}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("forms.currency")}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.select_currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBalanceDialog(null)}>
                {t("buttons.cancel")}
              </Button>
              <Button onClick={handleBalanceAction}>{t("buttons.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
