import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useCreateStockEntry } from "../api/stock-entry";
import { useGetStores } from "../api/store";
import { useGetAllSuppliers } from "../api/supplier";
import { useGetCurrencies } from "../api/currency";
import { useGetMeasurements } from "../api/measurement";
import api from "../api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StockLine {
  product: number | null;
  product_name: string;
  product_data: any;
  variant: number | null;
  quantity: string;
  purchase_unit: number | null;
  cost_per_unit: string;
  batch_number: string;
  expiry_date: string;
}

export default function CreateStockEntry() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createStockEntry = useCreateStockEntry();
  const searchRef = useRef<HTMLInputElement>(null);

  const [entryNumber, setEntryNumber] = useState("");
  const [supplier, setSupplier] = useState<string>("");
  const [store, setStore] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [rateAtPurchase, setRateAtPurchase] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isDebt, setIsDebt] = useState(false);
  const [isInventoryAdjustment, setIsInventoryAdjustment] = useState(false);
  const [note, setNote] = useState("");
  const [stockLines, setStockLines] = useState<StockLine[]>([
    { product: null, product_name: "", product_data: null, variant: null, quantity: "", purchase_unit: null, cost_per_unit: "", batch_number: "", expiry_date: "" },
  ]);

  const { data: storesData } = useGetStores({});
  const stores: any[] = Array.isArray(storesData) ? storesData : (storesData as any)?.results || [];

  const { data: suppliersData } = useGetAllSuppliers({});
  const suppliers: any[] = suppliersData || [];

  const { data: currenciesData } = useGetCurrencies({});
  const currencies: any[] = Array.isArray(currenciesData) ? currenciesData : (currenciesData as any)?.results || [];

  const { data: measurementsData } = useGetMeasurements({});
  const allMeasurements: any[] = Array.isArray(measurementsData) ? measurementsData : (measurementsData as any)?.results || [];

  const [productSearchTerms, setProductSearchTerms] = useState<Record<number, string>>({});
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-search-stock-entry", productSearchTerms[activeSearchIndex ?? -1] || ""],
    queryFn: async () => {
      const term = productSearchTerms[activeSearchIndex ?? -1] || "";
      const response = await api.get("/products/", {
        params: { search: term || undefined, page: 1, non_zero: 1, is_imported: false },
      });
      return response.data;
    },
    enabled: activeSearchIndex !== null && (productSearchTerms[activeSearchIndex ?? -1]?.length ?? 0) >= 0,
    staleTime: 30000,
  });

  const filteredProducts: any[] = productsData?.results || [];

  const addStockLine = () => {
    setStockLines([...stockLines, { product: null, product_name: "", product_data: null, variant: null, quantity: "", purchase_unit: null, cost_per_unit: "", batch_number: "", expiry_date: "" }]);
  };

  const removeStockLine = (index: number) => {
    if (stockLines.length <= 1) return;
    setStockLines(stockLines.filter((_, i) => i !== index));
  };

  const updateStockLine = (index: number, field: keyof StockLine, value: any) => {
    const updated = [...stockLines];
    (updated[index] as any)[field] = value;
    setStockLines(updated);
  };

  const handleProductSelect = (index: number, product: any) => {
    const updated = [...stockLines];
    updated[index].product = product.id;
    updated[index].product_name = product.name || product.product_name;
    updated[index].product_data = product;
    updated[index].purchase_unit = null;
    updated[index].variant = null;
    updated[index].cost_per_unit = "";
    setStockLines(updated);
    setActiveSearchIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store) {
      toast.error(t("validation.required_field", { field: t("forms.store") }));
      return;
    }

    const validStocks = stockLines.filter(s => s.product && s.quantity && s.purchase_unit && s.cost_per_unit);
    if (validStocks.length === 0) {
      toast.error(t("stock_entries.no_valid_stocks"));
      return;
    }

    const payload = {
      entry_number: entryNumber.trim() || null,
      supplier: supplier ? parseInt(supplier) : null,
      store: parseInt(store),
      currency: currency ? parseInt(currency) : null,
      rate_at_purchase: rateAtPurchase || "",
      total_amount: totalAmount || "",
      is_debt: isDebt,
      is_inventory_adjustment: isInventoryAdjustment,
      note: note.trim(),
      stocks: validStocks.map(s => ({
        product: s.product!,
        variant: s.variant,
        quantity: s.quantity,
        purchase_unit: s.purchase_unit!,
        cost_per_unit: s.cost_per_unit,
        ...(s.batch_number ? { batch_number: s.batch_number } : {}),
        ...(s.expiry_date ? { expiry_date: s.expiry_date } : {}),
      })),
    };

    try {
      await createStockEntry.mutateAsync(payload as any);
      toast.success(t("messages.success.created", { item: t("navigation.stock_entries") }));
      navigate("/stock-entries");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("messages.error.create", { item: t("navigation.stock_entries") }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/stock-entries")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("common.create")} {t("navigation.stock_entries")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("stock_entries.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {t("forms.basic_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forms.entry_number")}</Label>
                <Input value={entryNumber} onChange={(e) => setEntryNumber(e.target.value)} placeholder={t("placeholders.entry_number")} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("forms.store")} *</Label>
                  <Select value={store} onValueChange={setStore}>
                    <SelectTrigger><SelectValue placeholder={t("placeholders.select_store")} /></SelectTrigger>
                    <SelectContent>
                      {stores.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("forms.supplier")}</Label>
                  <Select value={supplier} onValueChange={setSupplier}>
                    <SelectTrigger><SelectValue placeholder={t("placeholders.select_supplier")} /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("forms.currency")}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue placeholder={t("placeholders.select_currency")} /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("forms.rate_at_purchase")}</Label>
                  <Input value={rateAtPurchase} onChange={(e) => setRateAtPurchase(e.target.value)} placeholder="1.0" type="number" step="any" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="is_debt" className="cursor-pointer text-sm">{t("forms.is_debt")}</Label>
                  <Switch id="is_debt" checked={isDebt} onCheckedChange={setIsDebt} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="is_inventory_adjustment" className="cursor-pointer text-sm">{t("forms.is_inventory_adjustment")}</Label>
                  <Switch id="is_inventory_adjustment" checked={isInventoryAdjustment} onCheckedChange={setIsInventoryAdjustment} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("forms.total_amount")}</Label>
                <Input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0" type="number" step="any" />
              </div>

              <div className="space-y-2">
                <Label>{t("forms.note")}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("placeholders.note")} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {t("stock_entries.stocks")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stockLines.map((line, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("stock_entries.stock_item")} #{index + 1}</span>
                    {stockLines.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeStockLine(index)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t("table.product")} *</Label>
                    <div className="relative" ref={searchRef}>
                      <Input
                        placeholder={t("placeholders.search_products")}
                        value={activeSearchIndex === index ? (productSearchTerms[index] || "") : (line.product_name || "")}
                        onChange={(e) => {
                          setProductSearchTerms({ ...productSearchTerms, [index]: e.target.value });
                          setActiveSearchIndex(index);
                        }}
                        onFocus={() => {
                          if (!line.product_name) {
                            setProductSearchTerms({ ...productSearchTerms, [index]: "" });
                            setActiveSearchIndex(index);
                          }
                        }}
                        autoComplete="off"
                      />
                      {activeSearchIndex === index && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 rounded-lg shadow-xl max-h-[250px] overflow-y-auto">
                          {loadingProducts ? (
                            <div className="px-4 py-4 text-center text-sm">{t("common.loading")}</div>
                          ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product: any) => (
                              <div
                                key={product.id}
                                className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleProductSelect(index, product)}
                              >
                                <div className="font-medium text-sm">{product.name || product.product_name}</div>
                                {product.barcode && <div className="text-xs text-muted-foreground">{product.barcode}</div>}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-4 text-center text-sm text-muted-foreground">{t("common.no_results")}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {line.product && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>{t("forms.quantity")} *</Label>
                          <Input value={line.quantity} onChange={(e) => updateStockLine(index, "quantity", e.target.value)} placeholder="0" type="number" step="any" />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("forms.cost_per_unit")} *</Label>
                          <Input value={line.cost_per_unit} onChange={(e) => updateStockLine(index, "cost_per_unit", e.target.value)} placeholder="0" type="number" step="any" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>{t("forms.purchase_unit")} *</Label>
                          <Select
                            value={line.purchase_unit?.toString() || ""}
                            onValueChange={(v) => updateStockLine(index, "purchase_unit", parseInt(v))}
                          >
                            <SelectTrigger><SelectValue placeholder={t("placeholders.select_unit")} /></SelectTrigger>
                            <SelectContent>
                              {allMeasurements.map((u: any) => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.short_name || u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("forms.batch_number")}</Label>
                          <Input value={line.batch_number} onChange={(e) => updateStockLine(index, "batch_number", e.target.value)} placeholder={t("placeholders.batch_number")} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("forms.expiry_date")}</Label>
                        <Input value={line.expiry_date} onChange={(e) => updateStockLine(index, "expiry_date", e.target.value)} type="date" />
                      </div>
                    </>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addStockLine} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t("stock_entries.add_stock")}
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => navigate("/stock-entries")}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createStockEntry.isPending} size="lg">
              {createStockEntry.isPending ? t("common.sending") : t("common.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
