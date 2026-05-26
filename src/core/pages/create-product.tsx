import { useNavigate } from "react-router-dom";
import { ResourceForm } from "../helpers/ResourceForm";
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
import { useForm } from "react-hook-form";
import { MultiSelect } from "@/components/MultiSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Package, DollarSign, Settings, Layers, Boxes, Tags } from "lucide-react";

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
              selectedCategoryData.category_name,
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
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("common.create") + " " + t("table.product")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Заполните информацию о товаре
            </p>
          </div>
        </div>

        <ResourceForm<Product>
          form={form}
          fields={[
            {
              name: "name",
              label: t("forms.product_name"),
              type: "text",
              placeholder: t("placeholders.enter_name"),
              required: true,
            },
            {
              name: "category",
              label: t("table.category"),
              type: "select",
              placeholder: t("placeholders.select_category"),
              required: true,
              options: categories.map((category) => ({
                value: category.id,
                label: category.category_name,
              })),
              onChange: (value: string) => setSelectedCategory(Number(value)),
            },
            {
              name: "base_unit",
              label: t("forms.base_unit"),
              type: "select",
              placeholder: t("forms.base_unit"),
              options: availableMeasurements.map((measurement) => ({
                value: measurement.id,
                label: measurement.measurement_name,
              })),
              value: baseUnit,
              onChange: (value: string) => setBaseUnit(value),
            },
            {
              name: "barcode",
              label: t("forms.barcode"),
              type: "text",
              placeholder: t("forms.barcode"),
            },
            {
              name: "sku",
              label: t("forms.sku") || "SKU (Артикул)",
              type: "text",
              placeholder: "SKU",
              hidden: flags?.has_articles === false,
            },
            {
              name: "ikpu",
              label: "IKPU",
              type: "text",
              placeholder: "IKPU",
            },
            {
              name: "plu_code",
              label: "PLU код",
              type: "text",
              placeholder: t("forms.plu_code") || "PLU код",
              hidden: flags?.has_weight === false,
            },
            {
              name: "selling_price",
              label: t("forms.selling_price"),
              type: "number",
              placeholder: t("forms.selling_price"),
              required: true,
              value: sellingPrice,
              onChange: (value: string) => setSellingPrice(value),
            },
            {
              name: "min_price",
              label: t("forms.min_price"),
              type: "number",
              placeholder: t("forms.min_price"),
              required: true,
              value: minPrice,
              onChange: (value: string) => setMinPrice(value),
            },
            {
              name: "low_stock_threshold",
              label: t("forms.low_stock_threshold") || "Мин. остаток",
              type: "number",
              placeholder: t("forms.low_stock_threshold") || "Мин. остаток",
            },
          ]}
          onSubmit={handleSubmit}
          isSubmitting={createProduct.isPending}
          hideSubmitButton
        >
          {/* Toggle Switches Row */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                {t("forms.additional_settings") || "Дополнительные настройки"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {flags?.has_variants !== false && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="has_variations" className="cursor-pointer">
                      {t("forms.has_variations") || "Имеет вариации"}
                    </Label>
                    <Switch
                      id="has_variations"
                      checked={hasVariations}
                      onCheckedChange={setHasVariations}
                    />
                  </div>
                )}
                {flags?.has_expiry !== false && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="track_expiry" className="cursor-pointer">
                      {t("forms.track_expiry") || "Срок годности"}
                    </Label>
                    <Switch
                      id="track_expiry"
                      checked={trackExpiry}
                      onCheckedChange={setTrackExpiry}
                    />
                  </div>
                )}
                {(flags?.has_serial !== false || flags?.has_imei !== false) && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="track_serial_numbers" className="cursor-pointer">
                      {flags?.has_imei ? "IMEI" : (t("forms.track_serial_numbers") || "Серийные номера")}
                    </Label>
                    <Switch
                      id="track_serial_numbers"
                      checked={trackSerialNumbers}
                      onCheckedChange={setTrackSerialNumbers}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <Label htmlFor="enable_initial_stock" className="cursor-pointer">
                    {t("forms.initial_stock") || "Начальный остаток"}
                  </Label>
                  <Switch
                    id="enable_initial_stock"
                    checked={showInitialStock}
                    onCheckedChange={setShowInitialStock}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants Section */}
          {flags?.has_variants !== false && hasVariations && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  {t("forms.variants") || "Вариации"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="relative p-4 rounded-lg border bg-card">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">SKU</Label>
                        <input
                          type="text"
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          placeholder="SKU"
                          value={variant.sku || ""}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index] = { ...newVariants[index], sku: e.target.value };
                            setVariants(newVariants);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">{t("forms.barcode")}</Label>
                        <input
                          type="text"
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          placeholder={t("forms.barcode")}
                          value={variant.barcode || ""}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index] = { ...newVariants[index], barcode: e.target.value };
                            setVariants(newVariants);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">{t("forms.selling_price")}</Label>
                        <input
                          type="number"
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          placeholder={t("forms.selling_price")}
                          value={variant.selling_price || ""}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index] = { ...newVariants[index], selling_price: e.target.value };
                            setVariants(newVariants);
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-1.5 block">{t("forms.min_price")}</Label>
                          <input
                            type="number"
                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            placeholder={t("forms.min_price")}
                            value={variant.min_price || ""}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index] = { ...newVariants[index], min_price: e.target.value };
                              setVariants(newVariants);
                            }}
                          />
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="mt-5 shrink-0 h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setVariants([
                      ...variants,
                      { option_values: [], sku: "", barcode: "", selling_price: "", min_price: "" },
                    ])
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("common.add") || "Добавить вариацию"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unit Conversions Section */}
          {flags?.flexible_units !== false && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {t("forms.unit_conversions") || "Конверсия единиц"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {unitConversions.map((conversion, index) => (
                  <div key={index} className="relative p-4 rounded-lg border bg-card">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">{t("forms.from_unit") || "Из"}</Label>
                        <select
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          value={conversion.from_unit || ""}
                          onChange={(e) => {
                            const newConversions = [...unitConversions];
                            newConversions[index] = {
                              ...newConversions[index],
                              from_unit: parseInt(e.target.value, 10),
                            };
                            setUnitConversions(newConversions);
                          }}
                        >
                          <option value="">{t("forms.from_unit") || "Из"}</option>
                          {availableMeasurements.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.measurement_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">{t("forms.to_unit") || "К"}</Label>
                        <select
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          value={conversion.to_unit || ""}
                          onChange={(e) => {
                            const newConversions = [...unitConversions];
                            newConversions[index] = {
                              ...newConversions[index],
                              to_unit: parseInt(e.target.value, 10),
                            };
                            setUnitConversions(newConversions);
                          }}
                        >
                          <option value="">{t("forms.to_unit") || "К"}</option>
                          {availableMeasurements.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.measurement_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">{t("forms.factor") || "Коэффициент"}</Label>
                        <input
                          type="number"
                          step="any"
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                          placeholder={t("forms.factor") || "Коэффициент"}
                          value={conversion.factor || ""}
                          onChange={(e) => {
                            const newConversions = [...unitConversions];
                            newConversions[index] = { ...newConversions[index], factor: e.target.value };
                            setUnitConversions(newConversions);
                          }}
                        />
                      </div>
                      {index > 0 && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => setUnitConversions(unitConversions.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setUnitConversions([...unitConversions, { from_unit: 0, to_unit: 0, factor: "" }])
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("common.add") || "Добавить конверсию"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Initial Stock Section */}
          {showInitialStock && (
            <Card className="mb-6">
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
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("forms.total_amount") || "Общая сумма"}</Label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      placeholder="0.00"
                      value={initialTotalAmount}
                      onChange={(e) => setInitialTotalAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("forms.note") || "Примечание"}</Label>
                    <input
                      type="text"
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      placeholder={t("forms.note") || "Примечание"}
                      value={initialNote}
                      onChange={(e) => setInitialNote(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card mt-6">
                    <input
                      type="checkbox"
                      id="initial_is_debt"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={initialIsDebt}
                      onChange={(e) => setInitialIsDebt(e.target.checked)}
                    />
                    <Label htmlFor="initial_is_debt" className="cursor-pointer">
                      {t("forms.is_debt") || "Долг"}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dynamic Attribute Fields */}
          {selectedCategory && attributes.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  {t("forms.attributes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attributes.map((attribute) => {
                    const existingValue = attributeValues.find(
                      (v) => v.attribute_id === attribute.id,
                    )?.value;

                    const handleAttributeChange = (
                      value: string | boolean | number[],
                    ) => {
                      setAttributeValues((prev) => {
                        const existing = prev.find(
                          (v) => v.attribute_id === attribute.id,
                        );
                        if (existing) {
                          return prev.map((v) =>
                            v.attribute_id === attribute.id ? { ...v, value } : v,
                          );
                        }
                        return [...prev, { attribute_id: attribute.id!, value }];
                      });
                    };

                    switch (attribute.field_type) {
                      case "string":
                        return (
                          <div key={attribute.id} className="space-y-2">
                            <Label>{attribute.translations.ru}</Label>
                            <input
                              type="text"
                              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                              value={existingValue?.toString() || ""}
                              onChange={(e) => handleAttributeChange(e.target.value)}
                            />
                          </div>
                        );
                      case "number":
                        return (
                          <div key={attribute.id} className="space-y-2">
                            <Label>{attribute.translations.ru}</Label>
                            <input
                              type="number"
                              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                              value={existingValue?.toString() || ""}
                              onChange={(e) => handleAttributeChange(e.target.value)}
                            />
                          </div>
                        );
                      case "boolean":
                        return (
                          <div key={attribute.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <Label className="cursor-pointer">{attribute.translations.ru}</Label>
                            <Switch
                              checked={!!existingValue}
                              onCheckedChange={handleAttributeChange}
                            />
                          </div>
                        );
                      case "choice":
                        return attribute.choices ? (
                          <div key={attribute.id} className="space-y-2">
                            <Label>{attribute.translations.ru}</Label>
                            <select
                              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                              value={existingValue?.toString() || ""}
                              onChange={(e) => handleAttributeChange(e.target.value)}
                            >
                              <option value="">{t("placeholders.select_option")}</option>
                              {attribute.choices.map((choice) => (
                                <option key={choice} value={choice}>{choice}</option>
                              ))}
                            </select>
                          </div>
                        ) : null;
                      case "date":
                        return (
                          <div key={attribute.id} className="space-y-2">
                            <Label>{attribute.translations.ru}</Label>
                            <input
                              type="date"
                              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                              value={existingValue?.toString() || ""}
                              onChange={(e) => handleAttributeChange(e.target.value)}
                            />
                          </div>
                        );
                      case "many2many":
                        return attribute.related_objects ? (
                          <div key={attribute.id} className="col-span-full">
                            <MultiSelect
                              label={attribute.translations.ru}
                              options={attribute.related_objects.map(
                                (obj: { id: number; name: string }) => ({
                                  id: obj.id,
                                  name: obj.name,
                                }),
                              )}
                              value={Array.isArray(existingValue) ? (existingValue as number[]) : []}
                              onChange={(selectedIds) => handleAttributeChange(selectedIds)}
                              placeholder={t("placeholders.select_options")}
                            />
                          </div>
                        ) : null;
                      default:
                        return null;
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
            >
              {t("common.cancel") || "Отмена"}
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending
                ? (t("common.sending") || "Сохранение...")
                : (t("common.submit") || "Создать товар")}
            </Button>
          </div>
        </ResourceForm>
      </div>
    </div>
  );
}
