import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, Search, Package } from "lucide-react";
import { ResourceTable } from "../helpers/ResourseTable";
import { useGetStockEntries, useDeleteStockEntry, type StockEntry } from "../api/stock-entry";

export default function StockEntriesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetStockEntries({ params: { page, search } });
  const deleteStockEntry = useDeleteStockEntry();

  const results: StockEntry[] = Array.isArray(data)
    ? data
    : (data as any)?.results || [];
  const totalCount = (data as any)?.count || 0;

  const handleDelete = async (id: number) => {
    try {
      await deleteStockEntry.mutateAsync(id);
      toast.success(t("messages.success.deleted", { item: t("navigation.stock_entries") }));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("messages.error.delete", { item: t("navigation.stock_entries") }));
    }
  };

  const columns = [
    {
      header: t("table.entry_number"),
      accessorKey: (row: StockEntry) => row.entry_number || "—",
    },
    {
      header: t("forms.supplier"),
      accessorKey: (row: StockEntry) => row.supplier_name || "—",
    },
    {
      header: t("forms.store"),
      accessorKey: (row: StockEntry) => row.store_name || "—",
    },
    {
      header: t("table.total_amount"),
      accessorKey: (row: StockEntry) => row.total_amount
        ? Number(row.total_amount).toLocaleString()
        : "—",
    },
    {
      header: t("forms.currency"),
      accessorKey: (row: StockEntry) => row.currency?.symbol || row.currency?.name || "—",
    },
    {
      header: t("table.is_debt"),
      accessorKey: (row: StockEntry) => row.is_debt ? <Badge variant="destructive">{t("common.yes")}</Badge> : "—",
    },
    {
      header: t("table.is_inventory_adjustment"),
      accessorKey: (row: StockEntry) => row.is_inventory_adjustment ? <Badge>{t("common.yes")}</Badge> : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("navigation.stock_entries")}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("stock_entries.subtitle")}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/stock-entries/create")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("common.create")}
          </Button>
        </div>

        <div className="bg-white dark:bg-card rounded-lg">
          <div className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          <ResourceTable
            data={results}
            columns={columns}
            isLoading={isLoading}
            onDelete={(id) => handleDelete(id)}
            totalCount={totalCount}
            currentPage={page}
            pageSize={20}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
