import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type CurrencyRate,
  useGetCurrencyRates,
  useCreateCurrencyRate,
  useUpdateCurrencyRate,
  useDeleteCurrencyRate,
} from "../api/currency-rate";
import { useGetCurrencies } from "../api/currency";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function ExchangeRatesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [rateValue, setRateValue] = useState("");

  const { data: ratesData, isLoading } = useGetCurrencyRates({
    params: { page, page_size: 20, from_code: searchTerm || undefined },
  });
  const { data: currenciesData } = useGetCurrencies({});
  const createCurrencyRate = useCreateCurrencyRate();
  const updateCurrencyRate = useUpdateCurrencyRate();
  const deleteCurrencyRate = useDeleteCurrencyRate();

  const rates = Array.isArray(ratesData) ? ratesData : ratesData?.results || [];
  const totalPages =
    !Array.isArray(ratesData) && ratesData?.total_pages
      ? ratesData.total_pages
      : 1;

  const currencies = Array.isArray(currenciesData)
    ? currenciesData
    : currenciesData?.results || [];

  const usedCurrencyIds = new Set(rates.map((r: CurrencyRate) => r.from_currency));
  const availableCurrencies = currencies.filter(
    (c: any) => !usedCurrencyIds.has(c.id),
  );

  const handleCreate = async () => {
    if (!selectedCurrency || !rateValue) {
      toast.error(t("messages.error.fill_required_fields"));
      return;
    }
    try {
      await createCurrencyRate.mutateAsync({
        currency: Number(selectedCurrency),
        rate: rateValue,
      });
      toast.success(t("messages.success.created"));
      setCreateOpen(false);
      setSelectedCurrency("");
      setRateValue("");
    } catch {
      toast.error(t("messages.error.create"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("messages.confirmation.delete"))) return;
    try {
      await deleteCurrencyRate.mutateAsync(id);
      toast.success(t("messages.success.deleted"));
    } catch {
      toast.error(t("messages.error.delete"));
    }
  };

  const getCurrencyName = (id: number) => {
    const c = currencies.find((cc: any) => cc.id === id);
    return c ? `${c.name} (${c.code})` : `#${id}`;
  };

  const getCurrencyCode = (id: number) => {
    const c = currencies.find((cc: any) => cc.id === id);
    return c?.code || `#${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {t("navigation.exchange_rates")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("exchange_rates.description")}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={availableCurrencies.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("messages.create")}
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder={t("placeholders.search")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-16 bg-gray-100 rounded-t-lg" />
                <CardContent className="h-12 bg-gray-50" />
              </Card>
            ))}
          </div>
        ) : rates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("messages.no_data_to_display")}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rates.map((item: CurrencyRate) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="font-mono">
                        {item.from_code || getCurrencyCode(item.from_currency)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono">
                        {item.to_code || getCurrencyCode(item.to_currency)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold font-mono">
                        {item.rate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.created_at}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {getCurrencyName(item.from_currency)}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => item.id && handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("exchange_rates.create_title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forms.currency")}</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("placeholders.select_currency")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("forms.exchange_rate")}</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  placeholder={t("placeholders.enter_exchange_rate")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {t("buttons.cancel")}
              </Button>
              <Button onClick={handleCreate}>{t("buttons.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
