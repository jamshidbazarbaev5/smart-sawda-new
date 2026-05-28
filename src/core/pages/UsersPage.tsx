import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { ResourceForm } from "../helpers/ResourceForm";
import { ResourceTable } from "../helpers/ResourseTable";
import { toast } from "sonner";
import { type User, useUpdateUser, useDeleteUser, useGetUsers } from "../api/user";
import { useGetRoles } from "../api/role";
import { useTranslation } from "react-i18next";
import { Users, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetStores } from "../api/store";

interface ExtendedUser extends User {
  store_read?: { id: number; name: string };
  role_read?: { id: number; name: string };
  is_superuser?: boolean;
}

const userFields = (t: any, roles: any[] = [], stores: any[] = []) => [
  {
    name: "name",
    label: t("forms.fio"),
    type: "text",
    placeholder: t("placeholders.enter_name"),
    required: true,
  },
  {
    name: "phone_number",
    label: t("forms.phone_number"),
    type: "text",
    placeholder: t("placeholders.enter_phone"),
    required: true,
  },
  {
    name: "role",
    label: t("forms.role"),
    type: "select",
    placeholder: t("placeholders.select_role"),
    required: true,
    options: roles.map((r: any) => ({ value: r.id, label: r.name })),
  },
  {
    name: "store",
    label: t("forms.store"),
    type: "select",
    placeholder: t("placeholders.select_store"),
    required: true,
    options: stores.map((s: any) => ({ value: s.id, label: s.name })),
  },
  {
    name: "is_active",
    label: t("forms.status"),
    type: "select",
    placeholder: t("placeholders.select_status"),
    required: true,
    options: [
      { value: true, label: t("common.active") },
      { value: false, label: t("common.inactive") },
    ],
  },
  {
    name: "is_mobile_user",
    label: t("forms.is_mobile_user"),
    type: "select",
    placeholder: t("placeholders.select_device"),
    required: true,
    defaultValue: true,
    options: [
      { value: true, label: t("common.mobile") },
      { value: false, label: t("common.desktop") },
    ],
  },
  {
    name: "can_view_quantity",
    label: t("forms.can_view_quantity"),
    type: "select",
    placeholder: t("placeholders.select_permission"),
    required: true,
    defaultValue: true,
    options: [
      { value: true, label: t("common.yes") },
      { value: false, label: t("common.no") },
    ],
  },
  {
    name: "can_view_cost_price",
    label: t("forms.can_view_cost_price"),
    type: "select",
    placeholder: t("placeholders.select_permission"),
    required: true,
    defaultValue: true,
    options: [
      { value: true, label: t("common.yes") },
      { value: false, label: t("common.no") },
    ],
  },
  {
    name: "can_view_profit",
    label: t("forms.can_view_profit"),
    type: "select",
    placeholder: t("placeholders.select_permission"),
    required: true,
    defaultValue: true,
    options: [
      { value: true, label: t("common.yes") },
      { value: false, label: t("common.no") },
    ],
  },
  {
    name: "fixed_salary",
    label: t("forms.fixed_salary"),
    type: "text",
    placeholder: t("placeholders.enter_salary"),
  },
  {
    name: "sales_percentage",
    label: t("forms.sales_percentage"),
    type: "text",
    placeholder: t("placeholders.enter_percentage"),
  },
  {
    name: "password",
    label: t("forms.password"),
    type: "password",
    placeholder: t("placeholders.enter_password"),
  },
];

