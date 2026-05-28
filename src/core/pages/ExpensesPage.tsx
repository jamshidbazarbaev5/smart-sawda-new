import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ResourceTable } from "../helpers/ResourseTable";
import { toast } from "sonner";
import type { Expense } from "../api/expense";
import { useGetExpenses, useDeleteExpense } from "../api/expense";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetStores } from "../api/store";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function ExpensesPage() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 30;
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStore, dateFrom, dateTo]);

  const { data: expensesData, isLoading } = useGetExpenses({
    params: {
      ...(selectedStore !== "all" && { store: selectedStore }),
      date_gte: dateFrom || undefined,
      date_lte: dateTo || undefined,
      page: currentPage,
    },
  });
  const deleteExpense = useDeleteExpense();

  const { data: storesData } = useGetStores({});

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];
  const expenses = Array.isArray(expensesData)
    ? expensesData
    : expensesData?.results || [];
  let totalCount = 0;
  if (Array.isArray(expensesData)) {
    totalCount = expensesData.length;
  } else if (expensesData && typeof expensesData.count === "number") {
    totalCount = expensesData.count;
  }

  const handleEdit = (expense: Expense) => {
    navigation(`/edit-expense/${expense.id}`);
  };

  const columns = [
    {
      header: t("forms.store"),
      accessorKey: "store_name",
      cell: (row: Expense) => row.store_name || "-",
    },
    {
      header: t("forms.amount"),
      accessorKey: "amount",
      cell: (row: Expense) => (
        <div className="text-center font-medium">
          {Number(row.amount).toLocaleString()} {row.currency?.symbol || ""}
        </div>
      ),
    },
    {
      header: t("forms.date"),
      accessorKey: "date",
      cell: (row: Expense) => (
        <p>
          {row.date
            ? new Date(row.date).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </p>
      ),
    },
    {
      header: t("forms.comment"),
      accessorKey: "comment",
      cell: (row: Expense) => row.comment || "-",
    },
  ];

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success(t("messages.success.expense_deleted"));
    } catch (error) {
      toast.error(t("messages.error.expense_delete"));
      console.error("Failed to delete expense:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.expenses")}</h1>
        <Button onClick={() => navigation("/create-expense")}>
          {t("common.create")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {currentUser?.is_superuser && (
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger>
              <SelectValue placeholder={t("placeholders.select_store")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_stores")}</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={String(store.id)}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder={t("forms.from_date")}
        />

        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder={t("forms.to_date")}
        />
      </div>

      <ResourceTable
        columns={columns}
        data={expenses}
        onDelete={currentUser?.is_superuser ? handleDelete : undefined}
        onEdit={currentUser?.is_superuser ? handleEdit : undefined}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        totalCount={totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}
