import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type ClientType,
  useGetClientTypes,
  useUpdateClientType,
  useDeleteClientType,
} from "../api/client-type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, ArrowLeft, ArrowRight, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ClientTypesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<ClientType | null>(null);
  const [editName, setEditName] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);

  const { data: typesData, isLoading } = useGetClientTypes({
    params: { page, page_size: 20, name: searchTerm || undefined },
  });
  const updateClientType = useUpdateClientType();
  const deleteClientType = useDeleteClientType();

  const results = Array.isArray(typesData)
    ? typesData
    : typesData?.results || [];
  const totalPages =
    !Array.isArray(typesData) && typesData?.total_pages
      ? typesData.total_pages
      : 1;

  const handleEdit = (item: ClientType) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditIsActive(item.is_active);
  };

  const handleSaveEdit = async () => {
    if (!editingItem?.id) return;
    try {
      await updateClientType.mutateAsync({
        id: editingItem.id,
        data: { name: editName, is_active: editIsActive },
      });
      toast.success(t("messages.success.updated"));
      setEditingItem(null);
    } catch {
      toast.error(t("messages.error.update"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("messages.confirmation.delete"))) return;
    try {
      await deleteClientType.mutateAsync(id);
      toast.success(t("messages.success.deleted"));
    } catch {
      toast.error(t("messages.error.delete"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("navigation.client_types")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("client_types.description")}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/client-types/create")}>
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
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("messages.no_data_to_display")}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item: ClientType) => (
                <Card key={item.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {item.is_system && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                          system
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.is_active ? "active" : "inactive"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      {t("messages.edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => item.id && handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
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

        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("messages.edit")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forms.name")}</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                <Label>{t("forms.is_active")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                {t("buttons.cancel")}
              </Button>
              <Button onClick={handleSaveEdit}>{t("buttons.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
