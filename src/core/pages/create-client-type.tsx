import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateClientType } from "../api/client-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tag } from "lucide-react";
import { toast } from "sonner";

export default function CreateClientType() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createClientType = useCreateClientType();
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("messages.error.fill_required_fields"));
      return;
    }
    try {
      await createClientType.mutateAsync({
        name: name.trim(),
        is_active: isActive,
      });
      toast.success(t("messages.success.created"));
      navigate("/client-types");
    } catch {
      toast.error(t("messages.error.create"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/client-types")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("buttons.cancel")}
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t("client_types.create_title")}</h1>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("forms.name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("placeholders.enter_name")}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>{t("forms.is_active")}</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit">{t("buttons.save")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
