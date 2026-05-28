import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { useCreateShift } from "../api/shift";
import { useGetStores } from "../api/store";
import { useGetCashRegisters } from "../api/cash-register";
import { useGetUsers } from "../api/user";

export default function CreateShift() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createShift = useCreateShift();

  const [store, setStore] = useState("");
  const [register, setRegister] = useState("");
  const [cashier, setCashier] = useState("");
  const [openingCash, setOpeningCash] = useState("");
  const [openingComment, setOpeningComment] = useState("");

  const { data: storesData } = useGetStores({});
  const stores: any[] = Array.isArray(storesData) ? storesData : (storesData as any)?.results || [];

  const { data: cashRegistersData } = useGetCashRegisters();
  const cashRegisters: any[] = cashRegistersData || [];

  const { data: usersData } = useGetUsers({});
  const users: any[] = Array.isArray(usersData) ? usersData : (usersData as any)?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !register || !cashier) {
      toast.error(t("validation.required_field", { field: "" }));
      return;
    }
    try {
      await createShift.mutateAsync({
        store: parseInt(store),
        register: parseInt(register),
        cashier: parseInt(cashier),
        opening_cash: openingCash || "0",
        opening_comment: openingComment || undefined,
      } as any);
      toast.success(t("shifts.shift_opened"));
      navigate("/shifts");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("messages.error.create", { item: t("shifts.shift") }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/shifts")} className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("shifts.open_shift")}</h1>
            <p className="text-sm text-muted-foreground">{t("shifts.shifts")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("shifts.shift")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label>{t("forms.register")} *</Label>
                <Select value={register} onValueChange={setRegister}>
                  <SelectTrigger><SelectValue placeholder={t("placeholders.select_register")} /></SelectTrigger>
                  <SelectContent>
                    {cashRegisters.map((r: any) => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("forms.cashier")} *</Label>
                <Select value={cashier} onValueChange={setCashier}>
                  <SelectTrigger><SelectValue placeholder={t("placeholders.select_cashier")} /></SelectTrigger>
                  <SelectContent>
                    {users.map((u: any) => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("shifts.opening_cash")}</Label>
                <Input value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} placeholder="0" type="number" step="any" />
              </div>
              <div className="space-y-2">
                <Label>{t("forms.comment")}</Label>
                <Textarea value={openingComment} onChange={(e) => setOpeningComment(e.target.value)} placeholder={t("placeholders.enter_comment")} />
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/shifts")}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={createShift.isPending}>{createShift.isPending ? t("common.sending") : t("shifts.open_shift")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
