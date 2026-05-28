import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ResourceTable } from '../helpers/ResourseTable';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResourceForm } from '../helpers/ResourceForm';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { type WriteoffReason, useGetWriteoffReasons, useDeleteWriteoffReason, useUpdateWriteoffReason, useCreateWriteoffReason } from '../api/writeoff-reason';

const fields = (t: any) => [
  {
    name: 'name',
    label: t('forms.name'),
    type: 'text',
    placeholder: t('placeholders.enter_name'),
    required: true,
  },
  {
    name: 'is_active',
    label: t('forms.is_active'),
    type: 'checkbox',
  },
];

const columns = (t: any) => [
  {
    header: t('forms.name'),
    accessorKey: 'name',
  },
  {
    header: t('forms.is_system'),
    accessorKey: (row: WriteoffReason) => row.is_system
      ? <Badge variant="secondary">{t('common.yes')}</Badge>
      : '—',
  },
  {
    header: t('forms.is_active'),
    accessorKey: (row: WriteoffReason) => row.is_active !== false
      ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('common.yes')}</Badge>
      : <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t('common.no')}</Badge>,
  },
];

interface PaginatedResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_range: number[];
  results: WriteoffReason[];
}

export default function WriteoffReasonsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<WriteoffReason | null>(null);
  const { t } = useTranslation();

  const { data, isLoading } = useGetWriteoffReasons({});
  const deleteMutation = useDeleteWriteoffReason();
  const { mutate: updateMutation, isPending: isUpdating } = useUpdateWriteoffReason();
  const { mutate: createMutation, isPending: isCreating } = useCreateWriteoffReason();

  const items = (data as PaginatedResponse)?.results || [];

  const handleCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: WriteoffReason) => {
    setEditing(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('messages.confirm_delete'))) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(t('messages.success.deleted'));
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || t('messages.error.general'));
      }
    }
  };

  const handleSubmit = (data: WriteoffReason) => {
    if (editing?.id) {
      updateMutation(
        { id: editing.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('messages.success.updated'));
            setIsFormOpen(false);
            setEditing(null);
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.detail || t('messages.error.general'));
          },
        }
      );
    } else {
      createMutation(data, {
        onSuccess: () => {
          toast.success(t('messages.success.created', { item: t('navigation.writeoff_reasons') }));
          setIsFormOpen(false);
          setEditing(null);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || t('messages.error.general'));
        },
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('navigation.writeoff_reasons')}</h1>
        <Button onClick={handleCreate}>{t('common.create')}</Button>
      </div>

      <ResourceTable
        columns={columns(t)}
        data={items}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <ResourceForm<WriteoffReason>
            fields={fields(t)}
            onSubmit={handleSubmit}
            isSubmitting={editing?.id ? isUpdating : isCreating}
            title={editing ? t('messages.edit') : t('common.create')}
            defaultValues={editing || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
