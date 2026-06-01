import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  type CustomerBalanceHistoryEntry,
  useGetCustomerBalanceHistory,
} from "../api/customer-balance-history";
import { useGetCustomers } from "../api/customer";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  ArrowDownToLine,
  RefreshCw,
  Search,
  Calendar,
} from "lucide-react";


const typeColors: Record<string, string> = {
  topup: "text-green-600 bg-green-50",
  cashout: "text-red-600 bg-red-50",
  adjustment: "text-amber-600 bg-amber-50",
  payment: "text-blue-600 bg-blue-50",
  refund: "text-purple-600 bg-purple-50",
};

const typeIcons: Record<string, any> = {
  topup: ArrowUpFromLine,
  cashout: ArrowDownToLine,
  adjustment: RefreshCw,
};

export default function CustomerBalanceHistoryPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [customerId, setCustomerId] = useState(id || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetCustomerBalanceHistory({
    customer: customerId ? Number(customerId) : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    page_size: 20,
    search: search || undefined,
  });
  const { data: customersData } = useGetCustomers({ params: { page_size: 100 } });

  const results = data?.results || [];
  const totalPages = data?.total_pages || 1;
  const customers = Array.isArray(customersData)
    ? customersData
    : customersData?.results || [];

  const TypeIcon = (type: string) => {
    const Icon = typeIcons[type] || RefreshCw;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t("customer_balance_history.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("customer_balance_history.description")}
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t("forms.client")}</Label>
                <Select value={customerId} onValueChange={(v) => { setCustomerId(v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.select_client")} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.phone_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("forms.date_from")}</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("forms.date_to")}</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("placeholders.search")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder={t("placeholders.search")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("messages.no_data_to_display")}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium text-sm">{t("forms.date")}</th>
                      <th className="text-left p-4 font-medium text-sm">{t("forms.client")}</th>
                      <th className="text-left p-4 font-medium text-sm">{t("forms.type")}</th>
                      <th className="text-right p-4 font-medium text-sm">{t("forms.amount")}</th>
                      <th className="text-right p-4 font-medium text-sm">{t("customer_balance_history.previous_balance")}</th>
                      <th className="text-right p-4 font-medium text-sm">{t("customer_balance_history.new_balance")}</th>
                      <th className="text-left p-4 font-medium text-sm">{t("forms.notes")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((entry: CustomerBalanceHistoryEntry) => (
                      <tr key={entry.id} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {entry.created_at}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium">{entry.customer_name}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeColors[entry.type] || "bg-gray-50 text-gray-600"}`}>
                            {TypeIcon(entry.type)}
                            {entry.type}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-mono text-right ${Number(entry.amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {Number(entry.amount) >= 0 ? "+" : ""}{entry.amount}
                        </td>
                        <td className="p-4 text-sm font-mono text-right">{entry.previous_balance}</td>
                        <td className="p-4 text-sm font-mono text-right">{entry.new_balance}</td>
                        <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">{entry.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
