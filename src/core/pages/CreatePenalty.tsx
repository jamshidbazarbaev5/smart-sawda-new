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
import { ArrowLeft, Ban } from "lucide-react";
import { useCreatePenalty } from "../api/penalty";
import { useGetStores } from "../api/store";
import { useGetCurrencies } from "../api/currency";
import { useGetUsers } from "../api/user";

const PENALTY_TYPES = ["late", "shortage", "damage", "absence", "other"];

export default function CreatePenalty() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createPenalty = useCreatePenalty();

  const [staff, setStaff] = useState("");
  const [store, setStore] = useState("");
  const [penaltyType, setPenaltyType] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const { data: storesData } = useGetStores({});
  const stores: any[] = Array.isArray(storesData) ? storesData : (storesData as any)?.results || [];
  const { data: currenciesData } = useGetCurrencies({});
  const currencies: any[] = Array.isArray(currenciesData) ? currenciesData : (currenciesData as any)?.results || [];
  const { data: usersData } = useGetUsers({});
  const staffs: any[] = Array.isArray(usersData) ? usersData : (usersData as any)?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !store || !penaltyType || !amount) {
      toast.error(t("validation.required_field", { field: "" }));
      return;
    }
    try {
      await createPenalty.mutateAsync({
        staff: parseInt(staff),
        store: parseInt(store),
        penalty_type: penaltyType,
        amount,
        currency: currency ? parseInt(currency) : undefined,
        date: date || undefined,
        reason: reason || undefined,
      } as any);
      toast.success(t("messages.success.created", { item: t("navigation.penalties") }));
      navigate("/penalties");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || t("messages.error.create", { item: t("navigation.penalties") }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/penalties")} className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Ban className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("common.create")} {t("navigation.penalties")}</h1>
            <p className="text-sm text-muted-foreground">{t("penalties.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("navigation.penalties")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forms.staff")} *</Label>
                <Select value={staff} onValueChange={setStaff}>
                  <SelectTrigger><SelectValue placeholder={t("placeholders.select_option")} /></SelectTrigger>
                  <SelectContent>
                    {staffs.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name || s.id?.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label>{t("forms.penalty_type")} *</Label>
                <Select value={penaltyType} onValueChange={setPenaltyType}>
                  <SelectTrigger><SelectValue placeholder={t("placeholders.select_option")} /></SelectTrigger>
                  <SelectContent>
                    {PENALTY_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt}>{t(`penalties.${pt}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("forms.amount")} *</Label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" type="number" step="any" />
                </div>
                <div className="space-y-2">
                  <Label>{t("forms.currency")}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue placeholder={t("placeholders.select_option")} /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name || c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("forms.date")}</Label>
                <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t("forms.reason")}</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("placeholders.enter_comment")} />
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/penalties")}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={createPenalty.isPending}>{createPenalty.isPending ? t("common.sending") : t("common.create")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