export default function UsersPage() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;
  const { t } = useTranslation();

  const { data: staffsData, isLoading } = useGetUsers({
    params: {
      role: selectedRole === "all" ? undefined : selectedRole,
      store: selectedStore === "all" ? undefined : selectedStore,
      page: currentPage,
      page_size: pageSize,
    },
  });
  const { data: storesData } = useGetStores({});
  const { data: rolesData } = useGetRoles({});

  const results: any[] = Array.isArray(staffsData) ? staffsData : staffsData?.results || [];
  const totalCount = Array.isArray(staffsData) ? staffsData.length : staffsData?.count || 0;

  const users: ExtendedUser[] = results;
  const stores = Array.isArray(storesData) ? storesData : storesData?.results || [];
  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.results || [];

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const handleEdit = (user: ExtendedUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleUpdateSubmit = (data: any) => {
    if (!editingUser?.id) return;

    const updateData: Record<string, unknown> = {
      id: editingUser.id,
      name: data.name || "",
      phone_number: data.phone_number || "",
      role: data.role ? Number(data.role) : null,
      store: data.store ? Number(data.store) : null,
      is_active: data.is_active === "true" || data.is_active === true,
      is_mobile_user: data.is_mobile_user === "true" || data.is_mobile_user === true,
      can_view_quantity: data.can_view_quantity === "true" || data.can_view_quantity === true,
      can_view_cost_price: data.can_view_cost_price === "true" || data.can_view_cost_price === true,
      can_view_profit: data.can_view_profit === "true" || data.can_view_profit === true,
      fixed_salary: data.fixed_salary || undefined,
      sales_percentage: data.sales_percentage || undefined,
    };

    if (data.password) {
      updateData.password = data.password;
    }

    updateUser(updateData as unknown as User, {
      onSuccess: () => {
        const message = data.password
          ? t("messages.user_password_updated")
          : t("messages.user_updated");
        toast.success(message);
        setIsFormOpen(false);
        setEditingUser(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!id) return;
    if (!window.confirm(t("messages.confirm_delete") || "Вы уверены?")) return;
    deleteUser(id, {
      onSuccess: () => toast.success(t("messages.user_deleted")),
      onError: () => toast.error(t("messages.delete_failed")),
    });
  };

  const getRoleBadge = (user: any) => {
    const roleName = user.role_name|| String(user.role_name|| "");
    const colors: Record<string, string> = {
      admin: "bg-blue-100 text-blue-700",
      cashier: "bg-green-100 text-green-700",
      warehouse: "bg-orange-100 text-orange-700",
    };
    const colorClass = colors[roleName?.toLowerCase()] || "bg-gray-100 text-gray-700";
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
        {roleName}
      </span>
    );
  };

  const handleResetFilters = () => {
    setSelectedRole("all");
    setSelectedStore("all");
    setCurrentPage(1);
  };

  const columns = [
    {
      header: t("forms.fio"),
      accessorKey: "name",
      cell: (user: ExtendedUser) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.phone_number}</div>
        </div>
      ),
    },
    {
      header: t("forms.role"),
      accessorKey: "role",
      cell: (user: ExtendedUser) => getRoleBadge(user),
    },
    {
      header: t("forms.store"),
      accessorKey: "store_read",
      cell: (user: ExtendedUser) => user.store_read?.name || "-",
    },
    {
      header: t("forms.status"),
      accessorKey: "is_active",
      cell: (user: ExtendedUser) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {user.is_active ? t("common.active") : t("common.inactive")}
        </span>
      ),
    },
    {
      header: t("forms.is_mobile_user"),
      accessorKey: "is_mobile_user",
      cell: (user: ExtendedUser) => (
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
          {user.is_mobile_user ? t("common.mobile") : t("common.desktop")}
        </span>
      ),
    },
    {
      header: t("table.actions"),
      accessorKey: "actions",
      cell: (user: ExtendedUser) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
            className="hover:bg-primary/5 hover:text-primary">
            <Pencil className="w-4 h-4" />
          </Button>
          {!user.is_superuser && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(user.id!); }}
              className="hover:bg-red-50 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("navigation.users")}</h1>
        </div>
        <Button onClick={() => navigate("/create-user")} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t("common.create")}
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">{t("common.filters")}</h3>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            {t("common.reset") || "Сбросить"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedRole} onValueChange={(v) => { setSelectedRole(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder={t("placeholders.select_role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {roles.map((r: any) => (
                <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStore} onValueChange={(v) => { setSelectedStore(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder={t("placeholders.select_store")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("forms.all_stores")}</SelectItem>
              {stores.map((store: any) => (
                <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <ResourceTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalCount={totalCount}
        pageSize={pageSize}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogDescription className="mb-4" />
          <ResourceForm
            fields={userFields(t, roles, stores)}
            onSubmit={handleUpdateSubmit}
            defaultValues={{
              name: editingUser?.name,
              phone_number: editingUser?.phone_number,
              role: editingUser?.role?.toString() || "",
              store: editingUser?.store?.toString() || editingUser?.store_read?.id?.toString() || "",
              is_active: editingUser?.is_active !== undefined ? editingUser.is_active.toString() : "true",
              is_mobile_user: editingUser?.is_mobile_user !== undefined ? editingUser.is_mobile_user.toString() : "true",
              can_view_quantity: editingUser?.can_view_quantity !== undefined ? editingUser.can_view_quantity.toString() : "true",
              can_view_cost_price: (editingUser as any)?.can_view_cost_price !== undefined ? (editingUser as any).can_view_cost_price.toString() : "true",
              can_view_profit: (editingUser as any)?.can_view_profit !== undefined ? (editingUser as any).can_view_profit.toString() : "true",
              fixed_salary: (editingUser as any)?.fixed_salary || "",
              sales_percentage: (editingUser as any)?.sales_percentage || "",
            }}
            isSubmitting={isUpdating}
            title={t("common.edit")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
