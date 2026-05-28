import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateCustomer } from "../api/customer";
import { useGetClientTypes } from "../api/client-type";
import { useGetCurrencies } from "../api/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function CreateCustomer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();
  const { data: clientTypesData } = useGetClientTypes({});
  const { data: currenciesData } = useGetCurrencies({});

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("pos");
  const [isActive, setIsActive] = useState(true);

  const clientTypes = Array.isArray(clientTypesData)
    ? clientTypesData
    : clientTypesData?.results || [];
  const currencies = Array.isArray(currenciesData)
    ? currenciesData
    : currenciesData?.results || [];

  const formatUzPhone = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("998")) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    return "+998" + digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      toast.error(t("messages.error.fill_required_fields"));
      return;
    }
    try {
      await createCustomer.mutateAsync({
        name: name.trim(),
        phone_number: phoneNumber,
        customer_type: customerType ? Number(customerType) : null,
        company_name: companyName || undefined,
        email: email || undefined,
        credit_limit: creditLimit || undefined,
        discount_percent: discountPercent || undefined,
        tax_id: taxId || undefined,
        address: address || undefined,
        notes: notes || undefined,
        source: source || "pos",
        is_active: isActive,
      });
      toast.success(t("messages.success.created"));
      navigate("/customers");
    } catch {
      toast.error(t("messages.error.create"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("buttons.cancel")}
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {t("customers.create_title")}
                </h1>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t("forms.name")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("placeholders.enter_name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("forms.phone")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatUzPhone(e.target.value))}
                    placeholder="+998"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("forms.client_type")}</Label>
                  <Select
                    value={customerType}
                    onValueChange={setCustomerType}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("placeholders.select_client_type")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypes.map((ct: any) => (
                        <SelectItem key={ct.id} value={String(ct.id)}>
                          {ct.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("forms.company_name")}</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t("placeholders.enter_company_name")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("forms.email")}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("forms.source")}</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("forms.credit_limit")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("forms.discount_percent")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("forms.tax_id")}</Label>
                  <Input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder={t("placeholders.enter_tax_id") || "INN"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("forms.address")}</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("placeholders.enter_address")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("forms.notes")}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("placeholders.enter_notes")}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>{t("forms.is_active")}</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/customers")}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button type="submit">{t("buttons.save")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
