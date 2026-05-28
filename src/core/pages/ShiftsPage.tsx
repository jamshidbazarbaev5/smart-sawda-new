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
import { Label } from "@/components/ui/label";
import { ResourceTable } from "../helpers/ResourseTable";
import {
  useGetShifts,
  useDeleteShift,
  useApproveShift,
  // useCloseShift,
  type Shift,
} from "../api/shift";
import { useGetStores } from "../api/store";
// import { useGetCashRegisters } from "../api/cash-register";
import { useGetUsers } from "../api/user";
import { PlusIcon, Search, Clock, CheckCircle } from "lucide-react";

export default function ShiftsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [registerFilter, setRegisterFilter] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  const { data, isLoading } = useGetShifts({
    params: {
      page,
      search: search || undefined,
      store: storeFilter || undefined,
      register: registerFilter || undefined,
      cashier: cashierFilter || undefined,
      is_active: isActiveFilter || undefined,
    },
  });
  const deleteShift = useDeleteShift();
  const approveShift = useApproveShift();

  const { data: storesData } = useGetStores({});
  const stores: any[] = Array.isArray(storesData) ? storesData : (storesData as any)?.results || [];
  // const { data: cashRegistersData } = useGetCashRegisters();
  // const cashRegisters: any[] = cashRegistersData || [];
  const { data: usersData } = useGetUsers({});
  const users: any[] = Array.isArray(usersData) ? usersData : (usersData as any)?.results || [];

  const shifts: Shift[] = (data as any)?.results || [];
  const totalCount = (data as any)?.count || 0;

  const handleDelete = async (id: number) => {
    try {
      await deleteShift.mutateAsync(id);
      toast.success(t("messages.success.deleted", { item: t("shifts.shift") }));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("messages.error.delete", { item: t("shifts.shift") }));
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveShift.mutateAsync(id);
      toast.success(t("shifts.shift_opened"));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Ошибка при утверждении");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return "—";
    }
  };

  const columns = [
    {
      header: t("table.id"),
      accessorKey: (row: Shift) => row.id?.toString() || "—",
    },
    {
      header: t("forms.store"),
      accessorKey: (row: Shift) => row.store_name || "—",
    },
    {
      header: t("shifts.register"),
      accessorKey: (row: Shift) => `#${row.register}`,
    },
    {
      header: t("shifts.cashier"),
      accessorKey: (row: Shift) => row.cashier_name || "—",
    },
    {
      header: t("shifts.opened_at"),
      accessorKey: (row: Shift) => formatDate(row.opened_at),
    },
    {
      header: t("shifts.closed_at"),
      accessorKey: (row: Shift) => row.closed_at ? formatDate(row.closed_at) : "—",
    },
    {
      header: t("shifts.opening_cash"),
      accessorKey: (row: Shift) => row.opening_cash || "0",
    },
    {
      header: t("forms.status"),
      accessorKey: (row: Shift) => row.is_active
        ? <Badge className="bg-green-100 text-green-800">{t("common.active")}</Badge>
        : <Badge variant="secondary">{t("common.closed")}</Badge>,
    },
    {
      header: t("forms.is_approved"),
      accessorKey: (row: Shift) => row.is_approved
        ? <Badge className="bg-green-100 text-green-800">{t("common.yes")}</Badge>
        : <Badge variant="destructive">{t("common.no")}</Badge>,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t("navigation.shifts")}</h1>
              <p className="text-sm text-muted-foreground">{t("shifts.shifts")}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/shifts/new")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("shifts.open_shift")}
          </Button>
        </div>

        <div className="bg-white dark:bg-card rounded-lg">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">{t("forms.store")}</Label>
                <Select value={storeFilter} onValueChange={(v) => { setStoreFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder={t("common.all")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {stores.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("shifts.register")}</Label>
                <Select value={registerFilter} onValueChange={(v) => { setRegisterFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder={t("common.all")} /></SelectTrigger>
                  {/* <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {cashRegisters.map((r: any) => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                    ))}
                  </SelectContent> */}
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("shifts.cashier")}</Label>
                <Select value={cashierFilter} onValueChange={(v) => { setCashierFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder={t("common.all")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {users.map((u: any) => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("forms.status")}</Label>
                <Select value={isActiveFilter} onValueChange={(v) => { setIsActiveFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder={t("common.all")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    <SelectItem value="true">{t("common.active")}</SelectItem>
                    <SelectItem value="false">{t("common.closed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ResourceTable<Shift>
            data={shifts}
            columns={columns}
            isLoading={isLoading}
            onDelete={(id) => handleDelete(id)}
            totalCount={totalCount}
            currentPage={page}
            pageSize={30}
            onPageChange={setPage}
            actions={(row: Shift) => row.id ? (
              <div className="flex gap-1">
                {row.is_awaiting_approval && (
                  <Button size="sm" variant="outline" onClick={() => handleApprove(row.id!)} className="h-8">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {t("shifts.approve")}
                  </Button>
                )}
              </div>
            ) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
