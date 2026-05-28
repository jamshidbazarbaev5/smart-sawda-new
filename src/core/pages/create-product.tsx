import { useNavigate } from "react-router-dom";
import {
  type Product,
  type Variant,
  type UnitConversion,
  useCreateProduct,
  searchProductByBarcode,
} from "../api/product";
import {
  fetchCategoriesWithAttributes,
  fetchAllCategories,
} from "../api/category";
import { useGetMeasurements } from "../api/measurement";
import { useGetStores } from "../api/store";
import { useFrontendConfig } from "../api/frontend-config";
import type { Attribute } from "@/types/attribute";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm, FormProvider } from "react-hook-form";
import { MultiSelect } from "@/components/MultiSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Package, Settings, Layers, Boxes, Tags, Info, DollarSign, ChevronRight } from "lucide-react";

interface AttributeValue {
  attribute_id: number;
  value: string | number | boolean | number[];
}

export default function CreateProduct() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState("");

  const form = useForm<Product>();

  useEffect(() => {
    console.log("Barcode state changed:", barcode);
  }, [barcode]);

  const [minPrice, setMinPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
  const [unitConversions, setUnitConversions] = useState<UnitConversion[]>([
    { from_unit: 0, to_unit: 0, factor: "" },
  ]);
  const [baseUnit, setBaseUnit] = useState("");

  // v2 new fields state
  const [sku, setSku] = useState("");
  const [ikpu, setIkpu] = useState("");
  const [pluCode, setPluCode] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [trackExpiry, setTrackExpiry] = useState(false);
  const [trackSerialNumbers, setTrackSerialNumbers] = useState(false);
  const [hasVariations, setHasVariations] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    { option_values: [], sku: "", barcode: "", selling_price: "", min_price: "" },
  ]);

  // Initial stock state
  const [showInitialStock, setShowInitialStock] = useState(false);
  const [initialStore, setInitialStore] = useState<number | "">("");
  const [initialSupplier, setInitialSupplier] = useState<number | null>(null);
  const [initialTotalAmount, setInitialTotalAmount] = useState("0.00");
  const [initialIsDebt, setInitialIsDebt] = useState(false);
  const [initialNote, setInitialNote] = useState("");

  // Barcode scanner state
  const [scanBuffer, setScanBuffer] = useState("");
  const [_isScanning, setIsScanning] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: measurementsData } = useGetMeasurements({});
  const { data: storesData } = useGetStores({});
  const { data: frontendConfig } = useFrontendConfig();
  const flags = frontendConfig?.shop_flags;

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const allCategories = await fetchAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch all categories:', error);
        toast.error('Failed to load categories');
      }
    };
    loadAllCategories();
  }, []);

  const availableMeasurements = Array.isArray(measurementsData)
    ? measurementsData
    : measurementsData?.results || [];

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        if (selectedCategory) {
          const selectedCategoryData = categories.find(
            (cat) => cat.id === selectedCategory,
          );
          if (selectedCategoryData) {
            const response = await fetchCategoriesWithAttributes(
              selectedCategoryData.name,
            );
            const categoryWithAttributes = response.results.find(
              (cat) => cat.id === selectedCategory,
            );
            if (categoryWithAttributes?.attributes_read) {
              setAttributes(categoryWithAttributes.attributes_read);
            } else {
              setAttributes([]);
            }
          }
        } else {
          setAttributes([]);
        }
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
        setAttributes([]);
      }
    };
    fetchAttributes();
  }, [selectedCategory, categories]);

  const populateFormWithProduct = (product: Product) => {
    form.setValue("name", product.name || product.product_name || "");
    form.setValue("barcode", product.barcode || "");

    if (product.category || product.category_write) {
      const catId = product.category ?? product.category_write;
      form.setValue("category", catId!);
      setSelectedCategory(catId!);
    }

    if (product.base_unit) {
      setBaseUnit(product.base_unit.toString());
    }

    if (product.min_price) {
      setMinPrice(product.min_price.toString());
    }

    if (product.selling_price) {
      setSellingPrice(product.selling_price.toString());
    }

    if (product.sku !== undefined) setSku(product.sku || "");
    if (product.ikpu !== undefined) setIkpu(product.ikpu || "");
    if (product.plu_code !== undefined) setPluCode(product.plu_code || "");
    if (product.low_stock_threshold !== undefined) setLowStockThreshold(product.low_stock_threshold || "");

    if (product.unit_conversions && product.unit_conversions.length > 0) {
      setUnitConversions(product.unit_conversions);
    }

    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants);
    }

    if (product.attribute_values_response && product.attribute_values_response.length > 0) {
      const formattedAttributes = product.attribute_values_response.map(
        (av) => ({
          attribute_id: av.attribute.id!,
          value: av.value,
        }),
      );
      setAttributeValues(formattedAttributes);
    }

    setBarcode(product.barcode || "");
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      setIsScanning(true);

      if (event.key === "Enter") {
        event.preventDefault();
        if (scanBuffer.trim()) {
          searchProductByBarcode(scanBuffer.trim())
            .then((product) => {
              if (product) {
                populateFormWithProduct(product);
                toast.success(`Product found: ${product.name || product.product_name}`);
              } else {
                setBarcode(scanBuffer.trim());
                form.setValue("barcode", scanBuffer.trim());
                toast.info("No product found with barcode. You can create a new product.");
              }
            })
            .catch(() => {
              setBarcode(scanBuffer.trim());
              form.setValue("barcode", scanBuffer.trim());
              toast.error("Error searching for product. Barcode set for new product.");
            });
        }
        setScanBuffer("");
        setIsScanning(false);
        return;
      }

      if (event.key.length === 1) {
        setScanBuffer((prev) => prev + event.key);
        scanTimeoutRef.current = setTimeout(() => {
          setScanBuffer("");
          setIsScanning(false);
        }, 100);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [scanBuffer]);

  const handleSubmit = async (data: any) => {
    try {
      const formattedData: Record<string, any> = {
        name: data.name,
        category: data.category ? Number(data.category) : null,
        base_unit: baseUnit ? parseInt(baseUnit, 10) : undefined,
        barcode: barcode || null,
        sku: sku || null,
        ikpu: ikpu || null,
        plu_code: pluCode || undefined,
        low_stock_threshold: lowStockThreshold || undefined,
        selling_price: sellingPrice || undefined,
        min_price: minPrice || undefined,
        has_variations: hasVariations,
        track_expiry: trackExpiry,
        track_serial_numbers: trackSerialNumbers,
      };

      if (unitConversions.length > 0) {
        formattedData.unit_conversions = unitConversions
          .filter((uc) => uc.from_unit && uc.to_unit && uc.factor)
          .map((uc) => ({
            from_unit: uc.from_unit,
            to_unit: uc.to_unit,
            factor: uc.factor,
          }));
      }

      if (hasVariations && variants.length > 0) {
        formattedData.variants = variants.map((v) => ({
          ...(v.id !== undefined ? { id: v.id } : {}),
          option_values: v.option_values,
          sku: v.sku || "",
          barcode: v.barcode || "",
          selling_price: v.selling_price || "",
          min_price: v.min_price || "",
        }));
      }

      if (showInitialStock && initialStore) {
        formattedData.initial_stock = {
          store: Number(initialStore),
          supplier: initialSupplier,
          total_amount: initialTotalAmount,
          is_debt: initialIsDebt,
          note: initialNote,
          stocks: [
            {
              variant_index: null,
              quantity: "0",
              purchase_unit: baseUnit ? parseInt(baseUnit, 10) : 1,
              cost_per_unit: "0.00",
              batch_number: "",
              expiry_date: null,
            },
          ],
        };
      }

      if (attributeValues.length > 0) {
        formattedData.attribute_values = attributeValues.map((av) => ({
          ...av,
          value:
            typeof av.value === "string" && !isNaN(Number(av.value))
              ? Number(av.value)
              : av.value,
        }));
      }

      await createProduct.mutateAsync(formattedData as Product);
      toast.success(t("messages.success.created", { item: t("table.product") }));
      navigate("/products");
    } catch (error) {
      toast.error(t("messages.error.create", { item: t("table.product") }));
      console.error("Failed to create product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("common.create") + " " + t("table.product")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("create_product.subtitle")}</p>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.basic")}</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.pricing")}</span>
                </TabsTrigger>
                <TabsTrigger value="variations" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.variations")}</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.advanced")}</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab: Basic Info */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      {t("forms.basic_info") || "Основная информация"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                        <Label>{t("forms.product_name")} *</Label>
                        <Input
                          {...form.register("name")}
                          placeholder={t("placeholders.enter_name")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("table.category")} *</Label>
                        <select
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          value={selectedCategory || ""}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            setSelectedCategory(val);
                            form.setValue("category", val!);
                          }}
                        >
                          <option value="">{t("placeholders.select_category")}</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("forms.base_unit")} *</Label>
                        <select
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          value={baseUnit}
                          onChange={(e) => setBaseUnit(e.target.value)}
                        >
                          <option value="">{t("forms.base_unit")}</option>
                          {availableMeasurements.map((m) => (
                            <option key={m.id} value={m.id}>{m.name || m.measurement_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("forms.barcode")}</Label>
                        <Input
                          value={barcode}
                          onChange={(e) => { setBarcode(e.target.value); form.setValue("barcode", e.target.value); }}
                          placeholder={t("forms.barcode")}
                        />
                      </div>
                      {flags?.has_articles !== false && (
                        <div className="space-y-2">
                          <Label>{t("forms.sku") || "SKU (Артикул)"}</Label>
                          <Input
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder={t("forms.sku")}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>{t("forms.ikpu")}</Label>
                        <Input
                          value={ikpu}
                          onChange={(e) => setIkpu(e.target.value)}
                          placeholder={t("forms.ikpu")}
                        />
                      </div>
                      {flags?.has_weight !== false && (
                        <div className="space-y-2">
                          <Label>{t("forms.plu_code") || "PLU код"}</Label>
                          <Input
                            value={pluCode}
                            onChange={(e) => setPluCode(e.target.value)}
                            placeholder={t("forms.plu_code") || "PLU код"}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Pricing */}
              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {t("forms.pricing") || "Цены и остатки"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t("forms.selling_price")} *</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(e.target.value)}
                            placeholder={t("forms.selling_price")}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("forms.min_price")} *</Label>
                        <Input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder={t("forms.min_price")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("forms.low_stock_threshold") || "Мин. остаток"}</Label>
                        <Input
                          type="number"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                          placeholder={t("forms.low_stock_threshold") || "Мин. остаток"}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Initial Stock Toggle */}
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <Label htmlFor="enable_initial_stock" className="cursor-pointer text-sm font-medium">{t("forms.initial_stock") || "Нач. остаток"}</Label>
                      <Switch id="enable_initial_stock" checked={showInitialStock} onCheckedChange={setShowInitialStock} />
                    </div>
                  </CardContent>
                </Card>

                {/* Initial Stock */}
                {showInitialStock && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-muted-foreground" />
                        {t("forms.initial_stock") || "Начальный остаток"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("forms.store") || "Склад"}</Label>
                          <select
                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={initialStore}
                            onChange={(e) => setInitialStore(Number(e.target.value))}
                          >
                            <option value="">{t("placeholders.select_store") || "Выберите склад"}</option>
                            {stores.map((store: any) => (
                              <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("forms.total_amount") || "Общая сумма"}</Label>
                          <Input
                            type="number" step="0.01"
                            value={initialTotalAmount}
                            onChange={(e) => setInitialTotalAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("forms.note") || "Примечание"}</Label>
                          <Input
                            value={initialNote}
                            onChange={(e) => setInitialNote(e.target.value)}
                            placeholder={t("forms.note") || "Примечание"}
                          />
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card mt-6">
                          <input type="checkbox" id="initial_is_debt" className="h-4 w-4" checked={initialIsDebt} onChange={(e) => setInitialIsDebt(e.target.checked)} />
                          <Label htmlFor="initial_is_debt" className="cursor-pointer">{t("forms.is_debt") || "Долг"}</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Variations */}
              <TabsContent value="variations" className="space-y-6">
                {flags?.has_variants !== false && (
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <Label htmlFor="has_variations" className="cursor-pointer text-sm font-medium">{t("forms.has_variations") || "Вариации"}</Label>
                        <Switch id="has_variations" checked={hasVariations} onCheckedChange={setHasVariations} />
                      </div>
                    </CardContent>
                  </Card>
                )}
                {flags?.has_variants === false && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t("messages.variants_disabled") || "Вариации не поддерживаются для вашего тарифа"}
                    </CardContent>
                  </Card>
                )}
                {flags?.has_variants !== false && !hasVariations && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-4">{t("messages.enable_variants") || "Включите вариации в настройках товара"}</p>
                    </CardContent>
                  </Card>
                )}
                {flags?.has_variants !== false && hasVariations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        {t("forms.variants") || "Вариации"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {variants.map((variant, index) => (
                        <div key={index} className="relative p-4 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {t("forms.variant") || "Вариант"} #{index + 1}
                            </span>
                            {index > 0 && (
                              <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => setVariants(variants.filter((_, i) => i !== index))}>
                                <Trash2 className="h-4 w-4 mr-1" />{t("common.delete") || "Удалить"}
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.sku")}</Label>
                              <Input value={variant.sku || ""} onChange={(e) => { const v = [...variants]; v[index] = { ...v[index], sku: e.target.value }; setVariants(v); }} placeholder={t("forms.sku")} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.barcode")}</Label>
                              <Input value={variant.barcode || ""} onChange={(e) => { const v = [...variants]; v[index] = { ...v[index], barcode: e.target.value }; setVariants(v); }} placeholder={t("forms.barcode")} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.selling_price")}</Label>
                              <Input type="number" value={variant.selling_price || ""} onChange={(e) => { const v = [...variants]; v[index] = { ...v[index], selling_price: e.target.value }; setVariants(v); }} placeholder={t("forms.selling_price")} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.min_price")}</Label>
                              <Input type="number" value={variant.min_price || ""} onChange={(e) => { const v = [...variants]; v[index] = { ...v[index], min_price: e.target.value }; setVariants(v); }} placeholder={t("forms.min_price")} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setVariants([...variants, { option_values: [], sku: "", barcode: "", selling_price: "", min_price: "" }])}>
                        <Plus className="h-4 w-4 mr-2" />{t("common.add") || "Добавить вариацию"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Unit Conversions */}
                {flags?.flexible_units !== false && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {t("forms.unit_conversions") || "Конверсия единиц"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {unitConversions.map((conversion, index) => (
                        <div key={index} className="relative p-4 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {t("forms.conversion") || "Конверсия"} #{index + 1}
                            </span>
                            {index > 0 && (
                              <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => setUnitConversions(unitConversions.filter((_, i) => i !== index))}>
                                <Trash2 className="h-4 w-4 mr-1" />{t("common.delete") || "Удалить"}
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.from_unit") || "Из"}</Label>
                              <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" value={conversion.from_unit || ""} onChange={(e) => { const c = [...unitConversions]; c[index] = { ...c[index], from_unit: parseInt(e.target.value, 10) }; setUnitConversions(c); }}>
                                <option value="">{t("forms.from_unit") || "Из"}</option>
                                {availableMeasurements.map((m) => (<option key={m.id} value={m.id}>{m.name || m.measurement_name}</option>))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.to_unit") || "К"}</Label>
                              <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" value={conversion.to_unit || ""} onChange={(e) => { const c = [...unitConversions]; c[index] = { ...c[index], to_unit: parseInt(e.target.value, 10) }; setUnitConversions(c); }}>
                                <option value="">{t("forms.to_unit") || "К"}</option>
                                {availableMeasurements.map((m) => (<option key={m.id} value={m.id}>{m.name || m.measurement_name}</option>))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">{t("forms.factor") || "Коэффициент"}</Label>
                              <Input type="number" step="any" value={conversion.factor || ""} onChange={(e) => { const c = [...unitConversions]; c[index] = { ...c[index], factor: e.target.value }; setUnitConversions(c); }} placeholder={t("forms.factor") || "Коэффициент"} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setUnitConversions([...unitConversions, { from_unit: 0, to_unit: 0, factor: "" }])}>
                        <Plus className="h-4 w-4 mr-2" />{t("common.add") || "Добавить конверсию"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Advanced */}
              <TabsContent value="advanced" className="space-y-6">
                {/* Tracking Toggles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      {t("forms.tracking") || "Отслеживание"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {flags?.has_expiry !== false && (
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <Label htmlFor="track_expiry" className="cursor-pointer text-sm">{t("forms.track_expiry") || "Срок годности"}</Label>
                          <Switch id="track_expiry" checked={trackExpiry} onCheckedChange={setTrackExpiry} />
                        </div>
                      )}
                      {(flags?.has_serial !== false || flags?.has_imei !== false) && (
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <Label htmlFor="track_serial_numbers" className="cursor-pointer text-sm">
                            {flags?.has_imei ? "IMEI" : (t("forms.track_serial_numbers") || "Серийные номера")}
                          </Label>
                          <Switch id="track_serial_numbers" checked={trackSerialNumbers} onCheckedChange={setTrackSerialNumbers} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Attributes */}
                {selectedCategory && attributes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                        {t("forms.attributes")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {attributes.map((attribute) => {
                          const existingValue = attributeValues.find((v) => v.attribute_id === attribute.id)?.value;
                          const handleChange = (value: string | boolean | number[]) => {
                            setAttributeValues((prev) => {
                              const existing = prev.find((v) => v.attribute_id === attribute.id);
                              if (existing) return prev.map((v) => v.attribute_id === attribute.id ? { ...v, value } : v);
                              return [...prev, { attribute_id: attribute.id!, value }];
                            });
                          };
                          switch (attribute.field_type) {
                            case "string": return (
                              <div key={attribute.id} className="space-y-2">
                                <Label>{attribute.translations.ru}</Label>
                                <Input value={existingValue?.toString() || ""} onChange={(e) => handleChange(e.target.value)} />
                              </div>
                            );
                            case "number": return (
                              <div key={attribute.id} className="space-y-2">
                                <Label>{attribute.translations.ru}</Label>
                                <Input type="number" value={existingValue?.toString() || ""} onChange={(e) => handleChange(e.target.value)} />
                              </div>
                            );
                            case "boolean": return (
                              <div key={attribute.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                <Label className="cursor-pointer">{attribute.translations.ru}</Label>
                                <Switch checked={!!existingValue} onCheckedChange={handleChange} />
                              </div>
                            );
                            case "choice": return attribute.choices ? (
                              <div key={attribute.id} className="space-y-2">
                                <Label>{attribute.translations.ru}</Label>
                                <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" value={existingValue?.toString() || ""} onChange={(e) => handleChange(e.target.value)}>
                                  <option value="">{t("placeholders.select_option")}</option>
                                  {attribute.choices.map((c) => (<option key={c} value={c}>{c}</option>))}
                                </select>
                              </div>
                            ) : null;
                            case "date": return (
                              <div key={attribute.id} className="space-y-2">
                                <Label>{attribute.translations.ru}</Label>
                                <Input type="date" value={existingValue?.toString() || ""} onChange={(e) => handleChange(e.target.value)} />
                              </div>
                            );
                            case "many2many": return attribute.related_objects ? (
                              <div key={attribute.id} className="col-span-full">
                                <MultiSelect
                                  label={attribute.translations.ru}
                                  options={attribute.related_objects.map((obj: { id: number; name: string }) => ({ id: obj.id, name: obj.name }))}
                                  value={Array.isArray(existingValue) ? (existingValue as number[]) : []}
                                  onChange={(ids) => handleChange(ids)}
                                  placeholder={t("placeholders.select_options")}
                                />
                              </div>
                            ) : null;
                            default: return null;
                          }
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedCategory && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t("messages.select_category_for_attributes") || "Выберите категорию, чтобы увидеть атрибуты"}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Submit Footer */}
            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t">
              <Button type="button" variant="ghost" onClick={() => navigate("/products")}>
                {t("common.cancel") || "Отмена"}
              </Button>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={createProduct.isPending} size="lg">
                  {createProduct.isPending
                    ? (t("common.sending") || "Сохранение...")
                    : ((t("common.create") || "Создать") + " " + (t("table.product") || "товар"))}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
