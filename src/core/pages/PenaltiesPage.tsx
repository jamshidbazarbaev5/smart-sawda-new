import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceTable } from "../helpers/ResourseTable";
import {
  useGetPenalties,
  useDeletePenalty,
  type Penalty,
} from "../api/penalty";
import { PlusIcon, Search, Ban } from "lucide-react";
import { useGetStores } from "../api/store";

const PENALTY_TYPES = ["late", "shortage", "damage", "absence", "other"];

export default function PenaltiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useGetPenalties({
    params: {
      page,
      search: search || undefined,
      store: storeFilter || undefined,
      penalty_type: typeFilter || undefined,
    },
  });
  const deletePenalty = useDeletePenalty();

  const { data: storesData } = useGetStores({});
  const stores: any[] = Array.isArray(storesData) ? storesData : (storesData as any)?.results || [];

  const penalties: Penalty[] = (data as any)?.results || [];
  const totalCount = (data as any)?.count || 0;

  const handleDelete = async (id: number) => {
    try {
      await deletePenalty.mutateAsync(id);
      toast.success(t("messages.success.deleted", { item: t("navigation.penalties") }));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("messages.error.delete", { item: t("navigation.penalties") }));
    }
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      late: "bg-yellow-100 text-yellow-800",
      shortage: "bg-red-100 text-red-800",
      damage: "bg-orange-100 text-orange-800",
      absence: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {t(`penalties.${type}`)}
      </Badge>
    );
  };

  const columns = [
    {
      header: t("table.id"),
      accessorKey: (row: Penalty) => row.id?.toString() || "—",
    },
    {
      header: t("forms.staff"),
      accessorKey: (row: Penalty) => row.staff_name || `#${row.staff}`,
    },
  
    {
      header: t("forms.penalty_type"),
      accessorKey: (row: Penalty) => typeBadge(row.penalty_type),
    },
    {
      header: t("forms.amount"),
      accessorKey: (row: Penalty) => Number(row.amount).toLocaleString(),
    },
    {
      header: t("forms.date"),
      accessorKey: (row: Penalty) => row.date || "—",
    },
    {
      header: t("forms.reason"),
      accessorKey: (row: Penalty) => row.reason || "—",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t("navigation.penalties")}</h1>
              <p className="text-sm text-muted-foreground">{t("penalties.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/create-penalty")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("common.create")}
          </Button>
        </div>

        <div className="bg-white dark:bg-card rounded-lg shadow-sm">
          <div className="p-4 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Select value={storeFilter} onValueChange={(v) => { setStoreFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder={t("forms.store")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {stores.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder={t("forms.penalty_type")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {PENALTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t(`penalties.${type}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ResourceTable<Penalty>
            data={penalties}
            columns={columns}
            isLoading={isLoading}
            onDelete={(id) => handleDelete(id)}
            totalCount={totalCount}
            currentPage={page}
            pageSize={30}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
